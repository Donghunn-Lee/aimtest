import { useCallback, useEffect, useRef } from 'react';

import type { RenderMapAndBoundsArgs } from '@/components/game/core/renderers/mapRenderer';
import { CAMERA } from '@/constants/render';
import type { Target } from '@/types/target';
import { setCanvasSizeDPR } from '@/utils/canvas';

export type Camera = { x: number; y: number };

export type CanvasRenderServices = {
  /** 프레임 시작 처리 */
  clearCanvas: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => void;

  /** 카메라 변환 적용 */
  applyCameraTransform: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    cam: Camera
  ) => void;

  /** 변환 복원 */
  endCameraTransform: (ctx: CanvasRenderingContext2D) => void;

  /** 맵 + 컨테이너 경계 렌더링 */
  renderMapAndBounds: (
    ctx: CanvasRenderingContext2D,
    args: RenderMapAndBoundsArgs
  ) => void;

  /** 타겟 렌더링 */
  renderTargets: (args: {
    ctx: CanvasRenderingContext2D;
    targets: Target[];
    graceStartAt: number | null;
    isGameOver: boolean;
  }) => void;

  /** 플로팅 스코어 업데이트 */
  updateFloatingScores: (dtMs: number) => void;

  /** 플로팅 스코어 렌더링 */
  drawFloatingScores: (
    ctx: CanvasRenderingContext2D,
    targetSize: number
  ) => void;

  /** 타겟 크기 계산 */
  getTargetSize: () => number;

  /** 타겟 컨테이너(bounds) 계산 → 콜백 전달 */
  drawTargetContainer: (
    onDraw: (bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void
  ) => void;
};

export type CanvasRenderLoopOptions = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  image: HTMLImageElement | null;
  drawSizeRef: React.RefObject<{ width: number; height: number }>;
  targetsRef: React.RefObject<Target[]>;
  gameRef: React.RefObject<{
    graceStartAt: number | null;
    isGameOver: boolean;
  }>;
  borderOpacityRef: React.RefObject<number>;
  services: CanvasRenderServices;
};

export type CanvasRenderLoopApi = {
  start: () => void;
  stop: () => void;
  nudgeCamera: (dx: number, dy: number) => void;
  setCamera: (pos: Camera) => void;
  getCamera: () => Camera;
};

/**
 * 캔버스 rAF 렌더 루프 관리
 * - 루프 단일화(start/stop 멱등)
 * - 입력 델타 누적 → 프레임 경계 반영
 * - 카메라 클램프 및 좌표계 변환 경계 유지
 * - 실제 렌더/업데이트는 services로 위임
 */
export const useCanvasRenderLoop = (
  options: CanvasRenderLoopOptions
): CanvasRenderLoopApi => {
  const {
    canvasRef,
    image,
    drawSizeRef,
    targetsRef,
    gameRef,
    borderOpacityRef,
    services,
  } = options;

  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const cameraRef = useRef<Camera>(CAMERA.INITIAL);
  const pendingDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);

  const getCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    return ctx;
  }, [canvasRef]);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const frame = useCallback(() => {
    // stop 이후 프레임 재예약 방지
    if (!runningRef.current) return;

    const canvas = canvasRef.current;
    const ctx = getCtx();
    const drawSize = drawSizeRef.current;
    const imageSrc = image;

    if (!canvas || !ctx || !imageSrc || !drawSize || drawSize.width === 0) {
      rafIdRef.current = window.requestAnimationFrame(frame);
      return;
    }

    services.clearCanvas(ctx, canvas);

    if (pendingDeltaRef.current.x || pendingDeltaRef.current.y) {
      cameraRef.current.x += pendingDeltaRef.current.x;
      cameraRef.current.y += pendingDeltaRef.current.y;
      pendingDeltaRef.current.x = 0;
      pendingDeltaRef.current.y = 0;
    }

    const maxX = (drawSize.width - canvas.width) * 0.5;
    const maxY = (drawSize.height - canvas.height) * 0.5;

    if (isFinite(maxX) && isFinite(maxY)) {
      cameraRef.current.x = clamp(cameraRef.current.x, -maxX, maxX);
      cameraRef.current.y = clamp(cameraRef.current.y, -maxY, maxY);
    }

    services.applyCameraTransform(ctx, canvas, cameraRef.current);

    const now = performance.now();
    const last = lastTimeRef.current || now;
    const dt = now - last;
    lastTimeRef.current = now;

    services.updateFloatingScores(dt);

    services.renderMapAndBounds(ctx, {
      image: imageSrc,
      width: canvas.width,
      height: canvas.height,
      drawSize: { width: drawSize.width, height: drawSize.height },
      borderOpacity: borderOpacityRef.current ?? 0,
      drawTargetContainer: services.drawTargetContainer,
    });

    services.renderTargets({
      ctx,
      targets: targetsRef.current || [],
      graceStartAt: gameRef.current?.graceStartAt ?? null,
      isGameOver: !!gameRef.current?.isGameOver,
    });

    const targetSize = services.getTargetSize();
    services.drawFloatingScores(ctx, targetSize);

    services.endCameraTransform(ctx);

    if (!runningRef.current) return;
    rafIdRef.current = window.requestAnimationFrame(frame);
  }, [
    canvasRef,
    drawSizeRef,
    image,
    services,
    targetsRef,
    gameRef,
    borderOpacityRef,
    getCtx,
  ]);

  const start = useCallback(() => {
    if (runningRef.current) return;

    const canvas = canvasRef.current;
    if (canvas) setCanvasSizeDPR(canvas);

    runningRef.current = true;
    lastTimeRef.current = performance.now();
    rafIdRef.current = window.requestAnimationFrame(frame);
  }, [canvasRef, frame]);

  const stop = useCallback(() => {
    runningRef.current = false;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const nudgeCamera = useCallback((dx: number, dy: number) => {
    pendingDeltaRef.current.x += dx;
    pendingDeltaRef.current.y += dy;
  }, []);

  const setCamera = useCallback((pos: Camera) => {
    cameraRef.current.x = pos.x;
    cameraRef.current.y = pos.y;
  }, []);

  const getCamera = useCallback(() => ({ ...cameraRef.current }), []);

  return { start, stop, nudgeCamera, setCamera, getCamera };
};
