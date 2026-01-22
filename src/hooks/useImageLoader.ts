import { useCallback, useEffect, useRef, useState } from 'react';

import type { LoadingStatus } from '@/types/image';
import { calculateAspectFit } from '@/utils/image';

/**
 * src 단위 firstLoaded 달성 여부 기억
 * - 언마운트/리마운트와 무관하게 앱 런타임 동안 유지
 * - 재진입 시 로딩 UI 방지 목적
 */
const firstLoadedSrcSet = new Set<string>();

export interface UseImageLoaderOptions {
  src: string;
  canvas: HTMLCanvasElement | null;
  canvasPxSize: { width: number; height: number };

  /** calculateAspectFit 결과로 캔버스에 실제로 그릴 영역 크기 저장 */
  drawSize: { width: number; height: number };
}

export type UseImageLoaderResult = {
  image: HTMLImageElement | null;
  status: LoadingStatus;
  firstLoaded: boolean;
};

/**
 * 캔버스 배경 이미지 로더 훅
 * - src 변경 시 로딩 상태 관리(loading/loaded/error)
 * - firstLoaded는 “연출(지연 표시)”용 플래그로만 사용
 * - aspect-fit 재계산은 canvas/resize/deps 트리거에서만 수행
 */
export const useImageLoader = (
  options: UseImageLoaderOptions
): UseImageLoaderResult => {
  const { src, canvas, drawSize, canvasPxSize } = options;

  const imgRef = useRef<HTMLImageElement>(new Image());

  const [status, setStatus] = useState<LoadingStatus>('idle');
  const [firstLoaded, setFirstLoaded] = useState(false);

  const firstLoadedRef = useRef(false);
  const statusRef = useRef<LoadingStatus>('idle');
  const firstLoadedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    const cachedFirstLoaded = firstLoadedSrcSet.has(src);

    // 캐시 히트면 firstLoaded를 즉시 true로 시작(재진입 로딩 UI 방지)
    firstLoadedRef.current = cachedFirstLoaded;
    setFirstLoaded(cachedFirstLoaded);

    // src 변경 시 상태는 새 로딩 사이클로 초기화
    setStatus('idle');

    if (firstLoadedTimeoutRef.current) {
      clearTimeout(firstLoadedTimeoutRef.current);
      firstLoadedTimeoutRef.current = null;
    }
  }, [src]);

  const applyAspectFit = useCallback(() => {
    if (!canvas) return;

    calculateAspectFit(
      imgRef.current,
      canvas.height,
      canvas.width,
      drawSize,
      2
    );
  }, [canvas, drawSize]);

  useEffect(() => {
    const img = imgRef.current;

    setStatus('loading');

    const handleLoad = () => {
      setStatus('loaded');

      // firstLoaded는 “연출용 지연 표시”로만 사용(ready 판정과 분리)
      if (!firstLoadedRef.current) {
        firstLoadedRef.current = true;
        firstLoadedSrcSet.add(src);

        firstLoadedTimeoutRef.current = setTimeout(() => {
          setFirstLoaded(true);
        }, 500);
      }

      applyAspectFit();
    };

    const handleError = () => {
      // if (canceledRef.current) return;
      setStatus('error');
      console.error('Failed to load image:', src);
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;

    return () => {
      // 로드 이벤트/지연 콜백의 setState 경계

      img.onload = null;
      img.onerror = null;

      if (firstLoadedTimeoutRef.current) {
        clearTimeout(firstLoadedTimeoutRef.current);
        firstLoadedTimeoutRef.current = null;
      }
    };
  }, [src, applyAspectFit]);

  // 캔버스 크기/해상도(deps) 변경 시점에만 aspect-fit 재계산(이미 로드된 상태에서만)
  useEffect(() => {
    if (!canvas) return;
    if (statusRef.current !== 'loaded') return;

    applyAspectFit();
  }, [canvasPxSize.width, canvasPxSize.height, applyAspectFit]);

  // 윈도우 리사이즈는 “로드 완료 후”에만 재계산
  useEffect(() => {
    const handleResize = () => {
      if (statusRef.current !== 'loaded') return;
      applyAspectFit();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [applyAspectFit]);

  return { image: imgRef.current, status, firstLoaded };
};
