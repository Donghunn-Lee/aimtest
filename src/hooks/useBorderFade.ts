import { useCallback, useEffect, useRef } from 'react';

import { UI } from '@/constants/game';

export interface UseBorderFadeApi {
  start: () => void;
  show: () => void;
}

/**
 * 게임 테두리(Border) 페이드 효과 관리 훅
 * - start: 일정 시간(UI.BORDER_FADE_MS)에 걸쳐 서서히 투명해짐
 * - show: 즉시 최대 불투명도(UI.BORDER_OPACITY)로 복구
 * - requestAnimationFrame 기반으로 부드러운 페이드 처리
 */
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

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const show = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
