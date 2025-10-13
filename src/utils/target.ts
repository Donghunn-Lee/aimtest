import { CANVAS_COLORS } from '@/constants/canvas';

// 종료 유예 시간 타겟 색상 결정
export const decideTargetColor = (
  isGameOver: boolean,
  graceStartAt: number | null
) => {
  if (isGameOver) return CANVAS_COLORS.target.expired;

  if (graceStartAt !== null) {
    const elapsed = (Date.now() - graceStartAt) / 1000;
    if (elapsed < 1) return CANVAS_COLORS.target.warning; // 0~1s
    if (elapsed < 2) return CANVAS_COLORS.target.danger; // 1~2s
    return CANVAS_COLORS.target.critical; // 2~3s
  }

  return CANVAS_COLORS.target.base; // 기본
};
