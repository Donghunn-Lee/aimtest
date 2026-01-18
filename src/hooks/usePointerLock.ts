import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UsePointerLockOptions {
  /** 보통 canvasRef */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  /** false면 잠금 해제 보장 (게임 종료 등) */
  enabled?: boolean;

  onLock?: () => void;
  onUnlock?: () => void;
}

export interface UsePointerLockApi {
  isLocked: boolean;

  /** canvasRef 대상으로 포인터락 요청 */
  request: () => Promise<boolean>;

  /** 현재 포인터락 해제 */
  exit: () => void;
}

/**
 * Pointer Lock 제어
 * - 잠금 대상은 “메인 캔버스”로 제한(다른 엘리먼트 잠금은 무시)
 * - enabled=false 시 잠금 강제 해제(게임 종료 경계)
 * - 최종 상태는 pointerlockchange 이벤트로만 확정
 */
export const usePointerLock = ({
  canvasRef,
  enabled = true,
  onLock,
  onUnlock,
}: UsePointerLockOptions): UsePointerLockApi => {
  const [isLocked, setIsLocked] = useState(false);
  const lastLockedRef = useRef<HTMLCanvasElement | null>(null);

  const syncState = useCallback(() => {
    const current = document.pointerLockElement ?? null;
    const target = canvasRef.current;

    // 메인 캔버스가 잠겼을 때만 “locked”로 간주
    const curCanvas = (
      current === target ? target : null
    ) as HTMLCanvasElement | null;

    const nextLocked = !!curCanvas;
    const prevLocked = !!lastLockedRef.current;

    if (nextLocked && !prevLocked) onLock?.();
    if (!nextLocked && prevLocked) onUnlock?.();

    lastLockedRef.current = curCanvas;
    setIsLocked(nextLocked);
  }, [canvasRef, onLock, onUnlock]);

  useEffect(() => {
    const onChange = () => syncState();
    const onError = () => syncState();

    document.addEventListener('pointerlockchange', onChange);
    document.addEventListener('pointerlockerror', onError);

    return () => {
      document.removeEventListener('pointerlockchange', onChange);
      document.removeEventListener('pointerlockerror', onError);
    };
  }, [syncState]);

  useEffect(() => {
    syncState();
  }, [syncState]);

  useEffect(() => {
    // 게임 종료/비활성화 시 잠금 상태를 남기지 않음
    if (!enabled && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, [enabled]);

  const request = useCallback(async (): Promise<boolean> => {
    const el = canvasRef.current;
    if (!el) return false;

    try {
      // 일부 브라우저는 Promise를 반환하지 않음(이벤트로 최종 확정)
      await el.requestPointerLock?.();
      return true;
    } catch {
      return false;
    }
  }, [canvasRef]);

  const exit = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  return useMemo(
    () => ({ isLocked, request, exit }),
    [isLocked, request, exit]
  );
};
