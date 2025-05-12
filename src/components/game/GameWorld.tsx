import {
  useRef,
  useEffect,
  useState,
  type MouseEvent,
  useCallback,
} from 'react';

import { Crosshair } from '@components/game/Crosshair';
import { TargetRenderer } from '@components/game/target/TargetRenderer';
import { StartMenu } from '@components/game/menu/StartMenu';
import ResultMenu from '@components/game/menu/ResultMenu';
import RankingBoard from '@components/game/ranking/RankingBoard';
import { GameStatus } from '@components/game/GameStatus';

import { Resolution, DEFAULT_RESOLUTION } from '@/types/resolution';
import type { Position, Size, MouseMovement } from '@/types/game';

import { useImageLoader } from '@hooks/useImageLoader';
import { useGameState } from '@hooks/useGameState';
import useTargetManager from '@hooks/useTargetManager';

import { clearCanvas, applyCanvasTransform } from '@utils/canvas';

interface GameWorldProps {
  gameMode: 'fullscreen' | 'windowed';
  onGameModeChange?: (mode: 'fullscreen' | 'windowed') => void;
}

export const GameWorld = ({ gameMode, onGameModeChange }: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
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

  const image = useImageLoader({
    src: '/map.svg',
    canvas: canvasRef.current,
    drawSize: drawSizeRef.current,
  });
  const [gameState, gameActions] = useGameState();
  const [targetManagerState, targetManagerActions] = useTargetManager();

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

      targetManagerActions.checkHit(screenX, screenY, (target) => {
        gameActions.handleHit();
        gameActions.addScore(target.score || 0);
      });

      gameActions.handleClick();
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
      if (gameMode === 'fullscreen') {
        const resolutionRatio = selectedResolution.ratio;
        const screenRatio = window.innerWidth / window.innerHeight;

        if (screenRatio > resolutionRatio) {
          canvas.height = window.innerHeight;
          canvas.width = canvas.height * resolutionRatio;
        } else {
          canvas.width = window.innerWidth;
          canvas.height = canvas.width / resolutionRatio;
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

        canvas.width = width;
        canvas.height = height;
      }

      if (targetManagerState) {
        targetManagerActions.updateGameArea(canvas.width, canvas.height);
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

  // 타겟 생성 간격 점진적 감소
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    const intervalId = setInterval(() => {
      targetManagerActions.decreaseSpawnInterval(gameState.startTime!);
    }, targetManagerState.targetConfig.spawnInterval);

    return () => clearInterval(intervalId);
  }, [targetManagerState.targetConfig.spawnInterval, gameState.isGameStarted]);

  // 타겟 생성 간격 업데이트
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    const cleanup = targetManagerActions.updateSpawnInterval();
    return cleanup;
  }, [gameState.isGameStarted, targetManagerState.targetConfig.spawnInterval]);

  // 타겟 상태 동기화 (프레임 간격)
  useEffect(() => {
    if (!gameState.isGameStarted) return;

    const cleanup = targetManagerActions.syncTargets(() => {
      if (targetManagerState.targets.length >= 10) {
        gameActions.endGame();
        document.exitPointerLock();
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

  // 게임 시작 및 종료 테두리 표시
  useEffect(() => {
    if (gameState.isGameStarted) {
      startFadeOut();
    } else {
      showBorder();
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
    if (!canvas || !ctx) return;

    const render = () => {
      clearCanvas(ctx, canvas.width, canvas.height);

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

      applyCanvasTransform(ctx, canvas.width, canvas.height, position.current);

      // 맵 이미지 그리기
      ctx.drawImage(
        image,
        -drawSizeRef.current.width / 2,
        -drawSizeRef.current.height / 2,
        drawSizeRef.current.width,
        drawSizeRef.current.height
      );

      // 타겟 컨테이너 테두리 그리기
      targetManagerActions.drawTargetContainer((bounds) => {
        ctx.strokeStyle = `rgba(255, 0, 0, ${borderOpacity.current})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      });

      ctx.restore();

      requestAnimationFrame(render);
    };

    render();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-black`}
    >
      <canvas
        ref={canvasRef}
        className={`block bg-black ${gameMode === 'fullscreen' ? 'h-auto w-auto' : 'max-h-[calc(100vh-48px)] max-w-[calc(100vw-48px)]'}`}
        style={{
          aspectRatio: selectedResolution.ratio,
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      />
      {canvasRef.current && (
        <TargetRenderer
          targets={targetManagerState.targets}
          canvas={canvasRef.current}
          position={position.current}
          isGameStarted={gameState.isGameStarted}
        />
      )}
      <Crosshair />
      {gameState.isGameStarted && !gameState.isGameOver ? (
        <GameStatus
          elapsedTime={gameState.elapsedTime}
          score={gameState.score}
          accuracy={gameState.accuracy}
          sensitivity={sensitivityDisplay}
        />
      ) : null}
      {!gameState.isGameStarted && !gameState.isGameOver && !isRankingOpen && (
        <StartMenu
          onStart={handleGameStart}
          onRanking={() => setIsRankingOpen(true)}
          selectedResolution={selectedResolution}
          onResolutionChange={setSelectedResolution}
          animate={false}
        />
      )}
      {gameState.isGameOver && !isRankingOpen && (
        <ResultMenu
          score={gameState.score}
          elapsedTime={gameState.elapsedTime}
          accuracy={gameState.accuracy}
          onRestart={handleGameStart}
          onMenu={() => {
            gameActions.resetGame();
          }}
        />
      )}
      {isRankingOpen && (
        <RankingBoard
          onClose={() => setIsRankingOpen(false)}
          animate={false}
        />
      )}
    </div>
  );
};
