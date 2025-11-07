import { Target } from '@/types/target';

import { drawCircle } from '@/utils/canvas';
import { decideTargetColor } from '@/utils/target';

type RenderTargetsParams = {
  ctx: CanvasRenderingContext2D;
  targets: Target[];
  graceStartAt: number | null;
  isGameOver: boolean;
};

export function renderTargets({
  ctx,
  targets,
  graceStartAt,
  isGameOver,
}: RenderTargetsParams) {
  const targetColor = decideTargetColor(isGameOver, graceStartAt);

  for (const t of targets) {
    const x = Math.round(t.x) + 0.5;
    const y = Math.round(t.y) + 0.5;

    drawCircle(ctx, x, y, t.size / 2, targetColor);
    drawCircle(ctx, x, y, t.size / 3, targetColor);
    drawCircle(ctx, x, y, t.size / 6, '#FF0000');
  }
}
