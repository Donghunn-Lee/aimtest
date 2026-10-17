import { describe, expect, it } from 'vitest';

import {
  calculateContainerBounds,
  getDefaultConfig,
} from '@/utils/targetContainer';

describe('getDefaultConfig', () => {
  it.each([
    [16 / 9, 16 / 9],
    [16 / 10, 16 / 10],
    [4 / 3, 4 / 3],
    // 목록에 없는 비율은 4/3 설정으로 폴백한다
    [21 / 9, 4 / 3],
  ])('resolution %f → mapAspectRatio %f', (resolution, expected) => {
    expect(getDefaultConfig(resolution).mapAspectRatio).toBe(expected);
  });
});

describe('calculateContainerBounds', () => {
  const config = getDefaultConfig(16 / 9);

  // gameArea가 맵보다 넓으면(>) 높이 기준: 맵 폭은 1080 × 16/9 = 1920
  it('맵보다 넓은 영역은 높이 기준으로 맵 폭을 정한다', () => {
    const bounds = calculateContainerBounds(
      { width: 2560, height: 1080 },
      config
    );

    expect(bounds.width).toBeCloseTo(1920 / config.widthScaleRatio);
    expect(bounds.height).toBeCloseTo(1080 / config.heightScaleRatio);
  });

  // 비율이 같으면 > 가 아니므로 폭 기준 분기로 간다 — 결과는 같은 수치
  it('맵과 같은 비율은 폭 기준으로 가도 같은 bounds가 나온다', () => {
    const bounds = calculateContainerBounds(
      { width: 1920, height: 1080 },
      config
    );

    expect(bounds.width).toBeCloseTo(1920 / config.widthScaleRatio);
    expect(bounds.height).toBeCloseTo(1080 / config.heightScaleRatio);
  });

  // 정사각형 영역은 폭 기준: 맵 높이 = 1080 / (16/9) = 607.5
  it('맵보다 좁은 영역은 폭 기준으로 맵 높이를 정한다', () => {
    const bounds = calculateContainerBounds(
      { width: 1080, height: 1080 },
      config
    );

    expect(bounds.width).toBeCloseTo(1080 / config.widthScaleRatio);
    expect(bounds.height).toBeCloseTo(607.5 / config.heightScaleRatio);
  });

  // x는 -(폭/2)/scale, width는 폭/scale이므로 항상 가로 중앙(x = -width/2)
  it('가로 중앙 정렬: x = -width / 2', () => {
    const bounds = calculateContainerBounds(
      { width: 1920, height: 1080 },
      config
    );

    expect(bounds.x).toBeCloseTo(-bounds.width / 2);
  });

  // y는 타겟 영역 절반을 위로 올린 뒤 맵 높이 × verticalOffsetRatio만큼 내린다
  it('세로 오프셋: y = -targetAreaHeight / 2 + mapHeight × verticalOffsetRatio', () => {
    const bounds = calculateContainerBounds(
      { width: 1920, height: 1080 },
      config
    );

    expect(bounds.y).toBeCloseTo(-1080 / 2 + 1080 * config.verticalOffsetRatio);
  });
});
