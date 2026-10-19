interface RankingInput {
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
}

type ValidationResult =
  { ok: true; value: RankingInput } | { ok: false; error: string };

export const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

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

  if (!isNonNegativeInteger(score)) {
    return { ok: false, error: 'score must be a non-negative integer' };
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

  // 최소 스폰 간격 330ms × 타겟당 최대 3점 → 이론 최대 ≈ 9.1점/s. 제한 시간이 없어 상수 상한은 둘 수 없다
  if (score > play_time * 10) {
    return { ok: false, error: 'score must not exceed play_time * 10' };
  }

  return { ok: true, value: { user_name: name, score, accuracy, play_time } };
};
