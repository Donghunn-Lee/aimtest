import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import {
  addFloatingScore,
  drawFloatingScores,
  updateFloatingScores,
} from '@/components/game/core/renderers/floatingScoreRenderer';
import { renderMapAndBounds } from '@/components/game/core/renderers/mapRenderer';
import { renderTargets } from '@/components/game/core/renderers/targetRenderer';
import { ResultMenu } from '@/components/game/menu/ResultMenu';
import { StartMenu } from '@/components/game/menu/StartMenu';
import { RankingBoard } from '@/components/game/ranking/RankingBoard';
import { Crosshair } from '@/components/game/ui/Crosshair';
import { GameGuide } from '@/components/game/ui/GameGuide';
import { GameStatus } from '@/components/game/ui/GameStatus';
import { LoadingOverlay } from '@/components/game/ui/LoadingOverlay';
import { INPUT, UI } from '@/constants/game';
import { TARGET_DEFAULT } from '@/constants/target';
import { useBorderFade } from '@/hooks/useBorderFade';
import { useCanvasRenderLoop } from '@/hooks/useCanvasRenderLoop';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGame } from '@/hooks/useGame';
import { useGameRuntime } from '@/hooks/useGameRuntime';
import { useImageLoader } from '@/hooks/useImageLoader';
import { useInputController } from '@/hooks/useInputController';
import { usePointerLock } from '@/hooks/usePointerLock';
import { useResizeCanvas } from '@/hooks/useResizeCanvas';
import {
  type TargetContainer,
  useTargetManager,
} from '@/hooks/useTargetManager';
import { useVolume } from '@/hooks/useVolume';
import type { GameMode, Size } from '@/types/game';
import type { Resolution } from '@/types/image';
import type { Target } from '@/types/target';
import {
  applyCameraTransform,
  clearCanvas,
  endCameraTransform,
} from '@/utils/canvas';
import { DEFAULT_RESOLUTION } from '@/utils/image';

export interface GameWorldProps {
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  onBackToMain: () => void;
}

export interface GameRuntimeRef {
  graceStartAt: number | null;
  isGameOver: boolean;
}

/**
 * GameWorld: aimtest 런타임 허브.
 * - Canvas(rAF) 렌더 루프 구동
 * - 입력/리사이즈/해상도 오케스트레이션
 * - 드로잉(renderer)·도메인(TargetManager) 위임
 * - UI(React)와 rAF(렌더) 분리
 * - 루프/이벤트 cleanup은 훅 경계에서 처리
 */
