import { motion } from 'framer-motion';

import {
  AlertIcon,
  ArrowLeftIcon,
  ExitIcon,
  InfoIcon,
  LightningIcon,
  MouseIcon,
} from '@/components/common/Icons';
import { Key } from '@/components/common/Key';
import { slideLeft } from '@/utils/motion';

const GuideRow = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
}) => (
  <li className="flex items-start gap-2 text-[10px] leading-tight text-gray-400 md:text-[11px]">
    <span className="mt-0.5 shrink-0 text-[#00ff00] opacity-80">{icon}</span>
    <span>{text}</span>
  </li>
);

// 인게임 좌상단에 표시되는 고정 게임 가이드 UI
export const GameGuide = () => {
  return (
    <motion.div
      variants={slideLeft}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`absolute bottom-4 left-4 z-0 max-w-[240px] rounded-xl border border-white/10 bg-black/80 p-4 shadow-xl backdrop-blur-md md:bottom-auto md:top-4 md:max-w-[260px] lg:left-8 lg:top-8 lg:max-w-[300px] lg:p-5 xl:left-10 xl:top-10`}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
        <InfoIcon className="h-4 w-4 text-[#00ff00]" />
        <h2 className="text-xs font-bold tracking-wider text-gray-200 md:text-sm">
          GAME GUIDE
        </h2>
      </div>

      <ul className="space-y-2.5">
        <GuideRow
          icon={<LightningIcon className="h-3 w-3" />}
          text={
            <>
              타겟 점수 <span className="text-[#00ff00]">3점</span> ·{' '}
              <span className="text-[#00cc00]">2점</span> ·{' '}
              <span className="text-[#009900]">1점</span>
            </>
          }
        />

        <GuideRow
          icon={<MouseIcon className="h-3 w-3" />}
          text={
            <>
              <Key>[</Key> <Key>]</Key> 마우스 감도 조절
            </>
          }
        />

        <GuideRow
          icon={<AlertIcon className="h-3 w-3" />}
          text={
            <>
              타겟 <span className="font-bold text-gray-300">10개</span> 누적 시{' '}
              <span className="font-bold text-red-400">GAME OVER</span>
            </>
          }
        />

        <GuideRow
          icon={<ExitIcon className="h-3 w-3" />}
          text={
            <>
              <Key>ESC</Key> or <Key>~</Key> 게임 종료
            </>
          }
        />

        <GuideRow
          icon={<ArrowLeftIcon className="h-3 w-3" />}
          text={
            <>
              <Key>←</Key> 모드 재선택
            </>
          }
        />
      </ul>
    </motion.div>
  );
};
