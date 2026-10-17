import { describe, expect, it } from 'vitest';

import { CANVAS_COLORS } from '@/constants/canvas';
import { SPAWN } from '@/constants/target';
import { computeSpawnInterval, decideTargetColor } from '@/utils/target';

describe('decideTargetColor', () => {
  const graceStartAt = 1_000_000;

  it('isGameOver면 유예 시각과 무관하게 expired', () => {
    expect(decideTargetColor(true, null)).toBe(CANVAS_COLORS.target.expired);
    expect(decideTargetColor(true, graceStartAt, graceStartAt + 500)).toBe(
      CANVAS_COLORS.target.expired
    );
  });

  it('graceStartAt이 null이면 base', () => {
    expect(decideTargetColor(false, null)).toBe(CANVAS_COLORS.target.base);
  });

  // 1초 단위 구간의 양 끝(999 · 1000 등)으로 < 비교의 경계를 본다
  it.each([
    [0, CANVAS_COLORS.target.warning],
    [999, CANVAS_COLORS.target.warning],
    [1000, CANVAS_COLORS.target.danger],
    [1999, CANVAS_COLORS.target.danger],
    [2000, CANVAS_COLORS.target.critical],
    [5000, CANVAS_COLORS.target.critical],
  ])('유예 경과 %ims → %s', (elapsedMs, expected) => {
    expect(
      decideTargetColor(false, graceStartAt, graceStartAt + elapsedMs)
    ).toBe(expected);
  });
});

describe('computeSpawnInterval', () => {
  it('경과 0ms → BASE', () => {
    expect(computeSpawnInterval(0)).toBe(SPAWN.BASE_INTERVAL_MS);
  });

  it('경과 1000ms → BASE × DECAY', () => {
    expect(computeSpawnInterval(1000)).toBeCloseTo(
      SPAWN.BASE_INTERVAL_MS * SPAWN.DECAY_PER_SEC
    );
  });

  // MIN에 닿기 전 구간(30초에 약 580ms)에서 단조 감소를 확인한다
  it('MIN에 닿기 전까지 단조 감소한다', () => {
    const samples = [0, 1000, 10_000, 30_000].map(computeSpawnInterval);

    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeLessThan(samples[i - 1]);
      expect(samples[i]).toBeGreaterThan(SPAWN.MIN_INTERVAL_MS);
    }
  });

  it('충분히 큰 경과(600000ms) → MIN', () => {
    expect(computeSpawnInterval(600_000)).toBe(SPAWN.MIN_INTERVAL_MS);
  });
});
