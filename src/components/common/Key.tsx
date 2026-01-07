import { type ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface KeyProps {
  children: ReactNode;
  className?: string;
}

const KEY_STYLES =
  'mx-0.5 inline-flex h-5 min-w-[20px] cursor-default select-none items-center justify-center align-middle rounded bg-white/10 px-1.5 font-mono text-[10px] font-bold text-gray-200 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white';

export const Key = ({ children, className }: KeyProps) => {
  return <span className={twMerge(KEY_STYLES, className)}>{children}</span>;
};
