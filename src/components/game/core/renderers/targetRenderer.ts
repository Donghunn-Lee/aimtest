import { Target } from '@/types/target';

import { drawCircle } from '@/utils/canvas';
import { decideTargetColor } from '@/utils/target';

type renderTargetsParams = {
  ctx: CanvasRenderingContext2D;
  targets: Target[];
  graceStartAt: number | null;
  isGameOver: boolean;
};

export const renderTargets = ({
  ctx,
  targets,
  graceStartAt,
  isGameOver,
}: renderTargetsParams) => {
  const targetColor = decideTargetColor(isGameOver, graceStartAt);

  for (const t of targets) {
    const x = Math.round(t.x) + 0.5;
    const y = Math.round(t.y) + 0.5;

    drawCircle(ctx, x, y, t.size / 2, targetColor);
    drawCircle(ctx, x, y, t.size / 3, targetColor);
    drawCircle(ctx, x, y, t.size / 6, '#FF0000');
  }
};
