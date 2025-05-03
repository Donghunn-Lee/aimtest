import { useState, useCallback } from 'react';

export interface GameState {
  isGameStarted: boolean;
  isGameOver: boolean;
  score: number;
  startTime: number | null;
  elapsedTime: number;
  accuracy: number;
  hitCount: number;
  totalClick: number;
}

interface GameStateActions {
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  handleHit: () => void;
  handleClick: () => void;
  updatePlayTime: () => void;
}

export const useGameState = (): [GameState, GameStateActions] => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [totalClick, setTotalClick] = useState(0);

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
  }, [startTime]);

  const resetGame = useCallback(() => {
    setIsGameStarted(false);
    setIsGameOver(false);
    setStartTime(null);
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
    if (totalClick > 0) {
      setAccuracy(((hitCount + 1) / (totalClick + 1)) * 100);
    }
  }, [hitCount, totalClick]);

  const handleClick = useCallback(() => {
    setTotalClick((prev) => prev + 1);
    if (hitCount > 0) {
      setAccuracy((hitCount / (totalClick + 1)) * 100);
    }
  }, [hitCount, totalClick]);

  const updatePlayTime = useCallback(() => {
    if (startTime && isGameStarted && !isGameOver) {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedTime(elapsed);
    }
  }, [startTime, isGameStarted, isGameOver]);

  const gameState: GameState = {
    isGameStarted,
    isGameOver,
    score,
    startTime,
    elapsedTime,
    accuracy,
    hitCount,
    totalClick,
  };

  const actions: GameStateActions = {
    startGame,
    endGame,
    resetGame,
    addScore,
    handleHit,
    handleClick,
    updatePlayTime,
  };

  return [gameState, actions];
};
