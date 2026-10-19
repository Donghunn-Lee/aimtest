export const TARGET_DEFAULT = {
  size: 50,
  margin: 0,
  maxTargets: 200,
} as const;

export const SPAWN = {
  BASE_INTERVAL_MS: 1000, // 시작 생성 간격
  // 서버 검증 상한(score ≤ play_time × 10)이 이 값과 타겟당 최대 3점에서 나오므로 줄이면 validateRanking도 함께 본다
  MIN_INTERVAL_MS: 330, // 최소 생성 간격 (하한선)
  DECAY_PER_SEC: 0.982, // 초당 간격 감소율 (난이도 곡선)
  STALL_CLAMP_MS: 100, // 스톨 방지용 최소 클램프
} as const;
