export const UI = {
  WINDOW_PADDING: 24, // px
  BORDER_OPACITY: 0.7,
  BORDER_FADE_MS: 1000,
} as const;

export const GAMEPLAY = {
  GRACE_TARGET_THRESHOLD: 10,
  ELAPSED_TICK_MS: 100,
} as const;

export const INPUT = {
  SENSITIVITY_DEFAULT: 1,
  SENSITIVITY_MIN: 0.1,
  SENSITIVITY_MAX: 5.0,
} as const;

export const ASSET = {
  MAP_SRC: '/map.svg',
} as const;
