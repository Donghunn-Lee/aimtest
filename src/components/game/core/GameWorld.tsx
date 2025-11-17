import { useRef, useEffect, useState, useMemo } from 'react';

import { AnimatePresence } from 'framer-motion';

import { Crosshair } from '@components/game/ui/Crosshair';
import { renderTargets } from '@/components/game/core/renderers/targetRenderer';
import StartMenu from '@components/game/menu/StartMenu';
import ResultMenu from '@components/game/menu/ResultMenu';
import RankingBoard from '@components/game/ranking/RankingBoard';
import { GameStatus } from '@/components/game/ui/GameStatus';
import GameGuide from '@components/game/ui/GameGuide';
import { LoadingOverlay } from '@/components/game/ui/LoadingOverlay';

import {
  addFloatingScore,
  drawFloatingScores,
  updateFloatingScores,
} from '@/components/game/core/renderers/floatingScoreRenderer';
import { renderMapAndBounds } from '@/components/game/core/renderers/mapRenderer';

import type { GameMode, Size } from '@/types/game';
import { Target } from '@/types/target';
import type { Resolution } from '@/types/image';

import { useImageLoader } from '@hooks/useImageLoader';
import { useGame } from '@/hooks/useGame';
import useTargetManager, {
  type TargetContainer,
} from '@hooks/useTargetManager';
import useVolume from '@/hooks/useVolume';
import { useCanvasRenderLoop } from '@/hooks/useCanvasRenderLoop';
import { useResizeCanvas } from '@/hooks/useResizeCanvas';
import { usePointerLock } from '@/hooks/usePointerLock';
import { useInputController } from '@/hooks/useInputController';
import { useBorderFade } from '@/hooks/useBorderFade';
import { useFullscreen } from '@/hooks/useFullscreen';

import {
  clearCanvas,
  applyCameraTransform,
  endCameraTransform,
} from '@utils/canvas';
import { DEFAULT_RESOLUTION } from '@/utils/image';

import { GAMEPLAY, INPUT, UI } from '@/constants/game';
import { useGameRuntime } from '@/hooks/useGameRuntime';

export interface GameWorldProps {
  gameMode: GameMode;
  onGameModeChange?: (mode: GameMode) => void;
}

export interface GameRuntimeRef {
  graceStartAt: number | null;
  isGameOver: boolean;
}

export const GameWorld = ({ gameMode, onGameModeChange }: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetsRef = useRef<Target[]>([]);
  const gameRuntimeRef = useRef<GameRuntimeRef>({
    graceStartAt: null as number | null,
    isGameOver: false,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const drawSizeRef = useRef<Size>({ width: 0, height: 0 });
  const borderOpacityRef = useRef(0.7);
  const fadeAnimationFrame = useRef<number | null>(null);

  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(DEFAULT_RESOLUTION);

  const { image, firstLoaded: showMenu } = useImageLoader({
    src: '/map.svg',
    canvas: canvasRef.current,
    drawSize: drawSizeRef.current,
  });
  const [gameState, gameActions] = useGame();
  const [targetManagerState, targetManagerActions] = useTargetManager();
  const [volumeState, volumeActions] = useVolume();

  // 캔버스 랜더링 객체
  const services = useMemo(() => {
    const getTargetSize = () => targetManagerActions.getTargetSize() ?? 50;
    const drawTargetContainer = (onDraw: (bounds: TargetContainer) => void) => {
      targetManagerActions.drawTargetContainer?.(onDraw);
    };

    return {
      clearCanvas,
      applyCameraTransform,
      endCameraTransform,
      renderMapAndBounds,
      renderTargets,
      updateFloatingScores,
      drawFloatingScores,
      getTargetSize,
      drawTargetContainer,
    };
  }, [targetManagerActions]);

  // 캔버스 렌더링 루프 (게임 오브젝트, 맵, 점수 등 모든 프레임 단위 렌더 관리)
  const loop = useCanvasRenderLoop({
    canvasRef,
    image,
    drawSizeRef,
    targetsRef,
    gameRef: gameRuntimeRef,
    borderOpacityRef,
    services: services,
  });

  // 화면 크기 및 해상도 관리 (모드 전환/리사이즈 대응)
  useResizeCanvas({
    canvasRef,
    mode: gameMode,
    ratio: selectedResolution.ratio,
    windowPadding: UI.WINDOW_PADDING,
    onGameAreaChange: (w, h) => {
      // targetManager가 초기화 되었다면 타겟 영역 갱신
      targetManagerActions.updateGameArea(w, h);
    },
    deps: [selectedResolution.ratio, image],
  });

  // 포인터 잠금 상태 관리 (PointerLock API - 조준/해제 제어)
  const pointer = usePointerLock({
    canvasRef: canvasRef,
    enabled: !gameState.isGameOver,
    onUnlock: () => gameActions.endGame(),
  });

  // 키보드, 마우스 입력 관리
  const { onMouseMove, onMouseDown, sensitivity, setSensitivity } =
    useInputController({
      pointer,
      loop,
      gameState,
      gameActions,
      targetManagerActions,
      volumeActions,
      initialSensitivity: INPUT.SENSITIVITY_DEFAULT,
      minSensitivity: INPUT.SENSITIVITY_MIN,
      maxSensitivity: INPUT.SENSITIVITY_MAX,
      selectedRatio: selectedResolution.ratio,
      onScore: (t) => addFloatingScore(t.x, t.y, t.score || 0, t.score === 3),
    });

  // 타겟 컨테이너 페이드 효과 처리
  const borderFade = useBorderFade(borderOpacityRef);

  // 전체화면 모드 관리
  useFullscreen({
    containerRef,
    gameMode,
    onExit: () => onGameModeChange?.('windowed'),
  });

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

    void pointer.request();
  };

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

  // targetsRef 동기화
  useEffect(() => {
    targetsRef.current = targetManagerState.targets;
  }, [targetManagerState.targets]);

  useGameRuntime({
    gameState,
    gameActions,
    targetManagerState,
    targetManagerActions,
    volumeActions,
    borderFade,
    gameRuntimeRef,
  });

  // 컴포넌트 언마운트 시 애니메이션 프레임 정리
  useEffect(() => {
    return () => {
      if (fadeAnimationFrame.current) {
        cancelAnimationFrame(fadeAnimationFrame.current);
      }
    };
  }, []);

  // 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    const ready = showMenu && !!canvas && canvas.width > 0 && canvas.height > 0;

    if (ready) loop.start();
    else loop.stop();

    return () => loop.stop();
  }, [loop, showMenu]);

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
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
      />

      <Crosshair />

      <AnimatePresence>
        {gameState.isGameStarted && !gameState.isGameOver ? (
          <GameStatus
            key="status"
            elapsedTime={gameState.elapsedTime}
            score={gameState.score}
            accuracy={gameState.accuracy}
            sensitivity={sensitivity}
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

      <LoadingOverlay show={showMenu} />
    </div>
  );
};
