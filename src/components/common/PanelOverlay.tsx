import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { slideUp } from '@/utils/motion';

interface PanelOverlayProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const OVERLAY_STYLES =
  'transform rounded-lg bg-black/60 p-4 text-white shadow-lg backdrop-blur-sm lg:p-6 xl:p-8';

export const PanelOverlay = ({
  children,
  className,
  animate = true,
}: PanelOverlayProps) => {
  return (
    <div className="absolute inset-x-0 w-full">
      <div className="flex justify-center">
        <motion.div
          variants={slideUp}
          initial="hidden"
          animate={animate ? 'show' : 'hidden'}
          exit="exit"
          className={twMerge(OVERLAY_STYLES, className)}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