export const GameWorld = ({
  gameMode,
  onGameModeChange,
  onBackToMain,
}: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetsRef = useRef<Target[]>([]);
  const gameRuntimeRef = useRef<GameRuntimeRef>({
    graceStartAt: null as number | null,
    isGameOver: false,
  });

  const [canvasPxSize, setCanvasPxSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const drawSizeRef = useRef<Size>({ width: 0, height: 0 });
  const borderOpacityRef = useRef(0.7);

  // UI 상태(렌더 전용)
  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(DEFAULT_RESOLUTION);

  // 런타임/도메인 상태(훅으로 경계 분리)
  const { image, firstLoaded: isMapReady } = useImageLoader({
    src: '/map.svg',
    canvas: canvasRef.current,
    canvasPxSize,
    drawSize: drawSizeRef.current,
  });

  const [gameState, gameActions] = useGame();
  const [targetManagerState, targetManagerActions] = useTargetManager();
  const [volumeState, volumeActions] = useVolume();

  // rAF 루프에 주입할 순수 함수 묶음(교체/테스트 가능하도록 메모이즈)
  const services = useMemo(() => {
    const getTargetSize = () =>
      targetManagerActions.getTargetSize() ?? TARGET_DEFAULT.size;
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

  // Canvas 전용 rAF 루프(React 렌더와 분리된 실행 경계)
  const loop = useCanvasRenderLoop({
    canvasRef,
    image,
    drawSizeRef,
    targetsRef,
    gameRef: gameRuntimeRef,
    borderOpacityRef,
    services,
  });

  // 리사이즈/해상도 변경 시: 캔버스 크기 + 게임 영역 동기화(도메인 전제 유지)
  useResizeCanvas({
    canvasRef,
    mode: gameMode,
    ratio: selectedResolution.ratio,
    windowPadding: UI.WINDOW_PADDING,
    onGameAreaChange: (w, h) => {
      targetManagerActions.updateGameArea(w, h);
      setCanvasPxSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h }
      );
    },
  });

  // pointer lock은 “게임 진행 중”에만 허용(해제는 즉시 종료로 취급)
  const pointer = usePointerLock({
    canvasRef,
    enabled: gameState.isGameStarted && !gameState.isGameOver,
    onUnlock: () => gameActions.endGame(),
  });

  // 입력 → 게임 액션 매핑(런타임에서만 필요한 계약을 한 곳에 고정)
  const { onMouseMove, onMouseDown, sensitivity } = useInputController({
    pointer,
    loop,
    gameState,
    gameActions,
    targetManagerActions,
    volumeActions,
    initialSensitivity: INPUT.SENSITIVITY_DEFAULT,
    minSensitivity: INPUT.SENSITIVITY_MIN,
    maxSensitivity: INPUT.SENSITIVITY_MAX,
    onScore: (t) => addFloatingScore(t.x, t.y, t.score || 0, t.score === 3),
  });

  // 경계 시각화(게임 시작/종료에 맞춰 opacity를 rAF로 제어)
  const borderFadeActions = useBorderFade(borderOpacityRef);

  // fullscreen 전환/브라우저 이벤트 대응(모드 상태와 UI를 일치시킴)
  useFullscreen({
    containerRef,
    gameMode,
    onGameModeChange,
  });

  // 게임 시작: 타겟 매니저 초기화 + 도메인 준비 + 포인터락 요청
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

  /**
   * 레이아웃 변경(해상도/모드/캔버스 픽셀 사이즈) 시 타겟 매니저 초기화
   * - 게임 종료 시 타겟 유지는 유지하되, “레이아웃이 변하면” 초기화
   */
  const prevLayoutRef = useRef<{
    mode: GameMode;
    ratio: number;
    w: number;
    h: number;
  } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const next = {
      mode: gameMode,
      ratio: selectedResolution.ratio,
      w: canvasPxSize.width,
      h: canvasPxSize.height,
    };

    const prev = prevLayoutRef.current;
    const changed =
      !prev ||
      prev.mode !== next.mode ||
      prev.ratio !== next.ratio ||
      prev.w !== next.w ||
      prev.h !== next.h;

    if (!changed) return;

    prevLayoutRef.current = next;

    // 레이아웃이 “유효한 픽셀 사이즈”로 확정된 뒤에만 init
    if (canvas.width < 2 || canvas.height < 2) return;

    targetManagerActions.init(
      { width: canvas.width, height: canvas.height },
      next.ratio
    );
  }, [
    gameMode,
    selectedResolution.ratio,
    canvasPxSize.width,
    canvasPxSize.height,
    targetManagerActions,
  ]);

  // TargetManager 상태를 rAF 루프(ref)로 동기화(React 렌더와 분리된 읽기 경계)
  useEffect(() => {
    targetsRef.current = targetManagerState.targets;
  }, [targetManagerState.targets]);

  // 게임 진행 중에만 필요한 사이드 이펙트를 한 곳에서 조립(타이머/스포너/BGM 등)
  useGameRuntime({
    gameState,
    gameActions,
    targetManagerState,
    targetManagerActions,
    volumeActions,
    borderFadeActions,
    gameRuntimeRef,
  });

  useEffect(() => {
    if (gameState.isGameOver) {
      loop.returnToOriginAndStop();
    }
  }, [gameState.isGameOver, loop]);

  // 준비 완료 기준이 충족될 때만 루프 시작(깨지면 즉시 정지)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ready =
      isMapReady && !!canvas && canvas.width > 0 && canvas.height > 0;

    if (ready) loop.start();
    else loop.stop();

    return () => loop.stop();
  }, [loop, isMapReady]);

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden`}
    >
      <div
        className="relative flex h-fit max-h-[100vh] w-auto max-w-[100vw] items-center justify-center overflow-hidden"
        style={{ aspectRatio: selectedResolution.ratio }}
      >
        <canvas
          ref={canvasRef}
          className={`relative h-full w-full`}
          onMouseMove={onMouseMove}
          onMouseDown={onMouseDown}
        />

        <AnimatePresence>
          {isMapReady && (
            <Crosshair
              isGaming={gameState.isGameStarted && !gameState.isGameOver}
            />
          )}

          {gameState.isGameStarted && !gameState.isGameOver && (
            <GameStatus
              key="status"
              elapsedTime={gameState.elapsedTime}
              score={gameState.score}
              accuracy={gameState.accuracy}
              sensitivity={sensitivity}
            />
          )}

          {!gameState.isGameStarted &&
            !gameState.isGameOver &&
            !isRankingOpen &&
            isMapReady && (
              <StartMenu
                key="start"
                onStart={handleGameStart}
                onRanking={() => setIsRankingOpen(true)}
                onBackToMain={onBackToMain}
                selectedResolution={selectedResolution}
                onResolutionChange={setSelectedResolution}
                volumeState={volumeState}
                volumeActions={volumeActions}
              />
            )}

          {gameState.isGameOver && !isRankingOpen && (
            <ResultMenu
              key="result"
              score={gameState.score}
              elapsedTime={gameState.elapsedTime}
              accuracy={gameState.accuracy}
              onRestart={handleGameStart}
              onMenu={() => {
                // 결과창 → 시작 메뉴 이동 시 타겟 초기화
                targetManagerActions.init(
                  {
                    width: canvasRef.current?.width || 0,
                    height: canvasRef.current?.height || 0,
                  },
                  selectedResolution.ratio
                );
                gameActions.resetGame();
              }}
            />
          )}

          {isRankingOpen && (
            <RankingBoard
              key="ranking"
              onClose={() => setIsRankingOpen(false)}
            />
          )}

          {!gameState.isGameStarted && !isRankingOpen && isMapReady && (
            <GameGuide key="guide" />
          )}

          {!isMapReady && <LoadingOverlay key={'loading'} />}
        </AnimatePresence>
      </div>
    </div>
  );
};
