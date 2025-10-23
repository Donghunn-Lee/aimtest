import {
  useRef,
  useEffect,
  useState,
  type MouseEvent,
  useCallback,
} from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { Crosshair } from '@components/game/ui/Crosshair';
import { renderTargets } from '@/components/game/core/renderers/targetRenderer';
import StartMenu from '@components/game/menu/StartMenu';
import ResultMenu from '@components/game/menu/ResultMenu';
import RankingBoard from '@components/game/ranking/RankingBoard';
import { GameStatus } from '@/components/game/ui/GameStatus';
import { renderMapAndBounds } from '@/components/game/core/renderers/mapRenderer';
import GameGuide from '@components/game/ui/GameGuide';
import {
  addFloatingScore,
  drawFloatingScores,
  updateFloatingScores,
} from '@/components/game/core/renderers/floatingScoreRenderer';

import type { Position, Size, MouseMovement } from '@/types/game';
import { Target } from '@/types/target';
import type { Resolution } from '@/types/image';

import { useImageLoader } from '@hooks/useImageLoader';
import { useGame } from '@/hooks/useGame';
import useTargetManager from '@hooks/useTargetManager';
import useVolume from '@/hooks/useVolume';

import {
  clearCanvas,
  applyCameraTransform,
  endCameraTransform,
  setCanvasSizeDPR,
} from '@utils/canvas';
import { DEFAULT_RESOLUTION } from '@/utils/image';
import { LoadingOverlay } from '@/components/game/ui/LoadingOverlay';

interface GameWorldProps {
  gameMode: 'fullscreen' | 'windowed';
  onGameModeChange?: (mode: 'fullscreen' | 'windowed') => void;
}

