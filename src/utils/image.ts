export interface Size {
  width: number;
  height: number;
}

export const calculateAspectFit = (
  img: HTMLImageElement | null,
  canvasH: number,
  canvasW: number,
  drawSizeRef: { width: number; height: number },
  scale = 1
) => {
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
};
