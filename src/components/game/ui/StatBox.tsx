import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface StatBoxProps {
  label: string;
  value: string | number | ReactNode;
  show?: boolean;
  highlight?: boolean;
  className?: string;
  delayClass?: string;
}

export const StatBox = ({
  label,
  value,
  show = true,
  highlight = false,
  className,
  delayClass = '',
}: StatBoxProps) => {
  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center rounded-md border border-white/5 bg-white/5 p-1 transition-all duration-700 ease-out md:rounded-lg md:p-2',
        show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        delayClass,
        className
      )}
    >
      <span className="text-[8px] font-bold uppercase tracking-wider text-gray-500 md:text-[10px]">
        {label}
      </span>

      <span
        className={`font-mono text-xs font-bold md:text-base ${
          highlight ? 'text-[#00ff00]' : 'text-white'
        }`}
      >
        {value}
      </span>
    </div>
  );
};
