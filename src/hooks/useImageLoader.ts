import { useEffect, useRef, useState } from 'react';

export function useImageLoader(
  src: string,
  onLoad?: (image: HTMLImageElement) => void
) {
  const imgRef = useRef<HTMLImageElement>(new Image());
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );

  useEffect(() => {
    const img = imgRef.current;

    const handleLoad = () => {
      setStatus('loaded');
      onLoad?.(imgRef.current);
    };

    const handleError = () => {
      setStatus('error');
      console.error('Failed to load image:', src);
    };

    img.src = src;
    img.onload = handleLoad;
    img.onerror = handleError;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onLoad]);

  return { image: imgRef.current, status };
}
