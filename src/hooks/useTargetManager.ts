import { useCallback, useState, useRef } from 'react';
import { TargetManager } from '../components/game/target/TargetManager';
import type { Target, TargetConfig } from '../types/target';

interface TargetManagerState {
  targets: Target[];
  targetConfig: TargetConfig;
}

interface TargetManagerActions {
  init: (
    gameArea: { width: number; height: number },
    resolution: number
  ) => void;
  checkHit: (
    x: number,
    y: number,
    onHit?: (target: Target) => void
  ) => Target | null;
  updateGameArea: (width: number, height: number) => void;
  decreaseSpawnInterval: (startTime: number) => void;
  clearTargets: () => void;
  updateSpawnInterval: () => void;
  syncTargets: (onTrigger?: () => void) => void;
  drawTargetContainer: (
    onDraw: (bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void
  ) => void;
}

const initialTargetConfig: TargetConfig = {
  size: 50,
  margin: 0,
  maxTargets: 200,
  spawnInterval: 1000,
};

const useTargetManager = (): [TargetManagerState, TargetManagerActions] => {
  const targetManagerRef = useRef<TargetManager | null>(null);
  const [targetConfig, setTargetConfig] =
    useState<TargetConfig>(initialTargetConfig);
  const [targets, setTargets] = useState<Target[]>([]);

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

  const decreaseSpawnInterval = useCallback((startTime: number) => {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const newInterval = Math.max(
      250, // 최소 간격 250ms
      1000 * Math.pow(0.98, elapsedSeconds) // 매초 2%씩 감소
    );
    setTargetConfig((prev) => ({
      ...prev,
      spawnInterval: newInterval,
    }));
  }, []);

  const clearTargets = useCallback(() => {
    if (!targetManagerRef.current) return;

    targetManagerRef.current.clearTargets();
  }, []);

  const updateSpawnInterval = useCallback(() => {
    if (!targetManagerRef.current) return;

    const spawnInterval = setInterval(() => {
      if (targetManagerRef.current) {
        const newTarget = targetManagerRef.current.createTarget();

        if (newTarget) {
          const updatedTargets = targetManagerRef.current.getTargets();
          setTargets(updatedTargets);
        }
      }
    }, targetConfig.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [targetConfig.spawnInterval]);

  const syncTargets = useCallback((onTrigger?: () => void) => {
    if (!targetManagerRef.current) return;

    const syncInterval = setInterval(() => {
      const updatedTargets = targetManagerRef.current?.getTargets() || [];
      setTargets(updatedTargets);
      onTrigger?.();
    }, 16);

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

  const state: TargetManagerState = {
    targets,
    targetConfig,
  };

  const actions: TargetManagerActions = {
    init,
    checkHit,
    updateGameArea,
    decreaseSpawnInterval,
    clearTargets,
    updateSpawnInterval,
    syncTargets,
    drawTargetContainer,
  };

  return [state, actions];
};

export default useTargetManager;
