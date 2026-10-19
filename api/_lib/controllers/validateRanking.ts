interface RankingInput {
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
}

type ValidationResult =
  { ok: true; value: RankingInput } | { ok: false; error: string };

// DB 컬럼 범위 상한 — rankings.score가 INTEGER라 넘으면 저장 · 비교가 범위 오류(500)가 된다
const INT4_MAX = 2_147_483_647;

export const SCORE_RANGE_ERROR = `score must be an integer from 0 to ${INT4_MAX}`;

export const isValidScore = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= INT4_MAX;

export const validateRanking = (body: unknown): ValidationResult => {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'request body must be a JSON object' };
  }

  const { user_name, score, accuracy, play_time } = body as Record<
    string,
    unknown
  >;

  const name = typeof user_name === 'string' ? user_name.trim() : null;
  if (name === null || name.length < 2 || name.length > 10) {
    return {
      ok: false,
      error: 'user_name must be a string of 2 to 10 characters',
    };
  }

  if (!isValidScore(score)) {
    return { ok: false, error: SCORE_RANGE_ERROR };
  }

  if (
    typeof play_time !== 'number' ||
    !Number.isFinite(play_time) ||
    play_time < 0
  ) {
    return {
      ok: false,
      error: 'play_time must be a non-negative finite number',
    };
  }

  if (
    typeof accuracy !== 'number' ||
    !Number.isFinite(accuracy) ||
    accuracy < 0 ||
    accuracy > 100
  ) {
    return { ok: false, error: 'accuracy must be a number from 0 to 100' };
  }

  // 게임 규칙상 상한 — 최소 스폰 간격 330ms × 타겟당 최대 3점 → 이론 최대 ≈ 9.1점/s.
  // 제한 시간이 없는 서바이벌이라 최대 점수를 상수로 둘 수 없어 play_time에 비례시킨다
  if (score > play_time * 10) {
    return { ok: false, error: 'score must not exceed play_time * 10' };
  }

  return { ok: true, value: { user_name: name, score, accuracy, play_time } };
};
