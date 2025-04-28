export interface Resolution {
  name: string;
  width: number;
  height: number;
  ratio: number;
}

export const RESOLUTIONS: Resolution[] = [
  {
    name: '16:9 (1920x1080)',
    width: 1920,
    height: 1080,
    ratio: 16 / 9,
  },
  {
    name: '4:3 (1280x960)',
    width: 1280,
    height: 960,
    ratio: 4 / 3,
  },
  {
    name: '16:10 (1920x1200)',
    width: 1920,
    height: 1200,
    ratio: 16 / 10,
  },
];

export const DEFAULT_RESOLUTION = RESOLUTIONS[0];
