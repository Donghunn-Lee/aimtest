import { describe, expect, it } from 'vitest';

import { formatPlayTime } from '@/services/rankingService';

describe('formatPlayTime', () => {
  // 소수부는 2진수로 정확한 값(.25 · .5 · .75)과 정확하지 않은 값(.29 → 28.999…)을 섞는다
  it.each([
    [0, '00:00.00'],
    [0.25, '00:00.25'],
    [0.29, '00:00.29'],
    [65.5, '01:05.50'],
    // 분이 두 자리를 넘으면 padStart가 자르지 않고 그대로 늘어난다
    [6000.75, '100:00.75'],
  ])('%fs → %s', (seconds, expected) => {
    expect(formatPlayTime(seconds)).toBe(expected);
  });
});
