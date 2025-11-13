import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UsePointerLockOptions {
  /** 보통 canvasRef */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /** false면 잠금 해제 보장 (게임 종료 등) */
  enabled?: boolean;
  /** 잠금 성공 시 */
  onLock?: () => void;
  /** 잠금 해제 시 */
  onUnlock?: () => void;
}

export interface UsePointerLockReturn {
  isLocked: boolean;
  /** elementRef 대상으로 포인터락 요청 */
  request: () => Promise<boolean>;
  /** 현재 포인터락 해제 */
  exit: () => void;
  /** 잠금 대상 엘리먼트(디버깅/조건 분기용) */
  lockedElement: HTMLCanvasElement | null;
}

export const usePointerLock = ({
  canvasRef,
  enabled = true,
  onLock,
  onUnlock,
}: UsePointerLockOptions): UsePointerLockReturn => {
  const [lockedElement, setLockedElement] = useState<HTMLCanvasElement | null>(
    null
  );
  const isLocked = !!lockedElement;
  const lastLockedRef = useRef<HTMLCanvasElement | null>(null);

  const syncState = useCallback(() => {
    // Strinct - 메인 캔버스 잠금만 확인
    const current = document.pointerLockElement ?? null;
    const target = canvasRef.current;
    const curCanvas = (
      current === target ? target : null
    ) as HTMLCanvasElement | null;

    setLockedElement(curCanvas);

    // onLock / onUnlock 콜백
    const isLocked = !!curCanvas;
    const wasLocked = !!lastLockedRef.current;
    if (isLocked && !wasLocked) onLock?.();
    if (!isLocked && wasLocked) onUnlock?.();
    lastLockedRef.current = curCanvas;
  }, [canvasRef, onLock, onUnlock]);

  // pointerlockchange / error 리스너
  useEffect(() => {
    const onChange = () => syncState();
    const onError = () => {
      // 실패 케이스에서도 상태 동기화만
      syncState();
    };
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

  // enabled=false가 되면 즉시 해제
  useEffect(() => {
    if (!enabled && document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, [enabled]);

  const request = useCallback(async (): Promise<boolean> => {
    const el = canvasRef.current;
    if (!el) return false;
    try {
      // 일부 브라우저는 프로미스 반환 X
      // @ts-ignore
      await el.requestPointerLock?.();
      // 실제 잠금 여부는 pointerlockchange에서 최종 반영
      return true;
    } catch {
      return false;
    }
  }, [canvasRef, enabled]);

  const exit = useCallback(() => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }, []);

  return useMemo(
    () => ({ isLocked, request, exit, lockedElement }),
    [isLocked, request, exit, lockedElement]
  );
};
