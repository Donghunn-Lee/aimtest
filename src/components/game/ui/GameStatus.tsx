import { motion } from 'framer-motion';

import type { GameMode } from '@/types/game';

import { slideRight } from '@/utils/motion';

interface GameStatusProps {
  elapsedTime: number;
  score: number;
  accuracy: number | undefined;
  sensitivity: number;
  gameMode: GameMode;
}

// 게임 진행 중 우측 상단에 표시되는 실시간 상태 패널
export const GameStatus = ({
  elapsedTime,
  score,
  accuracy,
  sensitivity,
  gameMode,
}: GameStatusProps) => {
  return (
    <motion.div
      variants={slideRight}
      initial="hidden"
      animate="show"
      exit="exit"
      className="absolute right-4 top-4 w-[20vw] rounded bg-black bg-opacity-60 p-[1vw] text-[1.2vw] backdrop-blur-sm"
    >
      <div className="mb-[0.5vw] flex justify-between">
        <span>경과 시간:</span>
        <span>{elapsedTime.toFixed(0)}초</span>
      </div>
      <div className="mb-[0.5vw] flex justify-between">
        <span>점수:</span>
        <span>{score}</span>
      </div>
      <div className="mb-[0.5vw] flex justify-between">
        <span>정확도:</span>
        <span>{accuracy?.toFixed(2) || 0}%</span>
      </div>
      <div className="flex justify-between">
        <span>마우스 민감도:</span>
        <span>{sensitivity.toFixed(1)}</span>
      </div>
    </motion.div>
  );
};
