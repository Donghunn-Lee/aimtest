export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
};

export const applyCanvasTransform = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  position: { x: number; y: number }
) => {
  ctx.save();
  ctx.translate(canvasWidth / 2 + position.x, canvasHeight / 2 + position.y);
};

export const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillStyle: string,
  strokeStyle: string = '#333333',
  lineWidth: number = Math.max(Math.floor(radius * 0.1), 1)
) => {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};
