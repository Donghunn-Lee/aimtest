/**
 * Target renderer.
 * - 캔버스 좌표계 기준으로 타겟을 원형 레이어로 렌더링한다.
 * - 좌표는 반픽셀 정렬을 적용해 흐림을 최소화한다.
 * - 색상 결정은 게임 상태(grace/game over)에 따라 외부 로직에 위임한다.
 */

import { Target } from '@/types/target';
import { drawCircle } from '@/utils/canvas';
import { decideTargetColor } from '@/utils/target';

type RenderTargetsParams = {
  ctx: CanvasRenderingContext2D;
  targets: Target[];
  graceStartAt: number | null;
  isGameOver: boolean;
};

/**
 * 모든 활성 타겟을 렌더링한다.
 */
export function renderTargets({
  ctx,
  targets,
  graceStartAt,
  isGameOver,
}: RenderTargetsParams) {
  const targetColor = decideTargetColor(isGameOver, graceStartAt);

  for (const t of targets) {
    // 반픽셀 정렬로 stroke/edge 선명도 확보
    const x = Math.round(t.x) + 0.5;
    const y = Math.round(t.y) + 0.5;

    drawCircle(ctx, x, y, t.size / 2, targetColor);
    drawCircle(ctx, x, y, t.size / 3, targetColor);
    drawCircle(ctx, x, y, t.size / 6, '#FF0000');
  }
}
