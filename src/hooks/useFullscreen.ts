import type { GameMode } from '@/types/game';
import { useEffect } from 'react';

export interface UseFullscreenOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  gameMode: GameMode;
  onExit: () => void;
}

export const useFullscreen = (options: UseFullscreenOptions) => {
  const { containerRef, gameMode, onExit } = options;

  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement && gameMode === 'fullscreen') {
        onExit();
      }
    };

    const handleClick = () => {
      if (
        gameMode === 'fullscreen' &&
        containerRef.current &&
        !document.fullscreenElement
      ) {
        requestAnimationFrame(() => {
          try {
            if (containerRef.current) containerRef.current.requestFullscreen();
          } catch {
            // 오류 무시: Chrome 브라우저에서 전체화면 모드 변경 시 버그 존재
          }
        });
      }
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('click', handleClick);
    };
  }, [gameMode, onExit, containerRef]);
};
