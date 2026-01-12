import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { GameModeButton } from '@/components/common/GameModeButton';
import { MouseIcon } from '@/components/common/Icons';
import { GameWorld } from '@/components/game/core/GameWorld';
import { checkHealth } from '@/services/rankingService';
import type { GameMode } from '@/types/game';

type ServerStatus = 'checking' | 'online' | 'offline';

export const App = () => {
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');

  // 상태별 색상 및 텍스트 매핑
  const statusConfig = {
    checking: {
      color: 'bg-yellow-500',
      text: 'Checking Server...',
      animate: 'animate-pulse',
    },
    online: {
      color: 'bg-[#00ff00]',
      text: 'Server Online',
      animate: 'animate-pulse',
    },
    offline: { color: 'bg-red-500', text: 'Server Offline', animate: '' },
  };

  const currentStatus = statusConfig[serverStatus];

  // 마우스 조명 효과
  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMouse);
    return () => window.removeEventListener('mousemove', updateMouse);
  }, []);

  // 서버 상태 체크 로직
  useEffect(() => {
    const checkServer = async () => {
      const isOnline = await checkHealth();
      setServerStatus(isOnline ? 'online' : 'offline');
    };

    checkServer();
  }, []);

  // 모드 선택 후 게임 창 전환
  const startGame = useCallback(async (mode: GameMode) => {
    if (mode === 'fullscreen') {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.error('전체화면 요청 실패:', err);
      }
    }
    setGameMode(mode);
  }, []);

  // 전체화면 종료
  const handleBackToMain = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setGameMode(null);
  }, []);

  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] text-white">
      {/* 1. 배경 그리드 */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. 마우스 스포트라이트 (메인 메뉴에서만 보임) */}
      {!gameMode && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 0, 0.15), transparent 40%)`,
          }}
        />
      )}

      <AnimatePresence mode="wait">
        {!gameMode ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center p-4"
          >
            {/* 3. 글래스 카드 */}
            <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-md md:p-12">
              <div className="mb-10 text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 inline-block rounded-full border border-[#00ff00]/30 bg-[#00ff00]/10 px-3 py-1 text-xs font-bold tracking-widest text-[#00ff00]"
                >
                  BETA v2.0
                </motion.div>
                <h1 className="mb-4 text-5xl font-black tracking-tighter text-white md:text-7xl">
                  FPS{' '}
                  <span className="bg-gradient-to-r from-[#00ff00] to-[#006600] bg-clip-text text-transparent">
                    AIM TEST
                  </span>
                </h1>
                <p className="text-lg text-gray-400">
                  반응속도와 정확도를 극한까지 끌어올리세요.
                </p>
              </div>

              <div className="w-full">
                {/* 1. PC 환경 (md 이상): 원래대로 버튼 표시 */}
                <div className="hidden flex-col gap-4 sm:flex-row sm:justify-center md:flex">
                  <GameModeButton
                    label="전체화면 모드"
                    subLabel="실제 게임같은 몰입감"
                    onClick={() => startGame('fullscreen')}
                    primary
                  />
                  <GameModeButton
                    label="창 모드"
                    subLabel="가볍게 즐기기"
                    onClick={() => startGame('windowed')}
                  />
                </div>

                {/* 2. 모바일 환경 (md 미만): 버튼 숨기고 안내 문구 표시 */}
                <div className="flex flex-col items-center justify-center gap-4 py-8 text-center md:hidden">
                  {/* 마우스 아이콘으로 직관적인 힌트 주기 */}
                  <div className="rounded-full bg-white/5 p-4 ring-1 ring-white/10">
                    <MouseIcon className="h-8 w-8 text-gray-400" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-gray-200">
                      PC Environment Required
                    </h3>
                    <p className="px-6 text-sm text-gray-500">
                      원활한 게임 플레이를 위해
                      <br />
                      <span className="text-[#00ff00]">마우스</span>가 있는
                      PC에서 접속해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-center gap-6 border-t border-white/10 pt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${currentStatus.color} ${currentStatus.animate}`}
                  />
                  <span
                    className={serverStatus === 'offline' ? 'text-red-400' : ''}
                  >
                    {currentStatus.text}
                  </span>
                </div>
                <div>Running on React Engine</div>
              </div>
            </div>

            <footer className="mt-12 w-full max-w-2xl text-center">
              <div className="mb-4 flex flex-col items-center justify-center gap-2 text-xs text-gray-500 sm:flex-row sm:gap-6">
                <p className="font-bold text-gray-400">Developed by Ethan</p>
                <span className="hidden text-gray-700 sm:block">|</span>
                <div className="flex gap-4">
                  <a
                    href="mailto:dh82680@gmail.com"
                    className="transition-colors hover:text-[#00ff00]"
                  >
                    Email
                  </a>
                  <a
                    href="https://github.com/Donghunn-Lee/aimtest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#00ff00]"
                  >
                    GitHub
                  </a>
                </div>
              </div>

              <div className="text-[10px] text-gray-600 opacity-70 transition-opacity hover:opacity-100">
                <span className="font-bold text-gray-500">BGM</span>
                <span className="mx-2">/</span>
                <span className="text-gray-400">니아</span>
                <span className="mx-2">/</span>
                <a
                  href="https://sellbuymusic.com/md/mqqtckh-dffhnkh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-gray-600 underline-offset-2 transition-colors hover:text-[#00ff00] hover:decoration-[#00ff00]"
                >
                  SellBuyMusic
                </a>
              </div>
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="game-world"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full w-full"
          >
            <GameWorld
              gameMode={gameMode}
              onGameModeChange={setGameMode}
              onBackToMain={handleBackToMain}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
