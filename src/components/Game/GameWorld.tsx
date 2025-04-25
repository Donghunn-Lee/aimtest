import { useRef, useEffect, useState, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Crosshair } from './Crosshair';
import { TargetManager } from './target/TargetManager';
import { TargetRenderer } from './target/TargetRenderer';
import { Target, TargetConfig } from './target/types';
import { StartMenu } from './menu/StartMenu';
import { ResultMenu } from './menu/ResultMenu';

interface GameWorldProps {
  gameMode: 'fullscreen' | 'windowed';
  onGameModeChange?: (mode: 'fullscreen' | 'windowed') => void;
}

const initialTargetConfig: TargetConfig = {
  size: 50,
  margin: 0,
  maxTargets: 200,
  spawnInterval: 1000,
};

export const GameWorld = ({ gameMode, onGameModeChange }: GameWorldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPointerLocked = useRef(false);
  const mouseMovement = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 100 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawSizeRef = useRef({ width: 0, height: 0 });
  const [targets, setTargets] = useState<Target[]>([]);
  const targetManagerRef = useRef<TargetManager | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [targetConfig, setTargetConfig] = useState<TargetConfig>(initialTargetConfig);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [totalClick, setTotalClick] = useState(0);

  const initTargetManager = () => {
    targetManagerRef.current = new TargetManager(targetConfig, {
      width: canvasRef.current?.width || 0,
      height: canvasRef.current?.height || 0
    });
  };

  // 게임 시작 핸들러
  const handleGameStart = () => {
    setIsGameStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(0);
    setStartTime(Date.now());

    // 게임 시작 시 포인터 락 활성화
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
  };

  // 게임 재시작 핸들러
  const handleRestart = () => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setScore(0);
    setTargetConfig(initialTargetConfig);
    targetManagerRef.current?.clearTargets();
    initTargetManager();
    document.exitPointerLock();
  };

  // 이미지 크기 계산 함수
  const calculateImageSize = useCallback((canvas: HTMLCanvasElement, image: HTMLImageElement) => {
    const imageAspect = image.width / image.height;
    const canvasAspect = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;

    if (imageAspect > canvasAspect) {
      // 이미지가 더 넓은 경우
      drawHeight = canvas.width / imageAspect;
    } else {
      // 이미지가 더 좁은 경우
      drawWidth = canvas.height * imageAspect;
    }

    // 이미지를 배율
    drawWidth *= 2;
    drawHeight *= 2;
    drawSizeRef.current = { width: drawWidth, height: drawHeight };

    console.log('Canvas size:', { width: canvas.width, height: canvas.height });
  }, []);

  // 이미지 로드 함수
  const loadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 이미지가 이미 로드되어 있으면 크기만 재계산
    if (imageRef.current && imageRef.current.complete) {
      calculateImageSize(canvas, imageRef.current);
      return;
    }

    // 새 이미지 로드
    const image = new Image();
    imageRef.current = image;

    image.onload = () => {
      calculateImageSize(canvas, image);
      setImageLoaded(true);
    };

    image.onerror = (error) => {
      console.error('Failed to load image:', error);
    };

    image.src = '/map.svg';
  }, [calculateImageSize]);

  const handlePointerLockChange = () => {
    if (!canvasRef.current) return;
    isPointerLocked.current = document.pointerLockElement === canvasRef.current;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isGameStarted) return;
    if (isPointerLocked.current) {
      mouseMovement.current = {
        x: event.movementX,
        y: event.movementY
      };
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (!isGameStarted) return;
    if (!canvasRef.current) return;

    if (!isPointerLocked.current) {
      canvasRef.current.requestPointerLock();
    } else if (targetManagerRef.current) {
      const screenX = -position.current.x;
      const screenY = -position.current.y;

      const hitTarget = targetManagerRef.current.checkHit(screenX, screenY);
      if (hitTarget) {
        setHitCount(prev => prev + 1);
        setScore(prevScore => prevScore + (hitTarget.score || 0));
        const updatedTargets = targetManagerRef.current.getTargets();
        setTargets(updatedTargets);
      }

      setTotalClick(prevCount => prevCount + 1);
    }
  };

  // 전체화면 모드 처리
  useEffect(() => {
    if (!containerRef.current) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && gameMode === 'fullscreen') {
        onGameModeChange?.('windowed');
      }
    };

    const handleClick = () => {
      if (gameMode === 'fullscreen' && containerRef.current && !document.fullscreenElement) {
        // 사용자 상호작용 직후에 전체화면 요청
        requestAnimationFrame(() => {
          try {
            containerRef.current?.requestFullscreen();
          } catch (error) {
            // 오류 무시
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

  // 캔버스 크기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (gameMode === 'fullscreen') {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      } else {
        // 창 모드일 때는 화면의 80% 크기로 설정
        canvas.width = window.innerWidth * 0.8;
        canvas.height = window.innerHeight * 0.8;
      }

      // 이미지 크기 재계산
      if (imageRef.current && imageRef.current.complete) {
        calculateImageSize(canvas, imageRef.current);
      }

      if (targetManagerRef.current) {
        targetManagerRef.current.updateGameArea(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameMode, calculateImageSize]);

  // 이미지 로드 (한 번만 실행)
  useEffect(() => {
    loadImage();
  }, [loadImage]);

  // 타겟 생성 간격 점진적 감소
  useEffect(() => {
    if (!isGameStarted) return;

    const intervalId = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime!) / 1000;
      const newInterval = Math.max(
        250, // 최소 간격 250ms
        1000 * Math.pow(0.98, elapsedSeconds) // 매초 2%씩 감소
      );

      setTargetConfig(prev => ({
        ...prev,
        spawnInterval: newInterval
      }));
    }, targetConfig.spawnInterval);

    return () => clearInterval(intervalId);
  }, [targetConfig.spawnInterval, isGameStarted]);

  // 타겟 매니저 초기화 (한 번만)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initTargetManager();

    return () => {
      if (targetManagerRef.current) {
        targetManagerRef.current.clearTargets();
      }
    };
  }, []); // 의존성 배열을 비워서 한 번만 실행

  // 타겟 생성 간격 업데이트
  useEffect(() => {
    if (!targetManagerRef.current || !isGameStarted) return;

    const spawnInterval = setInterval(() => {
      if (targetManagerRef.current) {
        const newTarget = targetManagerRef.current.createTarget();
        if (newTarget) {
          const updatedTargets = targetManagerRef.current.getTargets();
          setTargets(updatedTargets);
        }
      }
    }, targetConfig.spawnInterval);

    return () => clearInterval(spawnInterval);
  }, [targetConfig.spawnInterval, isGameStarted]);

  // 타겟 상태 동기화 (16ms마다)
  useEffect(() => {
    if (!targetManagerRef.current || !isGameStarted) return;

    const syncInterval = setInterval(() => {
      const updatedTargets = targetManagerRef.current?.getTargets() || [];
      setTargets(updatedTargets);

      // 타겟이 10개가 되면 게임 종료
      if (updatedTargets.length >= 10) {
        const endTime = Date.now();
        const finalTime = (endTime - startTime!) / 1000;
        setElapsedTime(finalTime);
        setIsGameStarted(false);
        setIsGameOver(true);
        document.exitPointerLock();
      }
    }, 16);

    return () => clearInterval(syncInterval);
  }, [isGameStarted, startTime]);

  // 경과 시간 업데이트 (1초 간격)
  useEffect(() => {
    if (!isGameStarted || isGameOver) return;

    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTime!) / 1000;
      setElapsedTime(Math.floor(elapsed));
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameStarted, isGameOver, startTime]);

  // 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    const render = () => {
      // 화면 지우기
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!imageRef.current || !drawSizeRef.current.width) {
        requestAnimationFrame(render);
        return;
      }

      // 위치 업데이트
      if (isPointerLocked.current) {
        // 마우스 움직임의 반대 방향으로 이동 (속도 조정)
        position.current.x -= mouseMovement.current.x * 1;
        position.current.y -= mouseMovement.current.y * 1;

        // 이동 제한을 맵 크기에 맞게 조정 (범위 조정)
        const maxX = (drawSizeRef.current.width - canvas.width) * 0.5;
        const maxY = (drawSizeRef.current.height - canvas.height) * 0.5;
        position.current.x = Math.max(-maxX, Math.min(maxX, position.current.x));
        position.current.y = Math.max(-maxY, Math.min(maxY, position.current.y));

        mouseMovement.current = { x: 0, y: 0 };
      }

      // 변환 적용
      ctx.save();
      ctx.translate(canvas.width / 2 + position.current.x, canvas.height / 2 + position.current.y);

      // 이미지 그리기
      ctx.drawImage(
        imageRef.current,
        -drawSizeRef.current.width / 2,
        -drawSizeRef.current.height / 2,
        drawSizeRef.current.width,
        drawSizeRef.current.height
      );

      // 타겟 컨테이너 영역 테두리 그리기
      if (targetManagerRef.current) {
        const bounds = targetManagerRef.current.getMapBounds();
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'; // 빨간색 테두리 (반투명)
        ctx.lineWidth = 3; // 테두리 두께
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      }

      ctx.restore();

      requestAnimationFrame(render);
    };

    render();
  }, []);

  // 마우스 이벤트 처리
  useEffect(() => {
    if (!isGameStarted) return;
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [isGameStarted]);

  useEffect(() => {
    if (totalClick === 0) return;

    setAccuracy(hitCount / totalClick * 100);
  }, [totalClick])


  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden`}
    >
      <canvas
        ref={canvasRef}
        className={`block mx-auto bg-black ${gameMode === 'fullscreen' ? 'w-screen h-screen' : 'w-[80vw] h-[80vh]'}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
      />
      {canvasRef.current && (
        <TargetRenderer
          targets={targets}
          canvas={canvasRef.current}
          position={position.current}
          isGameStarted={isGameStarted}
        />
      )}
      <Crosshair />
      {isGameStarted && !isGameOver ? (
        <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded min-w-[200px]">
          <div className="flex justify-between">
            <span>생성 간격:</span>
            <span>{targetConfig.spawnInterval.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>경과 시간:</span>
            <span>{elapsedTime}초</span>
          </div>
          <div className="flex justify-between">
            <span>점수:</span>
            <span>{score}</span>
          </div>
          <div className="flex justify-between">
            <span>정확도:</span>
            <span>{accuracy?.toFixed(2) || 0}%</span>
          </div>
        </div>
      ) : null}
      {!isGameStarted && !isGameOver && (
        <StartMenu onStart={handleGameStart} />
      )}
      {isGameOver && (
        <ResultMenu
          score={score}
          elapsedTime={elapsedTime}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}; 