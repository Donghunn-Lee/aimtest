/**
 * 2D 좌표 (x, y)
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 맵 크기 (너비, 높이)
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * 게임 화면 모드
 * - fullscreen: 전체 화면 (F11 등)
 * - windowed: 창 모드 (비율 유지)
 */
export type GameMode = 'fullscreen' | 'windowed';
