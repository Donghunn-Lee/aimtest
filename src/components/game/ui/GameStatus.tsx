import { motion } from 'framer-motion';

import { Key } from '@/components/common/Key';
import { StatBox } from '@/components/game/ui/StatBox';
import { slideRight } from '@/utils/motion';

interface GameStatusProps {
  elapsedTime: number;
  score: number;
  accuracy: number | undefined;
  sensitivity: number;
}

export const GameStatus = ({
  elapsedTime,
  score,
  accuracy,
  sensitivity,
}: GameStatusProps) => {
  return (
    <motion.div
      variants={slideRight}
      initial="hidden"
      animate="show"
      exit="exit"
      className="absolute right-4 top-4 z-10 flex w-[130px] flex-col gap-1.5 rounded-lg bg-black/40 p-4 backdrop-blur-sm md:right-6 md:top-6 md:w-[160px] md:gap-2"
    >
      <div className="grid grid-cols-2 gap-1.5 md:gap-2">
        <StatBox
          label="SCORE"
          value={score}
          highlight
          className="h-full"
        />
        <StatBox
          label="TIME"
          value={elapsedTime.toFixed(0)}
          className="h-full"
        />
      </div>

      <StatBox
        label="ACCURACY"
        value={`${accuracy?.toFixed(1) || 0}%`}
      />

      <StatBox
        label="SENSITIVITY"
        value={
          <div className="flex items-center gap-1.5">
            <span>{sensitivity.toFixed(1)}</span>
            <div className="flex scale-75 items-center gap-0.5 opacity-50">
              <Key className="h-4 min-w-[16px] px-0.5 text-[8px]">[</Key>
              <Key className="h-4 min-w-[16px] px-0.5 text-[8px]">]</Key>
            </div>
          </div>
        }
      />
    </motion.div>
  );
};
