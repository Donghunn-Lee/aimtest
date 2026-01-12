import { useCallback, useEffect, useRef, useState } from 'react';

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

export interface UseResizeCanvasReturn {
  displayWidth: number;
  displayHeight: number;
  recalc: () => void;
}

/**
 * 게임 캔버스 리사이즈 및 DPR 적용 훅
 * - 윈도우 크기 / 게임 모드(fullscreen/windowed)에 맞춰 캔버스 표시 크기 계산
 * - setCanvasSizeDPR로 실제 픽셀 크기(canvas.width/height) 설정
 * - 리사이즈/의존성 변경 시 onGameAreaChange로 실제 게임 영역 크기 전달
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
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const computeDisplaySize = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (mode === 'fullscreen') {
      const screenRatio = vw / vh;

      // 가로가 더 길 경우 -> 높이에 맞추고 좌우 레터박스
      if (screenRatio > ratio) {
        const h = vh;
        const w = h * ratio;
        return { w, h };
      } else {
        // 세로가 더 길 경우 -> 높이에 맞추고 좌우 레터박스
        const w = vw;
        const h = w / ratio;
        return { w, h };
      }
    } else {
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
    }
  }, [mode, ratio, windowPadding]);

  const applySize = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const { w, h } = computeDisplaySize();

    // 1) CSS 표시 크기
    const cw = Number.parseFloat(canvas.style.width);
    const ch = Number.parseFloat(canvas.style.height);
    if (cw !== w) canvas.style.width = `${w}px`;
    if (ch !== h) canvas.style.height = `${h}px`;

    // 2) DPR 반영하여 실제 픽셀 크기 설정 (canvas.width/height)
    setCanvasSizeDPR(canvas);

    // 3) 외부(타겟 메니저 등)에 실제 픽셀 크기 전달
    onGameAreaChange?.(canvas.width, canvas.height);

    // 4) 표시 크기 상태 업데이트(디버깅용)
    setDisplaySize({ width: w, height: h });
    // logSizes('after-apply');
  }, [canvasRef, computeDisplaySize, onGameAreaChange]);

  const scheduleApply = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applySize();
    });
  }, [applySize]);

  // 최초 및 의존성 변경 시 적용
  useEffect(() => {
    scheduleApply();
  }, [mode, ratio, windowPadding, scheduleApply, ...deps]);

  // 윈도우 리사이즈 대응
  useEffect(() => {
    const onResize = () => scheduleApply();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [scheduleApply]);

  // 언마운트 RAF 정리
  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    displayWidth: displaySize.width,
    displayHeight: displaySize.height,
    recalc: scheduleApply,
  };
};
