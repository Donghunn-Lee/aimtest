import { useCallback, useEffect, useRef } from 'react';

import type { RenderMapAndBoundsArgs } from '@/components/game/core/renderers/mapRenderer';
import { CAMERA } from '@/constants/render';
import type { Target } from '@/types/target';
import { setCanvasSizeDPR } from '@/utils/canvas';

export type Camera = { x: number; y: number };

export type CanvasRenderServices = {
  /** 프레임 시작 시 캔버스 초기화 */
  clearCanvas: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => void;

  /** 카메라 위치 기반으로 캔버스 변환 적용 */
  applyCameraTransform: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    cam: Camera
  ) => void;

  /** applyCameraTransform 이전 상태로 복원 */
  endCameraTransform: (ctx: CanvasRenderingContext2D) => void;

  /** 맵 배경 + 테두리(경계) 렌더링 */
  renderMapAndBounds: (
    ctx: CanvasRenderingContext2D,
    args: RenderMapAndBoundsArgs
  ) => void;

  /** 활성 타겟 리스트 렌더링 */
  renderTargets: (args: {
    ctx: CanvasRenderingContext2D;
    targets: Target[];
    graceStartAt: number | null;
    isGameOver: boolean;
  }) => void;

  /** 플로팅 스코어 위치·수명 업데이트 */
  updateFloatingScores: (dtMs: number) => void;

  /** 플로팅 스코어 시각적 렌더링 */
  drawFloatingScores: (
    ctx: CanvasRenderingContext2D,
    targetSize: number
  ) => void;

  /** 현재 타겟 크기(px) 계산 */
  getTargetSize: () => number;

  /** 타겟 컨테이너(bounds) 계산 후 콜백에 전달 */
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
  /** 렌더링 대상 캔버스 ref */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  /** 맵/배경 이미지 */
  image: HTMLImageElement | null;

  /** calculateAspectFit 으로 계산된 실제 드로잉 영역 크기 */
  drawSizeRef: React.RefObject<{ width: number; height: number }>;

  /** 렌더링할 타겟 배열 ref */
  targetsRef: React.RefObject<Target[]>;

  /** 게임 상태 일부(graceStartAt, isGameOver)를 루프에서 참조하기 위한 최소 정보 */
  gameRef: React.RefObject<{
    graceStartAt: number | null;
    isGameOver: boolean;
  }>;

  /** 경계 테두리(fade 효과) 투명도 ref */
  borderOpacityRef: React.RefObject<number>;
  services: CanvasRenderServices;
  options?: {
    autoPauseOnHidden?: boolean;
  };
};

export type CanvasRenderLoopApi = {
  start: () => void;
  stop: () => void;
  nudgeCamera: (dx: number, dy: number) => void;
  setCamera: (pos: Camera) => void;
  getCamera: () => Camera;
};

/**
 * 캔버스 기반 게임 렌더 루프 관리 훅
 * - rAF(requestAnimationFrame) 루프로 맵/타겟/플로팅 스코어 프레임별 렌더링
 * - 카메라 위치/클램프 및 입력 누적(nudgeCamera) 처리
 * - 실제 그리기/계산은 services로 위임하고, 루프·카메라·타이밍만 책임
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

  // 엔진 내부 상태
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const runningRef = useRef(false); // start/stop idempotent 보장
  const cameraRef = useRef<Camera>(CAMERA.INITIAL);
  const pendingDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // 입력 누적(프레임 시작 시 적용)

  // 프레임 타이밍/통계
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
    const canvas = canvasRef.current;
    const ctx = getCtx();
    const drawSize = drawSizeRef.current;
    const imageSrc = image;

    // 준비 안 됐으면 다음 프레임에서 재시도 (루프는 유지)
    if (!canvas || !ctx || !imageSrc || !drawSize || drawSize.width === 0) {
      rafIdRef.current = window.requestAnimationFrame(frame);
      return;
    }

    // 1) 초기화
    services.clearCanvas(ctx, canvas);

    // 2) 입력 델타 반영(프레임 경계에서만 반영해 경쟁 조건/부하 방지)
    if (pendingDeltaRef.current.x || pendingDeltaRef.current.y) {
      cameraRef.current.x += pendingDeltaRef.current.x;
      cameraRef.current.y += pendingDeltaRef.current.y;
      pendingDeltaRef.current.x = 0;
      pendingDeltaRef.current.y = 0;
    }

    // 3) 카메라 클램프: 맵(drawSize) 대비 뷰포트(canvas) 경계 내로 제한
    const maxX = (drawSize.width - canvas.width) * 0.5;
    const maxY = (drawSize.height - canvas.height) * 0.5;

    if (isFinite(maxX) && isFinite(maxY)) {
      cameraRef.current.x = clamp(cameraRef.current.x, -maxX, maxX);
      cameraRef.current.y = clamp(cameraRef.current.y, -maxY, maxY);
    }

    // 4) 카메라 변환 적용(이후는 맵 좌표계 기준)
    services.applyCameraTransform(ctx, canvas, cameraRef.current);

    // 5) 시간/통계 갱신(EMA FPS)
    const now = performance.now();
    const last = lastTimeRef.current || now;
    const dt = now - last;
    lastTimeRef.current = now;

    // 6) 업데이트(상태 변화) → 7) 그리기(시각화) 순서 유지
    services.updateFloatingScores(dt);

    // 7) 타겟 컨테이너 및 타겟 렌더링
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

    // 8) 캔버스 상태 복원
    services.endCameraTransform(ctx);

    // 9) 다음 프레임 예약
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
    if (canvas) {
      setCanvasSizeDPR(canvas);
    }
    runningRef.current = true;
    lastTimeRef.current = performance.now();
    rafIdRef.current = window.requestAnimationFrame(frame);
  }, [frame]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafIdRef.current != null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  // 언마운트 정리(raf 누수 방지)
  useEffect(() => stop, [stop]);

  // 입력은 누적만 하고, 실제 적용은 프레임 경계에서 수행
  const nudgeCamera = useCallback((dx: number, dy: number) => {
    pendingDeltaRef.current.x += dx;
    pendingDeltaRef.current.y += dy;
  }, []);

  // 카메라 위치 설정: 추후 자동 카메라 이동이 필요할 때 사용
  const setCamera = useCallback((pos: Camera) => {
    cameraRef.current.x = pos.x;
    cameraRef.current.y = pos.y;
  }, []);

  const getCamera = useCallback(() => ({ ...cameraRef.current }), []);

  return { start, stop, nudgeCamera, setCamera, getCamera };
};
