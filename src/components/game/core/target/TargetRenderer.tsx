import { useEffect, useRef } from 'react';

import { Target } from '@/types/target';

import { applyCanvasTransform, drawCircle } from '@/utils/canvas';
import { decideTargetColor } from '@/utils/target';

import { CANVAS_COLORS, CANVAS_STYLES } from '@/constants/canvas';

interface TargetRendererProps {
  targets: Target[];
  canvas: HTMLCanvasElement;
  position: { x: number; y: number };
  graceStartAt: number | null;
  isGameOver: boolean;
}

export const TargetRenderer = ({
  targets,
  canvas,
  position,
  graceStartAt,
  isGameOver,
}: TargetRendererProps) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    ctxRef.current = canvas.getContext('2d');
  }, [canvas]);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrame);
  }, [targets, position, isGameOver, graceStartAt]);

  const renderTarget = (target: Target, targetColor: string) => {
    const ctx = ctxRef.current;
    if (!ctx || target.hit) return;

    const screenX = target.x;
    const screenY = target.y;
    const size = target.size;

    // 바깥쪽 원 (1점)
    drawCircle(ctx, screenX, screenY, size / 2, targetColor);

    // 중간 원 (2점)
    drawCircle(ctx, screenX, screenY, size / 3, targetColor);

    // 중앙 원 (3점)
    drawCircle(ctx, screenX, screenY, size / 6, '#FF0000');

    // 점수 표시
    ctx.font = CANVAS_STYLES.TARGET_FONT;
    ctx.fillStyle = CANVAS_COLORS.target.expired;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
  };

  const render = () => {
    if (!ctxRef.current) return;

    const targetColor = decideTargetColor(isGameOver, graceStartAt);

    applyCanvasTransform(ctxRef.current, canvas.width, canvas.height, position);
    targets.forEach((t) => renderTarget(t, targetColor));
    ctxRef.current.restore();

    requestAnimationFrame(render);
  };

  return null;
};
