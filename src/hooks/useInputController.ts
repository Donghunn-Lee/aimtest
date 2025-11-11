import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react';

import type { Target } from '@/types/target';

import type { UsePointerLockReturn as PointerApi } from '@/hooks/usePointerLock';
import type { CanvasRenderLoopApi as LoopApi } from '@/hooks/useCanvasRenderLoop';
import type { GameState, GameStateActions } from '@/hooks/useGame';
import type { TargetManagerActions } from '@/hooks/useTargetManager';
import type { VolumeActionsType } from '@/hooks/useVolume';

type MouseEventLike = Pick<MouseEvent, 'movementX' | 'movementY'>;

export interface UseInputControllerParams {
  pointer: PointerApi;
  loop: LoopApi;
  gameState: GameState;
  gameActions: GameStateActions;
  targetManagerActions: TargetManagerActions;
  volumeActions: VolumeActionsType;

  /** 선택: 초기/최소/최대 민감도 설정 */
  initialSensitivity: number;
  minSensitivity: number;
  maxSensitivity: number;

  /** 선택: 해상도 비율 및 캔버스 초기화 시 사용 */
  selectedRatio?: number;

  /** 선택: 점수 플로팅 등 후처리 콜백 */
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
}: UseInputControllerParams): UseInputControllerReturn => {
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
