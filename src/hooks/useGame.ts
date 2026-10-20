import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface GameState {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  startTime: number | null;
  elapsedTime: number;
  accuracy: number;
  hitCount: number;
  totalClick: number;

  /** 타겟 과부하 시 패배 카운트다운 시작 시각(ms) */
  graceStartAt: number | null;
}

export interface GameActions {
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  handleHit: () => void;
  handleClick: () => void;
  updatePlayTime: () => void;
  triggerGraceTimer: () => void;
  cancelGraceTimer: () => void;
}

/**
 * 게임 상태/액션 관리
 * - 라이프사이클(start/end/reset) 및 점수·통계 갱신
 * - 그레이스 타이머(지연 종료) 제어 및 리소스 정리
 * - 종료 시 PointerLock 해제
 */
export const useGame = (): [GameState, GameActions] => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [totalClick, setTotalClick] = useState(0);
  const [graceStartAt, setGraceStartAt] = useState<number | null>(null);

  const endTimeoutRef = useRef<number | null>(null);

  const clearEndTimeout = useCallback(() => {
    if (endTimeoutRef.current !== null) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    clearEndTimeout();
    setGraceStartAt(null);

    setIsGameStarted(true);
    setIsGameOver(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setHitCount(0);
    setTotalClick(0);
    setScore(0);
  }, [clearEndTimeout]);

  const endGame = useCallback(() => {
    clearEndTimeout();
    setGraceStartAt(null);

    setIsGameStarted(false);
    setIsGameOver(true);

    if (startTime !== null) {
      const finalTime = (Date.now() - startTime) / 1000;
      setElapsedTime(finalTime);
    }

    document.exitPointerLock();
  }, [clearEndTimeout, startTime]);

  const resetGame = useCallback(() => {
    clearEndTimeout();
    setGraceStartAt(null);

    setIsGameStarted(false);
    setIsGameOver(false);
    setStartTime(null);
    setElapsedTime(0);
    setHitCount(0);
    setTotalClick(0);
    setScore(0);
  }, [clearEndTimeout]);

  const addScore = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const handleHit = useCallback(() => {
    setHitCount((prev) => prev + 1);
    setTotalClick((prev) => prev + 1);
  }, []);

  const handleClick = useCallback(() => {
    setTotalClick((prev) => prev + 1);
  }, []);

  const updatePlayTime = useCallback(() => {
    if (startTime !== null && isGameStarted && !isGameOver) {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }
  }, [startTime, isGameStarted, isGameOver]);

  const triggerGraceTimer = useCallback(() => {
    if (graceStartAt !== null || !isGameStarted || isGameOver) return;

    setGraceStartAt(Date.now());
    endTimeoutRef.current = window.setTimeout(() => {
      endGame();
      endTimeoutRef.current = null;
    }, 3000);
  }, [graceStartAt, isGameStarted, isGameOver, endGame]);

  const cancelGraceTimer = useCallback(() => {
    setGraceStartAt(null);
    clearEndTimeout();
  }, [clearEndTimeout]);

  useEffect(() => {
    return () => {
      clearEndTimeout();
    };
  }, [clearEndTimeout]);

  const accuracy = totalClick > 0 ? (hitCount / totalClick) * 100 : 0;

  const gameState: GameState = {
    isGameStarted,
    isGameOver,
    score,
    startTime,
    elapsedTime,
    accuracy,
    hitCount,
    totalClick,
    graceStartAt,
  };

  // 다른 훅의 effect deps에 들어가므로 참조가 안정적이어야 한다
  const gameActions: GameActions = useMemo(
    () => ({
      startGame,
      endGame,
      resetGame,
      addScore,
      handleHit,
      handleClick,
      updatePlayTime,
      triggerGraceTimer,
      cancelGraceTimer,
    }),
    [
      startGame,
      endGame,
      resetGame,
      addScore,
      handleHit,
      handleClick,
      updatePlayTime,
      triggerGraceTimer,
      cancelGraceTimer,
    ]
  );

  return [gameState, gameActions];
};
