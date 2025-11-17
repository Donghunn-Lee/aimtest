import { useState, useCallback, useEffect, useRef } from 'react';

export interface GameState {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  startTime: number | null;
  elapsedTime: number;
  accuracy: number;
  hitCount: number;
  totalClick: number;
  mouseSensitivity: number;
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
  setMouseSensitivity: (sensitivity: number) => void;
  triggerGraceTimer: () => void;
  cancelGraceTimer: () => void;
}

export const useGame = (): [GameState, GameActions] => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [totalClick, setTotalClick] = useState(0);
  const [mouseSensitivity, setMouseSensitivity] = useState(1);
  const [graceStartAt, setGraceStartAt] = useState<number | null>(null);
  const endTimeoutRef = useRef<number | null>(null);

  // 정확도 계산을 useEffect로 분리
  useEffect(() => {
    if (totalClick > 0) {
      setAccuracy((hitCount / totalClick) * 100);
    } else {
      setAccuracy(0);
    }
  }, [hitCount, totalClick]);

  const startGame = useCallback(() => {
    setIsGameStarted(true);
    setIsGameOver(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setAccuracy(0);
    setHitCount(0);
    setTotalClick(0);
    setScore(0);
  }, []);

  const endGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(true);

    if (startTime) {
      const finalTime = (Date.now() - startTime) / 1000;
      setElapsedTime(finalTime);
    }

    document.exitPointerLock();
  }, [startTime]);

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setStartTime(0);
    setElapsedTime(0);
    setAccuracy(0);
    setHitCount(0);
    setTotalClick(0);
    setScore(0);
  }, []);

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
    if (startTime && isGameStarted && !isGameOver) {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }
  }, [startTime, isGameStarted, isGameOver]);

  const triggerGraceTimer = useCallback(() => {
    if (graceStartAt || !isGameStarted || isGameOver) return;
    setGraceStartAt(Date.now());
    endTimeoutRef.current = window.setTimeout(() => {
      endGame();
      endTimeoutRef.current = null;
    }, 3000);
  }, [graceStartAt, isGameStarted, isGameOver, endGame]);

  const cancelGraceTimer = useCallback(() => {
    setGraceStartAt(null);

    if (endTimeoutRef.current) {
      clearTimeout(endTimeoutRef.current);
      endTimeoutRef.current = null;
    }
  }, []);

  const gameState: GameState = {
    isGameStarted,
    isGameOver,
    score,
    startTime,
    elapsedTime,
    accuracy,
    hitCount,
    totalClick,
    mouseSensitivity,
    graceStartAt,
  };

  const gameActions: GameActions = {
    startGame,
    endGame,
    resetGame,
    addScore,
    handleHit,
    handleClick,
    updatePlayTime,
    setMouseSensitivity,
    triggerGraceTimer,
    cancelGraceTimer,
  };

  return [gameState, gameActions];
};
