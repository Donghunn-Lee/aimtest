import { useRef, useEffect } from 'react';
import { Crosshair } from './Crosshair';

export const GameWorld = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerLocked = useRef(false);
  const mouseMovement = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawSizeRef = useRef({ width: 0, height: 0 });

  // 캔버스 크기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
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

    const image = new Image();
    imageRef.current = image;
    image.onload = () => {
      // 이미지 크기 계산 (전체 화면)
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

      // 이미지를 배율 (3배)
      drawWidth *= 3;
      drawHeight *= 3;
      drawSizeRef.current = { width: drawWidth, height: drawHeight };
    };
    image.onerror = (error) => {
      console.error('Failed to load image:', error);
    };
    image.src = '/map.svg';

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

      ctx.restore();

      requestAnimationFrame(render);
    };

    render();
  }, []);

  // 마우스 이벤트 처리
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

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

    const handleClick = () => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock();
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="game-world">
      <canvas ref={canvasRef} className="w-full h-full" style={{ background: '#000' }} />
      <Crosshair />
    </div>
  );
}; 