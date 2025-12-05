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

export interface UsePointerLockApi {
  isLocked: boolean;
  /** elementRef 대상으로 포인터락 요청 */
  request: () => Promise<boolean>;
  /** 현재 포인터락 해제 */
  exit: () => void;
}

/**
 * Canvas 대상 브라우저 Pointer Lock 상태 관리 훅
 * - pointerlockchange 이벤트 기반으로 잠금 상태 동기화
 * - enabled=false 시 현재 잠금 강제 해제
 * - request/exit API로 게임 로직에서 포인터락 제어
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
    // Strict - 메인 캔버스 잠금만 확인
    const current = document.pointerLockElement ?? null;
    const target = canvasRef.current;
    const curCanvas = (
      current === target ? target : null
    ) as HTMLCanvasElement | null;

    const nextLocked = !!curCanvas;
    const prevLocked = !!lastLockedRef.current;

    // 락/언락 이벤트 감지
    if (nextLocked && !prevLocked) onLock?.();
    if (!nextLocked && prevLocked) onUnlock?.();

    lastLockedRef.current = curCanvas;
    setIsLocked(nextLocked);
  }, [canvasRef, onLock, onUnlock]);

  // pointerlockchange / error 발생 시 상태 동기화
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
