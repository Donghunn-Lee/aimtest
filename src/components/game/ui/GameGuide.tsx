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

type GuideRowProps = {
  icon: React.ReactNode;
  text: React.ReactNode;
};

const GuideRow = ({ icon, text }: GuideRowProps) => (
  <li className="flex items-start gap-2 leading-tight text-gray-400">
    <span className="mt-0.5 shrink-0 text-[#00ff00] opacity-80">{icon}</span>
    <span>{text}</span>
  </li>
);

export const GameGuide = () => {
  return (
    <motion.div
      variants={slideLeft}
      initial="hidden"
      animate="show"
      exit="exit"
      className="absolute bottom-4 left-4 z-0 w-[clamp(200px,20vw,340px)] rounded-xl border border-white/10 bg-black/80 p-[clamp(12px,1.6vw,20px)] shadow-xl backdrop-blur-md md:bottom-auto md:top-4 lg:left-8 lg:top-8 xl:left-10 xl:top-10 [&_h2]:text-[clamp(12px,1.1vw,14px)] [&_li]:text-[clamp(10px,0.95vw,12px)] [&_svg]:h-[clamp(12px,1.1vw,16px)] [&_svg]:w-[clamp(12px,1.1vw,16px)] [&_ul]:space-y-[clamp(10px,1.2vw,14px)]"
    >
      <div className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2">
        <InfoIcon className="text-[#00ff00]" />
        <h2 className="font-bold tracking-wider text-gray-200">GAME GUIDE</h2>
      </div>

      <ul>
        <GuideRow
          icon={<LightningIcon />}
          text={
            <>
              타겟 점수 <span className="text-[#00ff00]">3점</span> ·{' '}
              <span className="text-[#00dd00]">2점</span> ·{' '}
              <span className="text-[#00bb00]">1점</span>
            </>
          }
        />

        <GuideRow
          icon={<MouseIcon />}
          text={
            <>
              <Key>[</Key> <Key>]</Key> 마우스 감도 조절
            </>
          }
        />

        <GuideRow
          icon={<AlertIcon />}
          text={
            <>
              타겟 <span className="font-bold text-gray-300">10개</span> 이상
              <span className="font-bold text-gray-300"> 3초</span> 유지 시{' '}
              <span className="whitespace-nowrap font-bold text-red-400">
                GAME OVER
              </span>
            </>
          }
        />

        <GuideRow
          icon={<ExitIcon />}
          text={
            <>
              <Key>ESC</Key> or <Key>~</Key> 게임 종료
            </>
          }
        />

        <GuideRow
          icon={<ArrowLeftIcon />}
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
