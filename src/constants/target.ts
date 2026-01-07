export const TARGET_DEFAULT = {
  size: 50,
  margin: 0,
  maxTargets: 200,
  spawnInterval: 1000,
} as const;

export const SPAWN = {
  BASE_INTERVAL_MS: 1000, // 시작 생성 간격
  MIN_INTERVAL_MS: 330, // 최소 생성 간격 (하한선)
  DECAY_PER_SEC: 0.982, // 초당 간격 감소율 (난이도 곡선)
  STALL_CLAMP_MS: 100, // 스톨 방지용 최소 클램프
} as const;

export const SYNC = {
  INTERVAL_MS: 8, // 타겟 상태 동기화 주기 (약 120hz)
} as const;
