import { useState, useCallback } from 'react';

import { GameWorld } from '@/components/game/core/GameWorld';

function App() {
  const [gameMode, setGameMode] = useState<'fullscreen' | 'windowed' | null>(
    null
  );

  const startGame = useCallback((mode: 'fullscreen' | 'windowed') => {
    setGameMode(mode);
  }, []);

  const handleGameModeChange = useCallback(
    (newMode: 'windowed' | 'fullscreen') => {
      setGameMode(newMode);
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] p-8 text-white">
      {!gameMode ? (
        <div className="mt-32 max-w-3xl p-8 text-center">
          <h1 className="mb-8 text-5xl font-bold text-[#00ff00] [text-shadow:0_0_10px_rgba(0,255,0,0.5)]">
            FPS Aim Test
          </h1>

          <div className="mb-12 space-y-4">
            <p className="text-xl text-gray-300">
              당신의 FPS 에임능력을 테스트해보세요!
            </p>
            <p className="text-xl text-gray-300">
              화면에 나타나는 타겟을 빠르고 정확하게 맞추는 게임입니다.
            </p>
          </div>

          <div className="flex justify-center gap-8">
            <button
              className="rounded-lg bg-[#00ff00] px-8 py-4 text-xl font-bold text-black transition-all duration-300 hover:scale-105 hover:bg-[#00cc00] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
              onClick={() => startGame('fullscreen')}
            >
              전체화면 모드
            </button>
            <button
              className="rounded-lg border-2 border-[#00ff00] bg-[#333333] px-8 py-4 text-xl font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#444444] hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
              onClick={() => startGame('windowed')}
            >
              창 모드
            </button>
          </div>
          <footer className="mt-12 w-full space-y-6 text-left text-xs text-gray-500">
            <div className="flex w-full flex-col gap-2">
              <p className="p-0 font-bold">Developed by Ethan</p>
              <div className="flex flex-col gap-1">
                <p className="flex items-center gap-1">
                  Email:
                  <a
                    href="mailto:dh82680@gmail.com"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    dh82680@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-1">
                  GitHub:
                  <a
                    href="https://github.com/Donghunn-Lee/aimtest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    https://github.com/Donghunn-Lee/aimtest
                  </a>
                </p>
              </div>
            </div>
            <div>
              <p>
                <span className="text-gray-400">BGM</span>
                <span className="mx-2">/</span>
                <span className="font-medium">니아</span>
                <span className="mx-2">/</span>
                <span>SellBuyMusic</span>
                <span className="mx-2">/</span>
                <a
                  href="https://sellbuymusic.com/md/mqqtckh-dffhnkh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-400"
                >
                  https://sellbuymusic.com/md/mqqtckh-dffhnkh
                </a>
              </p>
            </div>
          </footer>
        </div>
      ) : (
        <GameWorld
          gameMode={gameMode}
          onGameModeChange={handleGameModeChange}
        />
      )}
    </div>
  );
}

export default App;
