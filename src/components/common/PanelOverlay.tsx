import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { slideUp } from '@/utils/motion';

interface PanelOverlayProps {
  children: ReactNode;
  className?: string;
  animate?: boolean; // true/false
}

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
          animate={animate ? 'show' : false}
          exit="exit"
          className={`transform rounded-lg bg-black bg-opacity-60 p-4 text-white shadow-lg backdrop-blur-sm lg:p-6 xl:p-8 ${
            className ?? ''
          }`}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};