export const GameWorld = ({ gameMode, onGameModeChange }: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const targetsRef = useRef<Target[]>([]);
  const gameRef = useRef({
    graceStartAt: null as number | null,
    isGameOver: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerLocked = useRef(false);
  const mouseMovement = useRef<MouseMovement>({ x: 0, y: 0 });
  const position = useRef<Position>({ x: 0, y: 100 });
  const drawSizeRef = useRef<Size>({ width: 0, height: 0 });
  const borderOpacity = useRef(0.7);
  const fadeAnimationFrame = useRef<number | null>(null);
  const mouseSensitivity = useRef(1);

  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(DEFAULT_RESOLUTION);
  const [sensitivityDisplay, setSensitivityDisplay] = useState(1);

  const { image, imageStatus } = useImageLoader({
    src: '/map.svg',
    canvas: canvasRef.current,
    drawSize: drawSizeRef.current,
  });
  const [gameState, gameActions] = useGame();
  const [targetManagerState, targetManagerActions] = useTargetManager();
  const [volumeState, volumeActions] = useVolume();
  const [showMenu, setShowMenu] = useState(false);

  // 게임 시작 핸들러
  const handleGameStart = () => {
    gameActions.startGame();
    targetManagerActions.init(
      {
        width: canvasRef.current?.width || 0,
        height: canvasRef.current?.height || 0,
      },
      selectedResolution.ratio
    );
    // 고정 틱 누적 기반 스폰 시작
    if (gameState.startTime) {
      targetManagerActions.startSpawner(gameState.startTime);
    }
    try {
      canvasRef.current?.requestPointerLock();
    } catch (error) {
      // 포인터락 요청 실패 시 게임 시작 취소
      gameActions.resetGame();
    }
  };

  // 포인터 잠금 상태 변경 핸들러
  const handlePointerLockChange = () => {
    if (!canvasRef.current) return;
    isPointerLocked.current = document.pointerLockElement === canvasRef.current;

    // 포인터락이 해제되었을 때 게임 상태 처리
    if (!isPointerLocked.current && gameState.isGameStarted) {
      gameActions.endGame();
    }
  };

  // 마우스 이동 핸들러
  const handleMouseMove = (event: MouseEvent) => {
    if (!gameState.isGameStarted) return;
    if (isPointerLocked.current) {
      mouseMovement.current = {
        x: event.movementX,
        y: event.movementY,
      };
    }
  };

  // 마우스 클릭 핸들러
  const handleMouseDown = (event: MouseEvent) => {
    if (!gameState.isGameStarted) return;
    if (!canvasRef.current) return;

    if (!isPointerLocked.current) {
      // 게임이 시작된 상태에서만 포인터락 요청
      if (gameState.isGameStarted) {
        try {
          canvasRef.current.requestPointerLock();
        } catch (error) {
          // 포인터락 요청 실패 시 무시
        }
      }
    } else if (targetManagerState) {
      const screenX = -position.current.x;
      const screenY = -position.current.y;

      const isHited = targetManagerActions.checkHit(
        screenX,
        screenY,
        (target) => {
          gameActions.handleHit();
          gameActions.addScore(target.score || 0);

          addFloatingScore(
            target.x,
            target.y,
            target.score || 0,
            target.score == 3
          );
        }
      );

      if (isHited) {
        volumeActions.playHitSound();
      } else {
        volumeActions.playMissSound();
        gameActions.handleClick();
      }
    }
  };

  // 타겟 컨테이너 페이드아웃 애니메이션
  const startFadeOut = () => {
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // 1초 동안 0.7에서 0으로 선형적으로 감소
        borderOpacity.current = 0.7 * (1 - elapsed / duration);
        fadeAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        borderOpacity.current = 0;
      }
    };

    animate();
  };

  // 타겟 컨테이너 테두리 표시
  const showBorder = () => {
    if (fadeAnimationFrame.current) {
      fadeAnimationFrame.current = null;
    }
    borderOpacity.current = 0.7;
  };

  // Canvas context 초기화
  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, [canvasRef.current]);

  // 초기 타겟 매니저 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!gameState.isGameStarted) {
      targetManagerActions.init(
        {
          width: canvas.width,
          height: canvas.height,
        },
        selectedResolution.ratio
      );
    }

    return () => {
      if (!gameState.isGameStarted) {
        targetManagerActions.clearTargets();
      }
    };
  }, [selectedResolution]);

  // 캔버스 크기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      let displayWidth: number;
      let displayHeight: number;

      if (gameMode === 'fullscreen') {
        const resolutionRatio = selectedResolution.ratio;
        const screenRatio = window.innerWidth / window.innerHeight;

        if (screenRatio > resolutionRatio) {
          displayHeight = window.innerHeight;
          displayWidth = displayHeight * resolutionRatio;
        } else {
          displayWidth = window.innerWidth;
          displayHeight = displayWidth / resolutionRatio;
        }
      } else {
        const maxWidth = window.innerWidth - 48;
        const maxHeight = window.innerHeight - 48;

        const targetRatio = selectedResolution.ratio;
        let width = maxWidth;
        let height = width / targetRatio;

        if (height > maxHeight) {
          height = maxHeight;
          width = height * targetRatio;
        }

        displayWidth = width;
        displayHeight = height;
      }

      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      setCanvasSizeDPR(canvas);

      if (targetManagerState) {
        targetManagerActions.updateGameArea(displayWidth, displayHeight);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameMode, selectedResolution]);

  // 전체화면 모드 처리
  useEffect(() => {
    if (!containerRef.current) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && gameMode === 'fullscreen') {
        onGameModeChange?.('windowed');
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
            containerRef.current?.requestFullscreen();
          } catch (error) {
            // 오류 무시: Chrome 브라우저에서 전체화면 모드 변경 시 버그 존재
          }
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('click', handleClick);
    };
  }, [gameMode, onGameModeChange]);

  // targetsRef 동기화
  useEffect(() => {
    targetsRef.current = targetManagerState.targets;
  }, [targetManagerState.targets]);

  // 타겟 생성 간격 점진적 감소
  useEffect(() => {
    if (gameState.isGameStarted && gameState.startTime) {
      targetManagerActions.startSpawner(gameState.startTime);
      return () => targetManagerActions.stopSpawner();
    }
    targetManagerActions.stopSpawner();
  }, [gameState.isGameStarted, gameState.startTime]);

  // 타겟 상태 동기화 (프레임 간격)
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    const cleanup = targetManagerActions.syncTargets(() => {
      if (targetManagerState.targets.length >= 10) {
        gameActions.triggerGraceTimer();
      } else {
        gameActions.cancelGraceTimer();
      }
    });
    return cleanup;
  }, [gameState.isGameStarted, gameActions]);

  // 경과 시간 업데이트 (100ms 간격)
  useEffect(() => {
    if (!gameState.isGameStarted || gameState.isGameOver) return;

    const timer = setInterval(() => {
      gameActions.updatePlayTime();
    }, 100);

    return () => clearInterval(timer);
  }, [gameState.isGameStarted, gameState.isGameOver, gameActions]);

  // 포인터락 이벤트 리스너 설정
  useEffect(() => {
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener(
        'pointerlockchange',
        handlePointerLockChange
      );
    };
  }, [gameState.isGameStarted]);

  // gameRef 동기화
  useEffect(() => {
    gameRef.current.graceStartAt = gameState.graceStartAt;
    gameRef.current.isGameOver = gameState.isGameOver;
  }, [gameState.graceStartAt, gameState.isGameOver]);

  // 게임 시작 및 종료 테두리 표시, 배경음악 관리
  useEffect(() => {
    if (gameState.isGameStarted) {
      volumeActions.playBGM();
      startFadeOut();
    } else {
      showBorder();
      volumeActions.stopBGM();
    }
  }, [gameState.isGameStarted]);

  // 컴포넌트 언마운트 시 애니메이션 프레임 정리
  useEffect(() => {
    return () => {
      if (fadeAnimationFrame.current) {
        cancelAnimationFrame(fadeAnimationFrame.current);
      }
    };
  }, []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!gameState.isGameStarted) return;

      if (event.key === '[') {
        // 민감도 감소 (최소 0.1)
        const newSensitivity = Math.max(0.1, mouseSensitivity.current - 0.1);
        mouseSensitivity.current = newSensitivity;
        setSensitivityDisplay(newSensitivity);
      } else if (event.key === ']') {
        // 민감도 증가 (최대 5.0)
        const newSensitivity = Math.min(5.0, mouseSensitivity.current + 0.1);
        mouseSensitivity.current = newSensitivity;
        setSensitivityDisplay(newSensitivity);
      } else if (event.key === '`') {
        gameActions.endGame();
      }
    },
    [gameState.isGameStarted]
  );

  // 키보드 이벤트 리스너 설정
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx || !showMenu) return;

    setCanvasSizeDPR(canvas);

    let last = performance.now();

    const render = () => {
      clearCanvas(ctx, canvas);

      if (!image || !drawSizeRef.current.width) {
        requestAnimationFrame(render);
        return;
      }

      // 위치 업데이트
      if (isPointerLocked.current) {
        // 마우스 움직임의 반대 방향으로 이동 (민감도 적용)
        position.current.x -=
          mouseMovement.current.x * mouseSensitivity.current;
        position.current.y -=
          mouseMovement.current.y * mouseSensitivity.current;

        // 이동 제한을 맵 크기에 맞게 조정 (범위 조정)
        const maxX = (drawSizeRef.current.width - canvas.width) * 0.5;
        const maxY = (drawSizeRef.current.height - canvas.height) * 0.5;
        position.current.x = Math.max(
          -maxX,
          Math.min(maxX, position.current.x)
        );
        position.current.y = Math.max(
          -maxY,
          Math.min(maxY, position.current.y)
        );

        mouseMovement.current = { x: 0, y: 0 };
      }

      applyCameraTransform(ctx, canvas, position.current);

      const now = performance.now();
      const dt = now - last;
      last = now;
      updateFloatingScores(dt);

      renderMapAndBounds(ctx, {
        image,
        width: canvas.width,
        height: canvas.height,
        drawSize: drawSizeRef.current,
        borderOpacity: borderOpacity.current,
        drawTargetContainer: (onDraw) =>
          targetManagerActions.drawTargetContainer(onDraw),
      });

      renderTargets({
        ctx,
        targets: targetsRef.current,
        graceStartAt: gameRef.current.graceStartAt,
        isGameOver: gameRef.current.isGameOver,
      });

      const targetSize = targetManagerActions.getTargetSize() ?? 50;
      drawFloatingScores(ctx, targetSize);

      endCameraTransform(ctx);

      rafIdRef.current = requestAnimationFrame(render);
    };

    rafIdRef.current = requestAnimationFrame(render);
    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [showMenu]);

  // 맵 로딩 후 메뉴 렌더링
  useEffect(() => {
    if (imageStatus === 'loaded') {
      setShowMenu(true);
    }
  }, [imageStatus]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black`}
    >
      <canvas
        ref={canvasRef}
        className={`block bg-[#1a1a1a] ${gameMode === 'fullscreen' ? 'h-auto w-auto' : 'max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)]'}`}
        style={{
          aspectRatio: selectedResolution.ratio,
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      />

      <Crosshair />

      <AnimatePresence>
        {gameState.isGameStarted && !gameState.isGameOver ? (
          <GameStatus
            key="status"
            elapsedTime={gameState.elapsedTime}
            score={gameState.score}
            accuracy={gameState.accuracy}
            sensitivity={sensitivityDisplay}
            gameMode={gameMode}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!gameState.isGameStarted &&
          !gameState.isGameOver &&
          !isRankingOpen &&
          showMenu && (
            <StartMenu
              key="start"
              onStart={handleGameStart}
              onRanking={() => setIsRankingOpen(true)}
              selectedResolution={selectedResolution}
              onResolutionChange={setSelectedResolution}
              animate={true}
              volumeState={volumeState}
              volumeActions={volumeActions}
            />
          )}
      </AnimatePresence>

      <AnimatePresence>
        {gameState.isGameOver && (
          <ResultMenu
            score={gameState.score}
            elapsedTime={gameState.elapsedTime}
            accuracy={gameState.accuracy}
            onRestart={handleGameStart}
            animate={gameState.isGameOver && !isRankingOpen}
            onMenu={() => {
              gameActions.resetGame();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRankingOpen && (
          <RankingBoard
            onClose={() => setIsRankingOpen(false)}
            animate={true}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!gameState.isGameStarted && !isRankingOpen && showMenu && (
          <GameGuide />
        )}
      </AnimatePresence>

      <LoadingOverlay imageStatus={imageStatus} />
    </div>
  );
};
