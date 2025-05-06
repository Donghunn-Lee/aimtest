import { useEffect, useRef } from 'react';
import { Target } from '@/types/target';
import { applyCanvasTransform, drawCircle } from '@/utils/canvas';
import { CANVAS_COLORS, CANVAS_STYLES } from '@/constants/canvas';

interface TargetRendererProps {
  targets: Target[];
  canvas: HTMLCanvasElement;
  position: { x: number; y: number };
  isGameStarted: boolean;
}

export const TargetRenderer = ({
  targets,
  canvas,
  position,
  isGameStarted,
}: TargetRendererProps) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    ctxRef.current = canvas.getContext('2d');
  }, [canvas]);

  const renderTarget = (target: Target) => {
    const ctx = ctxRef.current;
    if (!ctx || target.hit) return;

    const screenX = target.x;
    const screenY = target.y;
    const size = target.size;

    // 바깥쪽 원 (1점)
    drawCircle(
      ctx,
      screenX,
      screenY,
      size / 2,
      isGameStarted ? CANVAS_COLORS.TARGET_OUTER : CANVAS_COLORS.TARGET_INNER
    );

    // 중간 원 (2점)
    drawCircle(
      ctx,
      screenX,
      screenY,
      size / 3,
      isGameStarted ? CANVAS_COLORS.TARGET_OUTER : CANVAS_COLORS.TARGET_INNER
    );

    // 안쪽 원 (3점)
    drawCircle(ctx, screenX, screenY, size / 6, CANVAS_COLORS.TARGET_INNER);

    // 정중앙 점
    drawCircle(
      ctx,
      screenX,
      screenY,
      CANVAS_STYLES.TARGET_CENTER_RADIUS,
      CANVAS_COLORS.TARGET_CENTER
    );

    // 점수 표시
    ctx.font = CANVAS_STYLES.TARGET_FONT;
    ctx.fillStyle = CANVAS_COLORS.TARGET_CENTER;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  };

  const render = () => {
    if (!ctxRef.current) return;

    applyCanvasTransform(ctxRef.current, canvas.width, canvas.height, position);
    targets.forEach(renderTarget);
    ctxRef.current.restore();

    requestAnimationFrame(render);
  };

  useEffect(() => {
    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, position, isGameStarted]);

  return null;
};
