import type { GameRuntimeRef } from '@/components/game/core/GameWorld';
import { GAMEPLAY } from '@/constants/game';
import type { UseBorderFadeApi } from '@/hooks/useBorderFade';
import type { GameState, GameActions } from '@/hooks/useGame';
import type {
  TargetManagerActions,
  TargetManagerState,
} from '@/hooks/useTargetManager';
import type { VolumeActions } from '@/hooks/useVolume';
import { useEffect } from 'react';

export interface UseGameRuntimeOptions {
  gameState: GameState;
  gameActions: GameActions;
  targetManagerState: TargetManagerState;
  targetManagerActions: TargetManagerActions;
  volumeActions: VolumeActions;
  borderFade: UseBorderFadeApi;
  gameRuntimeRef: React.RefObject<GameRuntimeRef>;
}

/**
 * 게임 런타임 사이드이펙트 관리 훅
 * - 타이머·BGM·경계 테두리·타겟 스포너 등 게임 진행 중 발생하는 효과 처리
 * - gameState 변화에 따라 타겟 동기화·그레이스 타이머 트리거
 * - GameWorld 외부에서 필요로 하는 runtime ref 값(graceStartAt, isGameOver) 갱신
 */
export const useGameRuntime = (options: UseGameRuntimeOptions) => {
  const {
    gameState,
    gameActions,
    targetManagerState,
    targetManagerActions,
    volumeActions,
    borderFade,
    gameRuntimeRef,
  } = options;

  // 경과 시간 동기화
  useEffect(() => {
    if (!gameState.isGameStarted || gameState.isGameOver) return;
    const id = setInterval(
      () => gameActions.updatePlayTime(),
      GAMEPLAY.ELAPSED_TICK_MS
    );
    return () => clearInterval(id);
  }, [gameState.isGameStarted, gameState.isGameOver]);

  // BGM + 타겟 컨테이너 테두리
  useEffect(() => {
    if (gameState.isGameStarted) {
      volumeActions.playBGM();
      borderFade.start();
    } else {
      borderFade.show();
      volumeActions.stopBGM();
    }
  }, [gameState.isGameStarted]);

  // 타겟 스포너
  useEffect(() => {
    if (gameState.isGameStarted && gameState.startTime) {
      targetManagerActions.startSpawner(gameState.startTime);
      return () => targetManagerActions.stopSpawner();
    }
    targetManagerActions.stopSpawner();
  }, [gameState.isGameStarted, gameState.startTime]);

  // 타겟 상태 동기화 (프레임/주기 단위)
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    return targetManagerActions.syncTargets();
  }, [gameState.isGameStarted, targetManagerActions]);

  // 그레이스 타이머 / 타겟 색상 트리거
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

  // gameRuntimeRefs 동기화
  useEffect(() => {
    gameRuntimeRef.current.graceStartAt = gameState.graceStartAt;
    gameRuntimeRef.current.isGameOver = gameState.isGameOver;
  }, [gameState.graceStartAt, gameState.isGameOver]);
};
