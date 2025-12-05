import { useCallback, useState, useRef, useMemo } from 'react';

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
  /** 게임 영역/해상도 변경 시 TargetManager 재초기화 */
  init: (
    gameArea: { width: number; height: number },
    resolution: number
  ) => void;

  /** 게임 시작 시점 기준으로 스폰 난이도 곡선 초기화 후 rAF 스폰 루프 시작 */
  startSpawner: (startTime: number) => void;

  /** 스폰 루프 중단 및 내부 타이밍 상태 리셋 */
  stopSpawner: () => void;

  /** 화면 좌표(x, y) 기준 히트 판정, 맞으면 onHit 콜백 호출 */
  checkHit: (
    x: number,
    y: number,
    onHit?: (target: Target) => void
  ) => Target | null;

  /** 캔버스/맵 크기 변경 시 게임 영역 반영 */
  updateGameArea: (width: number, height: number) => void;

  clearTargets: () => void;

  /** TargetManager 내부 타겟 배열을 주기적으로 React state와 동기화(setInterval) */
  syncTargets: () => void;

  /** 타겟 컨테이너(bounds)를 계산해 콜백에 전달(렌더러에서 사용) */
  drawTargetContainer: (onDraw: (bounds: TargetContainer) => void) => void;

  /** 현재 타겟 픽셀 크기 조회(플로팅 스코어/히트 영역 계산 등에서 사용) */
  getTargetSize: () => number | null;
}

const initialTargetConfig: TargetConfig = { ...TARGET_DEFAULT };

/**
 * 타겟 스폰/관리 엔진(TargetManager)을 React 상태/액션 형태로 감싸는 훅
 * - TargetManager 인스턴스 생성/초기화 및 게임 영역 갱신
 * - rAF 기반 스폰 루프(start/stopSpawner)로 난이도 곡선 적용
 * - setInterval 기반 타겟 배열 동기화(syncTargets)
 * - 히트 판정(checkHit), 컨테이너 bounds, 타겟 크기 조회 등 렌더러/게임 로직에 필요한 API 제공
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

  const syncTargets = useCallback(() => {
    if (!targetManagerRef.current) return;

    const syncInterval = setInterval(() => {
      const updatedTargets = targetManagerRef.current?.getTargets() || [];
      setTargets(updatedTargets);
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
