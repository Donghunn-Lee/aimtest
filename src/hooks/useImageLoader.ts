import { useEffect, useRef, useState } from 'react';

import { calculateAspectFit } from '@/utils/image';
import type { LoadingStatus } from '@/types/image';

interface ImageLoaderProps {
  src: string;
  canvas: HTMLCanvasElement | null;
  drawSize: { width: number; height: number };
}

export function useImageLoader({ src, canvas, drawSize }: ImageLoaderProps) {
  const imgRef = useRef<HTMLImageElement>(new Image());
  const [status, setStatus] = useState<LoadingStatus>('idle');

  const onLoad = () => {
    if (!canvas) return;
    calculateAspectFit(
      imgRef.current,
      canvas.height,
      canvas.width,
      drawSize,
      2
    );
  };

  useEffect(() => {
    const img = imgRef.current;
    let canceled = false;

    setStatus('loading');

    const handleLoad = () => {
      if (canceled) return;
      setStatus('loaded');
      if (canvas) {
        calculateAspectFit(
          imgRef.current,
          canvas.height,
          canvas.width,
          drawSize,
          2
        );
      }
    };

    const handleError = () => {
      setStatus('error');
      console.error('Failed to load image:', src);
    };

    const handleResize = () => {
      if (status === 'loaded') {
        onLoad?.();
      }
    };

    img.src = src;
    img.onload = handleLoad;
    img.onerror = handleError;
    window.addEventListener('resize', handleResize);

    return () => {
      img.onload = null;
      img.onerror = null;
      window.removeEventListener('resize', handleResize);
    };
  }, [src, onLoad, status]);

  return { image: imgRef.current, imageStatus: status };
}
