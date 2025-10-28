import { loading as loadingVariants } from '@/utils/motion';
import { AnimatePresence, motion } from 'framer-motion';

export const LoadingOverlay = ({ show }: { show: boolean }) => {
  return (
    <AnimatePresence>
      {!show && (
        <motion.div
          className="absolute inset-0 z-50"
          variants={loadingVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="pointer-events-auto absolute inset-0 grid place-items-center bg-[#1a1a1a]">
            <div className="grid place-items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-green-300 border-t-green-500 sm:h-10 sm:w-10 sm:border-4 md:h-12 md:w-12 lg:h-14 lg:w-14 xl:h-16 xl:w-16" />
              <div className="text-xs font-semibold tracking-wide text-green-500 sm:text-sm md:text-base lg:text-lg xl:text-xl">
                Loading map…
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
