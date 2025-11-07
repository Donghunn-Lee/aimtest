import type { Resolution } from '@/types/image';

export function calculateAspectFit(
  img: HTMLImageElement | null,
  canvasH: number,
  canvasW: number,
  drawSizeRef: { width: number; height: number },
  scale = 1
) {
  if (!img) return;

  const imageAspect = img.width / img.height;
  const canvasAspect = canvasW / canvasH;
  let w = canvasW;
  let h = canvasH;

  if (imageAspect > canvasAspect) {
    h = canvasW / imageAspect;
  } else {
    w = canvasH * imageAspect;
  }

  drawSizeRef.width = w * scale;
  drawSizeRef.height = h * scale;
}

export const RESOLUTIONS: Resolution[] = [
  {
    name: '16:9',
    width: 1920,
    height: 1080,
    ratio: 16 / 9,
  },
  {
    name: '16:10',
    width: 1920,
    height: 1200,
    ratio: 16 / 10,
  },
  {
    name: '4:3',
    width: 1280,
    height: 960,
    ratio: 4 / 3,
  },
];

export const DEFAULT_RESOLUTION = RESOLUTIONS[0];
