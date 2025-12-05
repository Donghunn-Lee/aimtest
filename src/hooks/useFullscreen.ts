import type { GameMode } from '@/types/game';
import { useEffect } from 'react';

export interface UseFullscreenOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  gameMode: GameMode;
  onExit: () => void;
}

/**
 * 전체화면 모드 제어 훅
 * - gameMode가 'fullscreen'일 때 클릭 시 전체화면 진입
 * - 사용자가 ESC, `키(커스텀) 등으로 전체화면을 종료하면 onExit 호출
 * - 브라우저 fullscreenchange 이벤트 기반으로 상태 동기화
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
