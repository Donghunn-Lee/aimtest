import { describe, expect, it } from 'vitest';

import { isNonNegativeInteger, validateRanking } from './validateRanking';

describe('validateRanking', () => {
  const valid = {
    user_name: 'ethan',
    score: 30,
    accuracy: 75.5,
    play_time: 12.3,
  };

  it('정상 4필드 → ok, user_name은 trim된 값', () => {
    expect(validateRanking({ ...valid, user_name: '  ethan  ' })).toEqual({
      ok: true,
      value: { ...valid, user_name: 'ethan' },
    });
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['배열', []],
  ])('body %s → 실패', (_, body) => {
    expect(validateRanking(body)).toMatchObject({ ok: false });
  });

  // ' a '는 trim 전 3자라 trim 뒤 길이를 보는지 가른다
  it.each([
    ['비문자열', 123],
    ['trim 후 1자', ' a '],
    ['11자', 'a'.repeat(11)],
  ])('user_name %s → 실패', (_, user_name) => {
    expect(validateRanking({ ...valid, user_name })).toMatchObject({
      ok: false,
      error: expect.stringContaining('user_name'),
    });
  });

  // 허용 구간 2 ~ 10의 양 끝
  it.each([
    ['2자', 'ab'],
    ['10자', 'a'.repeat(10)],
  ])('user_name %s → ok', (_, user_name) => {
    expect(validateRanking({ ...valid, user_name }).ok).toBe(true);
  });

  // '10'은 숫자로 변환하면 통과하는 값이라 타입 검사를 가른다
  it.each([
    ['소수', 2.5],
    ['음수', -1],
    ['문자열', '10'],
  ])('score %s → 실패', (_, score) => {
    expect(validateRanking({ ...valid, score })).toMatchObject({
      ok: false,
      error: expect.stringContaining('score'),
    });
  });

  it('score 0 → ok', () => {
    expect(validateRanking({ ...valid, score: 0 }).ok).toBe(true);
  });

  // Infinity는 number · 0 이상이라 isFinite 검사만 걸러낸다
  it.each([
    ['음수', -1],
    ['Infinity', Infinity],
    ['문자열', '12'],
  ])('play_time %s → 실패', (_, play_time) => {
    expect(validateRanking({ ...valid, play_time })).toMatchObject({
      ok: false,
      error: expect.stringContaining('play_time'),
    });
  });

  // 허용 구간 0 ~ 100의 바로 바깥
  it.each([-0.1, 100.1])('accuracy %s → 실패', (accuracy) => {
    expect(validateRanking({ ...valid, accuracy })).toMatchObject({
      ok: false,
      error: expect.stringContaining('accuracy'),
    });
  });

  it.each([0, 100])('accuracy %s → ok', (accuracy) => {
    expect(validateRanking({ ...valid, accuracy }).ok).toBe(true);
  });

  // play_time × 10과 같은 점수는 허용, 1점 넘으면 거부 — 등호 경계
  it('play_time 1 · score 11 → 실패', () => {
    expect(
      validateRanking({ ...valid, play_time: 1, score: 11 })
    ).toMatchObject({ ok: false, error: expect.stringContaining('play_time') });
  });

  it('play_time 1 · score 10 → ok', () => {
    expect(validateRanking({ ...valid, play_time: 1, score: 10 }).ok).toBe(
      true
    );
  });
});

describe('isNonNegativeInteger', () => {
  it.each([3, 0])('%o → true', (value) => {
    expect(isNonNegativeInteger(value)).toBe(true);
  });

  // '3'은 숫자로 변환하면 통과하는 값이라 타입 검사를 가른다
  it.each([-1, 1.5, NaN, '3'])('%o → false', (value) => {
    expect(isNonNegativeInteger(value)).toBe(false);
  });
});
