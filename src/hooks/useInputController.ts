import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { CanvasRenderLoopApi as LoopApi } from '@/hooks/useCanvasRenderLoop';
import type { GameActions, GameState } from '@/hooks/useGame';
import type { UsePointerLockApi as PointerApi } from '@/hooks/usePointerLock';
import type { TargetManagerActions } from '@/hooks/useTargetManager';
import type { VolumeActions } from '@/hooks/useVolume';
import type { Target } from '@/types/target';

type MouseEventLike = Pick<MouseEvent, 'movementX' | 'movementY'>;

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
  sensitivity: number; // UI 표시용
  setSensitivity: (v: number) => void; // 직접 제어도 가능
}

/**
 * 마우스/키보드/포인터 입력 관리
 * - 마우스 이동 → 카메라 누적 이동 (loop.nudgeCamera)
 * - 마우스 클릭 → 포인터락 요청/타겟 히트 판정/사운드/스코어 처리
 * - 키보드 → 감도 조절('[' , ']') 및 즉시 종료(`)
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

  // 마우스 이동
  const onMouseMove = useCallback(
    (event: MouseEventLike) => {
      if (!gameState.isGameStarted || !pointer.isLocked) return;
      const s = sensRef.current;
      loop.nudgeCamera(-event.movementX * s, -event.movementY * s);
    },
    [gameState.isGameStarted, pointer.isLocked, loop]
  );

  // 마우스 클릭
  const onMouseDown = useCallback(() => {
    if (!gameState.isGameStarted) return;

    if (!pointer.isLocked) {
      void pointer.request();
      return;
    }

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

  // 키보드 입력
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
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return useMemo(
    () => ({ onMouseMove, onMouseDown, sensitivity, setSensitivity }),
    [onMouseMove, onMouseDown, sensitivity, setSensitivity]
  );
};
