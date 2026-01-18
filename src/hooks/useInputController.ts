import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { CanvasRenderLoopApi as LoopApi } from '@/hooks/useCanvasRenderLoop';
import type { GameActions, GameState } from '@/hooks/useGame';
import type { UsePointerLockApi as PointerApi } from '@/hooks/usePointerLock';
import type { TargetManagerActions } from '@/hooks/useTargetManager';
import type { VolumeActions } from '@/hooks/useVolume';
import type { Target } from '@/types/target';

type MouseEventLike = Pick<React.MouseEvent, 'movementX' | 'movementY'>;

export interface UseInputControllerOptions {
  pointer: PointerApi;
  loop: LoopApi;
  gameState: GameState;
  gameActions: GameActions;
  targetManagerActions: TargetManagerActions;
  volumeActions: VolumeActions;

  /** 초기 마우스 감도 값 */
  initialSensitivity: number;

  /** 감도 하한 (클램프용) */
  minSensitivity: number;

  /** 감도 상한 (클램프용) */
  maxSensitivity: number;

  /** 타겟 히트 시 추가 UI/로그 처리용 콜백 */
  onScore?: (t: Target) => void;
}

export interface UseInputControllerReturn {
  onMouseMove: (e: MouseEventLike) => void;
  onMouseDown: () => void;

  /** UI 표시용 */
  sensitivity: number;

  /** 외부에서 감도 직접 제어 */
  setSensitivity: (v: number) => void;
}

/**
 * 입력 매핑
 * - 포인터락 전제: 잠금 전에는 request만 수행
 * - 좌표계 전제: 카메라 기준으로 화면 중심(조준점)을 월드 좌표로 환산
 * - 전역 키다운은 게임 진행 중에만 구독(불필요한 리스너 상시 유지 방지)
 */
export const useInputController = ({
  pointer,
  loop,
  gameState,
  gameActions,
  targetManagerActions,
  volumeActions,
  initialSensitivity,
  minSensitivity,
  maxSensitivity,
  onScore,
}: UseInputControllerOptions): UseInputControllerReturn => {
  const sensRef = useRef(initialSensitivity);
  const [sensitivity, _setSensitivity] = useState(initialSensitivity);

  const setSensitivity = useCallback(
    (v: number) => {
      const clamped = Math.max(minSensitivity, Math.min(maxSensitivity, v));
      sensRef.current = clamped;
      _setSensitivity(clamped);
    },
    [minSensitivity, maxSensitivity]
  );

  const onMouseMove = useCallback(
    (event: MouseEventLike) => {
      if (!gameState.isGameStarted || !pointer.isLocked) return;

      const s = sensRef.current;
      loop.nudgeCamera(-event.movementX * s, -event.movementY * s);
    },
    [gameState.isGameStarted, pointer.isLocked, loop]
  );

  const onMouseDown = useCallback(() => {
    if (!gameState.isGameStarted) return;

    if (!pointer.isLocked) {
      void pointer.request();
      return;
    }

    // 조준점(화면 중심) = 카메라 이동의 역방향
    const cam = loop.getCamera();
    const screenX = -cam.x;
    const screenY = -cam.y;

    const isHit = targetManagerActions.checkHit(screenX, screenY, (target) => {
      gameActions.handleHit();
      gameActions.addScore(target.score || 0);
      onScore?.(target);
    });

    if (isHit) {
      volumeActions.playHitSound();
    } else {
      volumeActions.playMissSound();
      gameActions.handleClick();
    }
  }, [
    gameState.isGameStarted,
    pointer,
    loop,
    targetManagerActions,
    gameActions,
    volumeActions,
    onScore,
  ]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!gameState.isGameStarted) return;

      if (event.key === '[') {
        setSensitivity(sensRef.current - 0.1);
      } else if (event.key === ']') {
        setSensitivity(sensRef.current + 0.1);
      } else if (event.key === '`') {
        gameActions.endGame();
      }
    },
    [gameState.isGameStarted, setSensitivity, gameActions]
  );

  useEffect(() => {
    if (!gameState.isGameStarted) return;
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [gameState.isGameStarted, onKeyDown]);

  return useMemo(
    () => ({ onMouseMove, onMouseDown, sensitivity, setSensitivity }),
    [onMouseMove, onMouseDown, sensitivity, setSensitivity]
  );
};
