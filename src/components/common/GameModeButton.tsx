import { twMerge } from 'tailwind-merge';

import { ArrowRightIcon } from '@/components/common/Icons';

interface GameModeButtonProps {
  label: string;
  subLabel: string;
  onClick: () => void;
  primary?: boolean;
}

const BASE_STYLES =
  'group relative flex w-full flex-col items-start justify-center overflow-hidden rounded-xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 sm:w-64';

const PRIMARY_STYLES =
  'border-[#00ff00] bg-[#00ff00]/10 hover:bg-[#00ff00]/20 hover:shadow-[0_0_30px_rgba(0,255,0,0.3)]';

const DEFAULT_STYLES =
  'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10';

export const GameModeButton = ({
  label,
  subLabel,
  onClick,
  primary = false,
}: GameModeButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        BASE_STYLES,
        primary ? PRIMARY_STYLES : DEFAULT_STYLES
      )}
    >
      <span
        className={twMerge(
          'text-xl font-bold',
          primary ? 'text-white' : 'text-gray-200'
        )}
      >
        {label}
      </span>
      <span
        className={twMerge(
          'text-sm',
          primary ? 'text-[#00ff00]' : 'text-gray-500 group-hover:text-gray-300'
        )}
      >
        {subLabel}
      </span>

      <div className="absolute right-4 top-1/2 -translate-x-4 -translate-y-1/2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRightIcon
          className={twMerge(
            'h-6 w-6',
            primary ? 'text-[#00ff00]' : 'text-white'
          )}
        />
      </div>
    </button>
  );
};
