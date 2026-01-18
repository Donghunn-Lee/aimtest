import { useEffect } from 'react';

import type { GameRuntimeRef } from '@/components/game/core/GameWorld';
import { GAMEPLAY } from '@/constants/game';
import type { UseBorderFadeApi } from '@/hooks/useBorderFade';
import type { GameActions, GameState } from '@/hooks/useGame';
import type {
  TargetManagerActions,
  TargetManagerState,
} from '@/hooks/useTargetManager';
import type { VolumeActions } from '@/hooks/useVolume';

export interface UseGameRuntimeOptions {
  gameState: GameState;
  gameActions: GameActions;
  targetManagerState: TargetManagerState;
  targetManagerActions: TargetManagerActions;
  volumeActions: VolumeActions;
  borderFadeActions: UseBorderFadeApi;
  gameRuntimeRef: React.RefObject<GameRuntimeRef>;
}

/**
 * 게임 런타임 사이드이펙트 통합
 * - 게임 진행 중에만 필요한 타이머/스포너/BGM/페이드 제어
 * - 타겟 수 임계치 기반 그레이스 타이머 트리거
 * - rAF 루프에서 참조하는 runtime ref 동기화
 */
export const useGameRuntime = (options: UseGameRuntimeOptions) => {
  const {
    gameState,
    gameActions,
    targetManagerState,
    targetManagerActions,
    volumeActions,
    borderFadeActions: borderFade,
    gameRuntimeRef,
  } = options;

  // 경과 시간 tick
  useEffect(() => {
    if (!gameState.isGameStarted || gameState.isGameOver) return;

    const id = setInterval(
      () => gameActions.updatePlayTime(),
      GAMEPLAY.ELAPSED_TICK_MS
    );

    return () => clearInterval(id);
  }, [gameState.isGameStarted, gameState.isGameOver, gameActions]);

  // BGM / 테두리 페이드 전환
  useEffect(() => {
    if (gameState.isGameStarted) {
      volumeActions.playBGM();
      borderFade.start();
      return;
    }

    borderFade.show();
    volumeActions.stopBGM();
  }, [gameState.isGameStarted, volumeActions, borderFade]);

  // 타겟 스포너 시작/정지
  useEffect(() => {
    if (gameState.isGameStarted && gameState.startTime) {
      targetManagerActions.startSpawner(gameState.startTime);
      return () => targetManagerActions.stopSpawner();
    }

    targetManagerActions.stopSpawner();
  }, [gameState.isGameStarted, gameState.startTime, targetManagerActions]);

  // 타겟 상태 동기화
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    return targetManagerActions.syncTargets();
  }, [gameState.isGameStarted, targetManagerActions]);

  // 그레이스 타이머 트리거
  useEffect(() => {
    if (!gameState.isGameStarted) {
      gameActions.cancelGraceTimer();
      return;
    }

    const overload =
      targetManagerState.targets.length >= GAMEPLAY.GRACE_TARGET_THRESHOLD;

    if (overload) {
      gameActions.triggerGraceTimer();
    } else {
      gameActions.cancelGraceTimer();
    }
  }, [gameState.isGameStarted, targetManagerState.targets.length, gameActions]);

  // rAF 참조용 runtime ref 동기화
  useEffect(() => {
    gameRuntimeRef.current.graceStartAt = gameState.graceStartAt;
    gameRuntimeRef.current.isGameOver = gameState.isGameOver;
  }, [gameState.graceStartAt, gameState.isGameOver, gameRuntimeRef]);
};
