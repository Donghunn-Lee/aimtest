import { describe, expect, it } from 'vitest';

import { formatPlayTime } from '@/services/rankingService';

describe('formatPlayTime', () => {
  // 소수부는 2진수로 정확한 값(.25 · .5 · .75)만 쓴다 — (0.29 % 1) * 100이 28.999…가 되는
  // 부동소수 절삭 문제가 있어, 정수 연산으로 고친 뒤 그런 케이스를 추가한다
  it.each([
    [0, '00:00:00'],
    [0.25, '00:00:25'],
    [65.5, '01:05:50'],
    // 분이 두 자리를 넘으면 padStart가 자르지 않고 그대로 늘어난다
    [6000.75, '100:00:75'],
  ])('%fs → %s', (seconds, expected) => {
    expect(formatPlayTime(seconds)).toBe(expected);
  });
});
