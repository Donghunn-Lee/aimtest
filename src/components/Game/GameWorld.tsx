import { useRef, useEffect, useState, useCallback } from 'react';
import { Crosshair } from './Crosshair';
import { TargetManager } from './Target/TargetManager';
import { TargetRenderer } from './Target/TargetRenderer';
import { Target, TargetConfig } from './Target/types';

interface GameWorldProps {
  gameMode: 'fullscreen' | 'windowed';
  onGameModeChange?: (mode: 'fullscreen' | 'windowed') => void;
}

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
  const gameStartTimeRef = useRef(Date.now());
  const initialSpawnIntervalRef = useRef(1000);
  const [targetConfig, setTargetConfig] = useState<TargetConfig>({
    size: 50,
    margin: 0,
    maxTargets: 200,
    spawnInterval: 1000
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);

  // 게임 시작 핸들러
  const handleGameStart = () => {
    setIsGameStarted(true);
    gameStartTimeRef.current = Date.now();
    setElapsedTime(0);

    // 게임 시작 시 포인터 락 활성화
    if (canvasRef.current) {
      canvasRef.current.requestPointerLock();
    }
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
    console.log('Image size calculated:', drawSizeRef.current);
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

  // 타겟 생성 시마다 1.2%씩 간격 축소
  useEffect(() => {
    const intervalId = setInterval(() => {
      const elapsedSeconds = (Date.now() - gameStartTimeRef.current) / 1000;
      const newInterval = Math.max(
        300, // 최소 간격 300ms
        800 * Math.pow(0.988, elapsedSeconds) // 매초 1.2%씩 감소
      );

      setTargetConfig(prev => ({
        ...prev,
        spawnInterval: newInterval
      }));
    }, targetConfig.spawnInterval);

    return () => clearInterval(intervalId);
  }, [targetConfig.spawnInterval]);

  // 타겟 매니저 초기화 (한 번만)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    targetManagerRef.current = new TargetManager(targetConfig, {
      width: canvas.width,
      height: canvas.height
    });

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
        setIsGameStarted(false);
        targetManagerRef.current?.clearTargets();
        document.exitPointerLock();
      }
    }, 16);

    return () => clearInterval(syncInterval);
  }, [isGameStarted]);

  // 경과 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - gameStartTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
    const canvas = canvasRef.current;
    if (!canvas || !isGameStarted) return;

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isPointerLocked.current) {
        mouseMovement.current = {
          x: event.movementX,
          y: event.movementY
        };
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock();
      } else if (targetManagerRef.current) {
        const screenX = -position.current.x;
        const screenY = -position.current.y;

        const hitTarget = targetManagerRef.current.checkHit(screenX, screenY);
        if (hitTarget) {
          const updatedTargets = targetManagerRef.current.getTargets();
          setTargets(updatedTargets);
        }
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isGameStarted]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden`}
    >
      <canvas
        ref={canvasRef}
        className={`block mx-auto bg-black ${gameMode === 'fullscreen' ? 'w-screen h-screen' : 'w-[80vw] h-[80vh]'}`}
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
      {isGameStarted ? (
        <div className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded">
          생성 간격: {targetConfig.spawnInterval.toFixed(0)}ms
          <br />
          경과 시간: {elapsedTime}초
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={handleGameStart}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            게임 시작
          </button>
        </div>
      )}
    </div>
  );
}; 