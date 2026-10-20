import { CANVAS_COLORS } from '@/constants/canvas';
import { GAMEPLAY } from '@/constants/game';
import { SPAWN } from '@/constants/target';

// 종료 유예 시간 타겟 색상 결정
export function decideTargetColor(
  isGameOver: boolean,
  graceStartAt: number | null,
  now: number = Date.now()
) {
  if (isGameOver) return CANVAS_COLORS.target.expired;

  if (graceStartAt !== null) {
    // 유예 시간을 3등분해 warning → danger → critical 순으로 올린다
    const elapsed = now - graceStartAt;
    if (elapsed < GAMEPLAY.GRACE_DURATION_MS / 3)
      return CANVAS_COLORS.target.warning;
    if (elapsed < (GAMEPLAY.GRACE_DURATION_MS * 2) / 3)
      return CANVAS_COLORS.target.danger;
    return CANVAS_COLORS.target.critical;
  }

  return CANVAS_COLORS.target.base; // 기본
}

// 경과 시간에 따른 타겟 생성 간격(ms) — BASE에서 초당 DECAY 비율로 지수 감소, MIN이 하한
export function computeSpawnInterval(elapsedMs: number): number {
  const elapsedSeconds = elapsedMs / 1000;
  const interval =
    SPAWN.BASE_INTERVAL_MS * Math.pow(SPAWN.DECAY_PER_SEC, elapsedSeconds);

  return Math.max(SPAWN.MIN_INTERVAL_MS, interval);
}
