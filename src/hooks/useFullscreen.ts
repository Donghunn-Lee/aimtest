import { useEffect } from 'react';

import type { GameMode } from '@/types/game';

export interface UseFullscreenOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  gameMode: GameMode;
  onExit: () => void;
}

/**
 * 전체화면 모드 제어
 * - fullscreen 모드에서 컨테이너 클릭 시 진입 요청
 * - fullscreenchange 기반으로 종료 감지 후 onExit 호출
 * - 브라우저/권한 정책으로 실패할 수 있어 실패는 무시한다
 */
export const useFullscreen = (options: UseFullscreenOptions) => {
  const { containerRef, gameMode, onExit } = options;

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement && gameMode === 'fullscreen') {
        onExit();
      }
    };

    const handleClick = () => {
      const el = containerRef.current;

      if (gameMode !== 'fullscreen' || !el || document.fullscreenElement) {
        return;
      }

      // 사용자 제스처 직후에만 성공하는 브라우저가 있어 rAF로 한 번 미룬다
      requestAnimationFrame(() => {
        const current = containerRef.current;
        if (!current) return;

        void current.requestFullscreen().catch(() => {
          // 실패 무시
        });
      });
    };

    const el = containerRef.current;

    document.addEventListener('fullscreenchange', handleChange);
    el?.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      el?.removeEventListener('click', handleClick);
    };
  }, [containerRef, gameMode, onExit]);
};
