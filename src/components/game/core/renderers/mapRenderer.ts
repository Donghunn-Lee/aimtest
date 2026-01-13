/**
 * Map & target-container bounds renderer.
 * - 캔버스 원점이 화면 중심(0,0)이라는 전제에서 맵 이미지를 중앙 기준으로 그린다.
 * - 타겟 컨테이너의 실제 bounds는 외부에서 주입되며, 동일 좌표계로 테두리만 렌더링한다.
 */

export type RenderMapAndBoundsArgs = {
  image: HTMLImageElement;
  width: number;
  height: number;
  drawSize: { width: number; height: number };
  borderOpacity: number;
  /**
   * 타겟 컨테이너의 bounds를 제공하는 콜백.
   * - ctx 상태를 변경하지 않는 범위에서 stroke 등 최소 렌더링만 수행해야 한다.
   */
  drawTargetContainer: (
    onDraw: (bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void
  ) => void;
};

export function renderMapAndBounds(
  ctx: CanvasRenderingContext2D,
  args: RenderMapAndBoundsArgs
) {
  const { image, drawSize, borderOpacity, drawTargetContainer } = args;

  // 캔버스 중심(0,0) 기준으로 맵을 중앙 정렬하여 렌더링
  ctx.drawImage(
    image,
    -drawSize.width / 2,
    -drawSize.height / 2,
    drawSize.width,
    drawSize.height
  );

  // 타겟 컨테이너 경계 가시화(디버그/설정 화면용)
  drawTargetContainer((b) => {
    ctx.strokeStyle = `rgba(255, 0, 0, ${borderOpacity})`;
    ctx.lineWidth = 3;
    ctx.strokeRect(b.x, b.y, b.width, b.height);
  });
}
