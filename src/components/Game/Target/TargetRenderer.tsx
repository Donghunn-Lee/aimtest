import { useEffect, useRef } from 'react';
import { Target } from './types';

interface TargetRendererProps {
  targets: Target[];
  canvas: HTMLCanvasElement;
  position: { x: number; y: number };
  isGameStarted: boolean;
}

export const TargetRenderer = ({ targets, canvas, position, isGameStarted }: TargetRendererProps) => {
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    ctx.current = canvas.getContext('2d');
  }, [canvas]);

  const renderTarget = (target: Target) => {
    if (!ctx.current || target.hit) return;

    // 맵 좌표계에서 화면 좌표계로 변환
    const screenX = target.x;
    const screenY = target.y;
    const size = target.size;

    // 과녁 디자인 - 동심원 그리기
    // 바깥쪽 원 (1점)
    ctx.current.beginPath();
    ctx.current.arc(screenX, screenY, size / 2, 0, Math.PI * 2);
    ctx.current.fillStyle = isGameStarted ? 'white' : 'rgba(255, 0, 0, 1)';  // 게임 종료 시 빨간색
    ctx.current.fill();
    ctx.current.strokeStyle = '#333333';
    ctx.current.lineWidth = 2;
    ctx.current.stroke();

    // 중간 원 (2점)
    ctx.current.beginPath();
    ctx.current.arc(screenX, screenY, size / 3, 0, Math.PI * 2);
    ctx.current.fillStyle = isGameStarted ? 'white' : 'rgba(255, 0, 0, 1)';  // 게임 종료 시 빨간색
    ctx.current.fill();
    ctx.current.strokeStyle = '#333333';
    ctx.current.lineWidth = 2;
    ctx.current.stroke();

    // 안쪽 원 (3점) - 항상 그리기
    ctx.current.beginPath();
    ctx.current.arc(screenX, screenY, size / 6, 0, Math.PI * 2);
    ctx.current.fillStyle = 'rgba(255, 0, 0, 1)';  // 항상 빨간색
    ctx.current.fill();
    ctx.current.strokeStyle = '#333333';
    ctx.current.lineWidth = 2;
    ctx.current.stroke();

    // 정중앙 점 - 항상 그리기
    ctx.current.beginPath();
    ctx.current.arc(screenX, screenY, 1, 0, Math.PI * 2);
    ctx.current.fillStyle = 'white';
    ctx.current.fill();

    // 점수 표시
    ctx.current.font = '12px Arial';
    ctx.current.fillStyle = 'white';
    ctx.current.textAlign = 'center';
    ctx.current.textBaseline = 'middle';
  };

  const render = () => {
    if (!ctx.current) return;

    // 캔버스 변환 적용
    ctx.current.save();
    ctx.current.translate(canvas.width / 2 + position.x, canvas.height / 2 + position.y);

    // 모든 타겟 렌더링
    targets.forEach(renderTarget);

    ctx.current.restore();

    requestAnimationFrame(render);
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, position, isGameStarted]);

  return null;
}; 