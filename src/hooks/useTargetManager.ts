import { useCallback, useState, useRef } from 'react';

import { TargetManager } from '@/components/game/core/target/TargetManager';

import type { Target, TargetConfig } from '@/types/target';

import { SPAWN, SYNC, TARGET_DEFAULT } from '@/constants/target';

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
  syncTargets: (onTrigger?: () => void) => void;
  drawTargetContainer: (onDraw: (bounds: TargetContainer) => void) => void;
  getTargetSize: () => number | null;
}

const initialTargetConfig: TargetConfig = { ...TARGET_DEFAULT };

const useTargetManager = (): [TargetManagerState, TargetManagerActions] => {
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

      const hitTarget = targetManagerRef.current?.checkHit(x, y);

      if (hitTarget) {
        onHit?.(hitTarget);
        setTargets(targetManagerRef.current?.getTargets() || []);
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
    // 330ms 최소 간격, 1.8%씩 지수적 감소
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
    const dt = Math.min(now - last, SPAWN.STALL_CLAMP_MS); // 100ms 이상은 무시(스톨 방지)
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
  }, []);

  const syncTargets = useCallback((onTrigger?: () => void) => {
    if (!targetManagerRef.current) return;

    const syncInterval = setInterval(() => {
      const updatedTargets = targetManagerRef.current?.getTargets() || [];
      setTargets(updatedTargets);
      onTrigger?.();
    }, SYNC.INTERVAL_MS);

    return () => clearInterval(syncInterval);
  }, []);

  const drawTargetContainer = useCallback(
    (
      onDraw: (bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => void
    ) => {
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

  const actions: TargetManagerActions = {
    init,
    startSpawner,
    stopSpawner,
    checkHit,
    updateGameArea,
    clearTargets,
    syncTargets,
    drawTargetContainer,
    getTargetSize,
  };

  return [state, actions];
};

export default useTargetManager;
