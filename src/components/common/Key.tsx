import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface KeyProps {
  children: ReactNode;
  className?: string;
}

export const Key = ({ children, className }: KeyProps) => {
  return (
    <span
      className={twMerge(
        'mx-0.5 inline-flex h-5 min-w-[20px] cursor-default items-center justify-center rounded bg-white/10 px-1.5 font-mono text-[10px] font-bold text-gray-200 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white',
        className
      )}
    >
      {children}
    </span>
  );
};
