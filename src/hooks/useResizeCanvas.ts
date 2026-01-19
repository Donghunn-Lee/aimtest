import { useCallback, useEffect, useRef } from 'react';

import type { GameMode } from '@/types/game';
import { setCanvasSizeDPR } from '@/utils/canvas';

export interface UseResizeCanvasOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  mode: GameMode;
  ratio: number;

  /** windowed 모드에서 양쪽 여백으로 남겨둘 최소 패딩(px) */
  windowPadding?: number;

  /** 캔버스 실제 픽셀 크기 변경 시 호출 (타겟 매니저 등 외부 동기화용) */
  onGameAreaChange: (width: number, height: number) => void;

  /** 사이즈 재계산 트리거로 함께 묶고 싶은 외부 의존성들 */
  deps?: React.DependencyList;
}

/**
 * 캔버스 리사이즈·DPR 반영
 * - 모드(fullscreen/windowed)와 ratio 기준으로 “표시 크기” 계산
 * - DPR 반영 후 “실제 픽셀 크기”를 외부로 동기화(onGameAreaChange)
 * - resize/의존성 변경은 rAF로 합쳐 중복 적용 방지
 */
export const useResizeCanvas = (options: UseResizeCanvasOptions) => {
  const {
    canvasRef,
    mode,
    ratio,
    windowPadding = 48,
    onGameAreaChange,
    deps = [],
  } = options;

  const rafRef = useRef<number | null>(null);

  // DPR 적용 빈도 제한(스로틀) + 마지막 값 보장(트레일링)
  const dprThrottleMs = 80;
  const lastDprApplyAtRef = useRef(0);
  const dprTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const computeDisplaySize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (mode === 'fullscreen') {
      const screenRatio = vw / vh;

      // 화면이 더 “가로로 긴” 경우: 높이에 맞추고 좌우 레터박스
      if (screenRatio > ratio) {
        const h = vh;
        const w = h * ratio;
        return { w, h };
      }

      // 화면이 더 “세로로 긴” 경우: 너비에 맞추고 상하 레터박스
      const w = vw;
      const h = w / ratio;
      return { w, h };
    }

    // windowed: 패딩 고려한 최대 박스 내 ratio 유지
    const maxW = Math.max(0, vw - windowPadding);
    const maxH = Math.max(0, vh - windowPadding);

    let w = maxW;
    let h = w / ratio;

    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }

    return { w, h };
  }, [mode, ratio, windowPadding]);

  const applyDprAndSync = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setCanvasSizeDPR(canvas);
    onGameAreaChange(canvas.width, canvas.height);
    lastDprApplyAtRef.current = performance.now();
  }, [canvasRef, onGameAreaChange]);

  // resize 드래그 중 flicker 현상 완화를 위해 throttling 및 trailing 적용
  const scheduleDprAndSync = useCallback(() => {
    const now = performance.now();
    const elapsed = now - lastDprApplyAtRef.current;

    // 스로틀: 일정 시간 지났으면 즉시 반영
    if (elapsed >= dprThrottleMs) {
      if (dprTimeoutRef.current) {
        clearTimeout(dprTimeoutRef.current);
        dprTimeoutRef.current = null;
      }
      applyDprAndSync();
      return;
    }

    // 트레일링: 아직 시간이 안 찼으면 마지막에 한 번만 반영
    if (dprTimeoutRef.current) clearTimeout(dprTimeoutRef.current);

    const delay = Math.max(0, dprThrottleMs - elapsed);
    dprTimeoutRef.current = setTimeout(() => {
      dprTimeoutRef.current = null;
      applyDprAndSync();
    }, delay);
  }, [applyDprAndSync, dprThrottleMs]);

  const applySize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { w, h } = computeDisplaySize();

    // CSS 표시 크기는 즉각 반영
    const cw = Number.parseFloat(canvas.style.width);
    const ch = Number.parseFloat(canvas.style.height);
    if (cw !== w) canvas.style.width = `${w}px`;
    if (ch !== h) canvas.style.height = `${h}px`;

    scheduleDprAndSync();
  }, [canvasRef, computeDisplaySize, scheduleDprAndSync]);

  const scheduleApply = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applySize();
    });
  }, [applySize]);

  useEffect(() => {
    scheduleApply();
  }, [mode, ratio, windowPadding, scheduleApply, ...deps]);

  useEffect(() => {
    const onResize = () => scheduleApply();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [scheduleApply]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (dprTimeoutRef.current) clearTimeout(dprTimeoutRef.current);
    },
    []
  );
};
