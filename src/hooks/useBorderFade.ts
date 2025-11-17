import { useCallback, useEffect, useRef } from 'react';

import { UI } from '@/constants/game';

export interface UseBorderFadeApi {
  start: () => void;
  show: () => void;
}

export const useBorderFade = (
  borderOpacityRef: React.RefObject<number>
): UseBorderFadeApi => {
  const rafRef = useRef<number | null>(null);

  const start = useCallback(() => {
    const t0 = performance.now();
    const tick = () => {
      const t = performance.now();
      const p = Math.min(1, (t - t0) / UI.BORDER_FADE_MS);
      borderOpacityRef.current = UI.BORDER_OPACITY * (1 - p);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current && cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const show = useCallback(() => {
    rafRef.current && cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    borderOpacityRef.current = UI.BORDER_OPACITY;
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );
  return { start, show };
};
