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
import {
  useTargetManager,
  type TargetContainer,
} from '@hooks/useTargetManager';
import useVolume from '@/hooks/useVolume';
import { useCanvasRenderLoop } from '@/hooks/useCanvasRenderLoop';
import { useResizeCanvas } from '@/hooks/useResizeCanvas';
import { usePointerLock } from '@/hooks/usePointerLock';
import { useInputController } from '@/hooks/useInputController';
import { useBorderFade } from '@/hooks/useBorderFade';
import { useFullscreen } from '@/hooks/useFullscreen';
import { useGameRuntime } from '@/hooks/useGameRuntime';

import {
  clearCanvas,
  applyCameraTransform,
  endCameraTransform,
} from '@utils/canvas';
import { DEFAULT_RESOLUTION } from '@/utils/image';

import { INPUT, UI } from '@/constants/game';

import { TARGET_DEFAULT } from '@/constants/target';

export interface GameWorldProps {
  gameMode: GameMode;
  onGameModeChange?: (mode: GameMode) => void;
}

export interface GameRuntimeRef {
  graceStartAt: number | null;
  isGameOver: boolean;
}

/**
 * 게임 창을 관리하는 메인 컴포넌트
 *
 */
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

  const [isRankingOpen, setIsRankingOpen] = useState(false);
  const [selectedResolution, setSelectedResolution] =
    useState<Resolution>(DEFAULT_RESOLUTION);

  const { image, firstLoaded: isMapReady } = useImageLoader({
    src: '/map.svg',
    canvas: canvasRef.current,
    drawSize: drawSizeRef.current,
  });
  const [gameState, gameActions] = useGame();
  const [targetManagerState, targetManagerActions] = useTargetManager();
  const [volumeState, volumeActions] = useVolume();

  // 캔버스 렌더 루프에 전달되는 렌더 서비스 집합
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

  // 캔버스 렌더링 루프
  // - rAF 기반으로 맵/타겟/스코어 등을 그리는 순수 캔버스 렌더 담당 (React 렌더와 분리)
  const loop = useCanvasRenderLoop({
    canvasRef,
    image,
    drawSizeRef,
    targetsRef,
    gameRef: gameRuntimeRef,
    borderOpacityRef,
    services,
  });

  // 화면 크기 및 해상도 관리
  // - 모드 전환/윈도우 리사이즈/해상도 변경 시 캔버스 크기 계산 + TargetManager 게임 영역 갱신
  useResizeCanvas({
    canvasRef,
    mode: gameMode,
    ratio: selectedResolution.ratio,
    windowPadding: UI.WINDOW_PADDING,
    onGameAreaChange: (w, h) => {
      targetManagerActions.updateGameArea(w, h);
    },
    deps: [selectedResolution.ratio, image],
  });

  // 포인터 잠금 상태 관리 (조준/해제)
  // - 게임 진행 중에만 PointerLock 활성화, 해제 시 게임 종료
  const pointer = usePointerLock({
    canvasRef,
    enabled: gameState.isGameStarted && !gameState.isGameOver,
    onUnlock: () => gameActions.endGame(),
  });

  // 입력 제어 (키보드/마우스 → 게임 액션)
  // - 마우스 이동/클릭을 조준, 타겟 히트, 감도 조정 등으로 매핑
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
      onScore: (t) => addFloatingScore(t.x, t.y, t.score || 0, t.score === 3),
    });

  // 타겟 컨테이너 테두리 페이드 효과
  // - 게임 시작/종료 시 테두리 opacity를 rAF 기반으로 페이드 인/아웃
  const borderFade = useBorderFade(borderOpacityRef);

  // 전체화면 모드 관리
  // - fullscreen 모드 전환 및 브라우저 fullscreen 이벤트 대응
  useFullscreen({
    containerRef,
    gameMode,
    onExit: () => onGameModeChange?.('windowed'),
  });

  // 게임 시작 핸들러
  // - 상태 초기화 + 타겟 매니저 초기화 + 포인터락 요청
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

  // 초기 타겟 매니저 설정
  // - 아직 게임이 시작되지 않은 상태에서 캔버스 크기/해상도 기준으로 TargetManager 인스턴스 준비
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

    // isGameStarted을 의존성에서 제거하여 게임 종료 후에도 타겟이 남아있도록 구현
  }, [selectedResolution, targetManagerActions]);

  // TargetManager 내부 타겟 배열 → 렌더 루프용 ref 동기화
  useEffect(() => {
    targetsRef.current = targetManagerState.targets;
  }, [targetManagerState.targets]);

  // 런타임 부수효과 통합 관리
  // - 타이머, 스포너, BGM, 그레이스 타이머, 런타임 ref 동기화 등
  //   "게임이 진행되는 동안만" 필요한 사이드 이펙트를 한 곳에서 관리
  useGameRuntime({
    gameState,
    gameActions,
    targetManagerState,
    targetManagerActions,
    volumeActions,
    borderFade,
    gameRuntimeRef,
  });

  // 렌더 루프 시작/정지
  // - 맵 이미지/캔버스 준비가 끝났을 때만 루프를 돌리고, 조건이 깨지면 정지
  useEffect(() => {
    const canvas = canvasRef.current;
    const ready =
      isMapReady && !!canvas && canvas.width > 0 && canvas.height > 0;

    if (ready) loop.start();
    else loop.stop();

    return () => loop.stop();
  }, [loop, isMapReady]);

  return (
    <main
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
        {gameState.isGameStarted && !gameState.isGameOver && (
          <GameStatus
            key="status"
            elapsedTime={gameState.elapsedTime}
            score={gameState.score}
            accuracy={gameState.accuracy}
            sensitivity={sensitivity}
            gameMode={gameMode}
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
    </main>
  );
};
