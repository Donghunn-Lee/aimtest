import { useCallback, useMemo, useRef, useState } from 'react';

import { TargetManager } from '@/components/game/core/target/TargetManager';
import { SPAWN, SYNC, TARGET_DEFAULT } from '@/constants/target';
import type { Target, TargetConfig } from '@/types/target';

export interface TargetManagerState {
  targets: Target[];
  targetConfig: TargetConfig;
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
  syncTargets: () => () => void;
  drawTargetContainer: (onDraw: (bounds: TargetContainer) => void) => void;
  getTargetSize: () => number | null;
}

const initialTargetConfig: TargetConfig = { ...TARGET_DEFAULT };

/**
 * TargetManager 어댑터
 * - rAF 스폰 루프: 프레임 누적(accum) 기반으로 스폰 간격을 흉내(스톨은 클램프)
 * - React 동기화: 렌더는 state(targets)로, 판정/생성은 인스턴스로 분리
 * - clear/stop 시 rAF·interval·state를 함께 정리해 잔상 방지
 */
export const useTargetManager = (): [
  TargetManagerState,
  TargetManagerActions,
] => {
  const targetManagerRef = useRef<TargetManager | null>(null);

  const [targetConfig, setTargetConfig] =
    useState<TargetConfig>(initialTargetConfig);
  const [targets, setTargets] = useState<Target[]>([]);

  const spawnerRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const accumMsRef = useRef<number>(0);
  const spawnerStartTimeRef = useRef<number | null>(null);

  const init = useCallback(
    (gameArea: { width: number; height: number }, resolution: number) => {
      if (targetManagerRef.current) {
        targetManagerRef.current.clearTargets();
      }

      setTargetConfig(initialTargetConfig);
      setTargets([]);

      targetManagerRef.current = new TargetManager(
        initialTargetConfig,
        gameArea,
        resolution
      );
    },
    []
  );

  const checkHit = useCallback(
    (x: number, y: number, onHit?: (target: Target) => void) => {
      if (!targetManagerRef.current) return null;

      const hitTarget = targetManagerRef.current.checkHit(x, y);

      if (hitTarget) {
        onHit?.(hitTarget);
        setTargets(targetManagerRef.current.getTargets());
      }

      return hitTarget;
    },
    []
  );

  const updateGameArea = useCallback((width: number, height: number) => {
    if (!targetManagerRef.current) return;
    targetManagerRef.current.updateGameArea(width, height);
  }, []);

  const computeSpawnInterval = useCallback((startTime: number) => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    // 최소 330ms, 1000ms부터 1.8%씩 지수적 감소 (기본값)
    const interval =
      SPAWN.BASE_INTERVAL_MS * Math.pow(SPAWN.DECAY_PER_SEC, elapsedSeconds);

    return Math.max(SPAWN.MIN_INTERVAL_MS, interval);
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

    const intervalMs = computeSpawnInterval(spawnerStartTimeRef.current);

    while (accumMsRef.current >= intervalMs) {
      accumMsRef.current -= intervalMs;

      const spawned = targetManagerRef.current.createTarget();
      if (spawned) {
        setTargets(targetManagerRef.current.getTargets());
      }
    }

    spawnerRef.current = requestAnimationFrame(spawnerTick);
  }, [computeSpawnInterval]);

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

    // 도메인 초기화와 함께 렌더링 소스도 즉시 비움(잔상/불일치 방지)
    setTargets([]);
  }, []);

  const syncTargets = useCallback(() => {
    if (!targetManagerRef.current) return () => {};

    const syncInterval = setInterval(() => {
      const updatedTargets = targetManagerRef.current?.getTargets() || [];
      setTargets(updatedTargets);
    }, SYNC.INTERVAL_MS);

    return () => clearInterval(syncInterval);
  }, []);

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

  const state: TargetManagerState = {
    targets,
    targetConfig,
  };

  const actions: TargetManagerActions = useMemo(
    () => ({
      init,
      startSpawner,
      stopSpawner,
      checkHit,
      updateGameArea,
      clearTargets,
      syncTargets,
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
      syncTargets,
      drawTargetContainer,
      getTargetSize,
    ]
  );

  return [state, actions];
};
