import { useCallback, useMemo, useRef, useState } from 'react';

import { TargetManager } from '@/components/game/core/target/TargetManager';
import { SPAWN, TARGET_DEFAULT } from '@/constants/target';
import type { Target, TargetConfig } from '@/types/target';
import { computeSpawnInterval } from '@/utils/target';

export interface TargetManagerState {
  /** 유예 판정용. 스폰 · 히트 · clear · init 시점에만 갱신된다 */
  targetCount: number;
}

export type TargetContainer = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface TargetManagerActions {
  init: (
    gameArea: { width: number; height: number },
    resolution: number
  ) => void;
  startSpawner: (startTime: number) => void;
  stopSpawner: () => void;
  checkHit: (
    x: number,
    y: number,
    onHit?: (target: Target) => void
  ) => Target | null;
  updateGameArea: (width: number, height: number) => void;
  clearTargets: () => void;
  getTargets: () => readonly Target[];
  drawTargetContainer: (onDraw: (bounds: TargetContainer) => void) => void;
  getTargetSize: () => number | null;
}

const initialTargetConfig: TargetConfig = { ...TARGET_DEFAULT };
const EMPTY_TARGETS: readonly Target[] = [];

/**
 * TargetManager 어댑터
 * - rAF 스폰 루프: 프레임 누적(accum) 기반으로 스폰 간격을 흉내(스톨은 클램프)
 * - 타겟 배열은 인스턴스에만 두고 렌더 루프가 직접 읽는다. React에는 유예 판정용
 *   targetCount만 두며 프레임마다가 아니라 스폰·히트·clear·init 시점에만 갱신
 * - clear/stop 시 rAF·state를 함께 정리해 잔상 방지
 */
export const useTargetManager = (): [
  TargetManagerState,
  TargetManagerActions,
] => {
  const targetManagerRef = useRef<TargetManager | null>(null);

  const [targetCount, setTargetCount] = useState(0);

  const spawnerRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const accumMsRef = useRef<number>(0);
  const spawnerStartTimeRef = useRef<number | null>(null);

  const init = useCallback(
    (gameArea: { width: number; height: number }, resolution: number) => {
      if (targetManagerRef.current) {
        targetManagerRef.current.clearTargets();
      }

      targetManagerRef.current = new TargetManager(
        initialTargetConfig,
        gameArea,
        resolution
      );
      setTargetCount(0);
    },
    []
  );

  const checkHit = useCallback(
    (x: number, y: number, onHit?: (target: Target) => void) => {
      if (!targetManagerRef.current) return null;

      const hitTarget = targetManagerRef.current.checkHit(x, y);

      if (hitTarget) {
        onHit?.(hitTarget);
        setTargetCount(targetManagerRef.current.getTargetCount());
      }

      return hitTarget;
    },
    []
  );

  const updateGameArea = useCallback((width: number, height: number) => {
    if (!targetManagerRef.current) return;
    targetManagerRef.current.updateGameArea(width, height);
  }, []);

  const spawnerTick = useCallback(() => {
    if (!targetManagerRef.current || spawnerStartTimeRef.current == null) {
      spawnerRef.current = null;
      return;
    }

    const now = performance.now();
    const last = lastTsRef.current ?? now;

    // 탭 비활성/스톨 시 한 프레임에 과도 스폰되는 것을 방지
    const dt = Math.min(now - last, SPAWN.STALL_CLAMP_MS);

    lastTsRef.current = now;
    accumMsRef.current += dt;

    const intervalMs = computeSpawnInterval(
      Date.now() - spawnerStartTimeRef.current
    );

    while (accumMsRef.current >= intervalMs) {
      accumMsRef.current -= intervalMs;

      const spawned = targetManagerRef.current.createTarget();
      if (spawned) {
        setTargetCount(targetManagerRef.current.getTargetCount());
      }
    }

    spawnerRef.current = requestAnimationFrame(spawnerTick);
  }, []);

  const startSpawner = useCallback(
    (startTime: number) => {
      if (!targetManagerRef.current) return;

      spawnerStartTimeRef.current = startTime;
      accumMsRef.current = 0;
      lastTsRef.current = null;

      if (spawnerRef.current != null) cancelAnimationFrame(spawnerRef.current);
      spawnerRef.current = requestAnimationFrame(spawnerTick);
    },
    [spawnerTick]
  );

  const stopSpawner = useCallback(() => {
    if (spawnerRef.current != null) cancelAnimationFrame(spawnerRef.current);

    spawnerRef.current = null;
    lastTsRef.current = null;
    accumMsRef.current = 0;
    spawnerStartTimeRef.current = null;
  }, []);

  const clearTargets = useCallback(() => {
    if (!targetManagerRef.current) return;

    targetManagerRef.current.clearTargets();
    setTargetCount(0);
  }, []);

  const getTargets = useCallback(
    () => targetManagerRef.current?.getTargets() ?? EMPTY_TARGETS,
    []
  );

  const drawTargetContainer = useCallback(
    (onDraw: (bounds: TargetContainer) => void) => {
      if (!targetManagerRef.current) return;

      const bounds = targetManagerRef.current.getMapBounds();
      onDraw(bounds);
    },
    []
  );

  const getTargetSize = useCallback(() => {
    return targetManagerRef.current?.getTargetSize() ?? null;
  }, []);

  const state: TargetManagerState = useMemo(
    () => ({ targetCount }),
    [targetCount]
  );

  const actions: TargetManagerActions = useMemo(
    () => ({
      init,
      startSpawner,
      stopSpawner,
      checkHit,
      updateGameArea,
      clearTargets,
      getTargets,
      drawTargetContainer,
      getTargetSize,
    }),
    [
      init,
      startSpawner,
      stopSpawner,
      checkHit,
      updateGameArea,
      clearTargets,
      getTargets,
      drawTargetContainer,
      getTargetSize,
    ]
  );

  return [state, actions];
};
