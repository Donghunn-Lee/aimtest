import { afterEach, describe, expect, it, vi } from 'vitest';

import { TargetManager } from '@/components/game/core/target/TargetManager';
import { TARGET_DEFAULT } from '@/constants/target';
import type { TargetConfig } from '@/types/target';
import {
  calculateContainerBounds,
  getDefaultConfig,
} from '@/utils/targetContainer';

const RESOLUTION = 16 / 9;
const GAME_AREA = { width: 1920, height: 1080 };
const BOUNDS = calculateContainerBounds(
  GAME_AREA,
  getDefaultConfig(RESOLUTION)
);

const createManager = (overrides: Partial<TargetConfig> = {}) =>
  new TargetManager({ ...TARGET_DEFAULT, ...overrides }, GAME_AREA, RESOLUTION);

// generateTarget은 x · y 순서로 Math.random을 두 번 호출한다
const mockRandomSequence = (values: number[]) => {
  const spy = vi.spyOn(Math, 'random');
  for (const v of values) spy.mockReturnValueOnce(v);
  return spy;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('TargetManager', () => {
  describe('size 파생', () => {
    it('config.size가 아니라 bounds.width / 18로 파생된다', () => {
      const manager = createManager({ size: 50 });

      expect(manager.getTargetSize()).toBeCloseTo(BOUNDS.width / 18);
      expect(manager.getTargetSize()).not.toBe(50);
    });
  });

  describe('createTarget', () => {
    it('maxTargets에 도달하면 null을 반환한다', () => {
      const manager = createManager({ maxTargets: 2 });
      mockRandomSequence([0.1, 0.1, 0.9, 0.9]);

      expect(manager.createTarget()).not.toBeNull();
      expect(manager.createTarget()).not.toBeNull();
      expect(manager.createTarget()).toBeNull();
      expect(manager.getTargets()).toHaveLength(2);
    });

    it('중심 거리가 size/2 미만이면 다른 위치로 재시도한다', () => {
      const manager = createManager();
      const spy = mockRandomSequence([0.5, 0.5, 0.5, 0.5, 0.1, 0.1]);

      const first = manager.createTarget();
      const second = manager.createTarget();

      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      expect(second!.x).not.toBeCloseTo(first!.x);
      // 1회 생성(2) + 겹침 1회(2) + 성공 1회(2)
      expect(spy).toHaveBeenCalledTimes(6);
    });

    it('100회 모두 겹치면 null을 반환한다', () => {
      const manager = createManager();
      const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

      expect(manager.createTarget()).not.toBeNull();
      expect(manager.createTarget()).toBeNull();
      // 1회 생성(2) + 재시도 100회 × 2
      expect(spy).toHaveBeenCalledTimes(202);
      expect(manager.getTargets()).toHaveLength(1);
    });

    // random의 양 끝(0 · 1 직전)에서 bounds 경계를 넘지 않는지
    it.each([0, 0.999])('random %s에서 bounds 안에 생성된다', (random) => {
      const manager = createManager();
      vi.spyOn(Math, 'random').mockReturnValue(random);

      const target = manager.createTarget();

      expect(target).not.toBeNull();
      expect(target!.x).toBeGreaterThanOrEqual(BOUNDS.x);
      expect(target!.x).toBeLessThanOrEqual(BOUNDS.x + BOUNDS.width);
      expect(target!.y).toBeGreaterThanOrEqual(BOUNDS.y);
      expect(target!.y).toBeLessThanOrEqual(BOUNDS.y + BOUNDS.height);
    });
  });

  describe('checkHit', () => {
    const createCenteredTarget = () => {
      const manager = createManager();
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const target = manager.createTarget()!;
      return { manager, target, radius: target.size / 2 };
    };

    // 각 구간의 경계(<=)와 그 직후 값을 함께 본다. y는 고정해 거리 = |dx|가 되게 한다
    it.each([
      ['d = 0', () => 0, 3],
      ['d = r/3', (r: number) => r / 3, 3],
      ['d = r/3 초과', (r: number) => (r / 3) * 1.01, 2],
      ['d = r/1.5', (r: number) => r / 1.5, 2],
      ['d = r/1.5 초과', (r: number) => (r / 1.5) * 1.01, 1],
      ['d = r', (r: number) => r, 1],
    ])('%s → %i점', (_label, distanceOf, expected) => {
      const { manager, target, radius } = createCenteredTarget();

      const hit = manager.checkHit(target.x + distanceOf(radius), target.y);

      expect(hit?.score).toBe(expected);
    });

    it('d = r 초과 → null', () => {
      const { manager, target, radius } = createCenteredTarget();

      expect(manager.checkHit(target.x + radius * 1.01, target.y)).toBeNull();
      expect(manager.getTargets()).toHaveLength(1);
    });

    it('겹친 두 타겟은 나중에 생성된(최상단) 쪽이 맞는다', () => {
      const manager = createManager();
      // 두 번째를 첫 번째에서 0.75 × size만큼 옆에 둔다(size/2 이상이라 생성 허용, size 미만이라 겹침)
      const offsetRatio = 0.75 / 18;
      mockRandomSequence([0.5, 0.5, 0.5 + offsetRatio, 0.5]);

      const first = manager.createTarget()!;
      const second = manager.createTarget()!;

      const hit = manager.checkHit((first.x + second.x) / 2, first.y);

      expect(hit?.id).toBe(second.id);
      expect(manager.getTargets().map((t) => t.id)).toEqual([first.id]);
    });

    it('맞은 타겟은 목록에서 빠진다', () => {
      const { manager, target } = createCenteredTarget();

      const hit = manager.checkHit(target.x, target.y);

      expect(hit?.id).toBe(target.id);
      expect(manager.getTargets()).toHaveLength(0);
      expect(manager.checkHit(target.x, target.y)).toBeNull();
    });
  });

  describe('updateGameArea', () => {
    it('기존 타겟과 이후 생성 타겟의 size가 새 bounds로 재파생된다', () => {
      const manager = createManager();
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      const existing = manager.createTarget()!;

      const nextArea = { width: 960, height: 540 };
      manager.updateGameArea(nextArea.width, nextArea.height);

      const nextSize =
        calculateContainerBounds(nextArea, getDefaultConfig(RESOLUTION)).width /
        18;

      expect(nextSize).not.toBeCloseTo(BOUNDS.width / 18);
      expect(existing.size).toBeCloseTo(nextSize);
      expect(manager.getTargetSize()).toBeCloseTo(nextSize);

      vi.spyOn(Math, 'random').mockReturnValue(0.1);
      expect(manager.createTarget()!.size).toBeCloseTo(nextSize);
    });
  });
});
