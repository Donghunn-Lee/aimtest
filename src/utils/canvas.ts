export function setCanvasSizeDPR(canvas: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const { clientWidth, clientHeight } = canvas;
  canvas.width = Math.floor(clientWidth * dpr);
  canvas.height = Math.floor(clientHeight * dpr);
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 아이덴티티×DPR
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  // 항상 아이덴티티(또는 DPR만 적용된) 상태에서 전체 클리어
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  position: { x: number; y: number }
) {
  // 필수: 루프 한 곳만 변환을 관리
  ctx.save();
  // 화면 중심 기준으로 카메라 이동
  ctx.translate(
    canvas.width / (2 * (window.devicePixelRatio || 1)),
    canvas.height / (2 * (window.devicePixelRatio || 1))
  );
  ctx.translate(position.x, position.y);
}

export function endCameraTransform(ctx: CanvasRenderingContext2D) {
  ctx.restore();
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillStyle: string,
  strokeStyle: string = '#333333',
  lineWidth: number = Math.max(Math.floor(radius * 0.1), 1)
) {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}
