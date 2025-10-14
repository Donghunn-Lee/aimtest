export const renderMapAndBounds = (
  ctx: CanvasRenderingContext2D,
  args: {
    image: HTMLImageElement;
    width: number;
    height: number;
    drawSize: { width: number; height: number };
    borderOpacity: number;
    drawTargetContainer: (
      onDraw: (bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
      }) => void
    ) => void;
  }
) => {
  const { image, width, height, drawSize, borderOpacity, drawTargetContainer } =
    args;

  // 맵
  ctx.drawImage(
    image,
    -drawSize.width / 2,
    -drawSize.height / 2,
    drawSize.width,
    drawSize.height
  );

  // 컨테이너 테두리
  drawTargetContainer((b) => {
    ctx.strokeStyle = `rgba(255, 0, 0, ${borderOpacity})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  });
};
