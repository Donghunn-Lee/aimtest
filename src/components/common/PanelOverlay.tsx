import { ReactNode } from 'react';

interface PanelOverlayProps {
  children: ReactNode;
  className?: string;
}

export const PanelOverlay = ({ children, className }: PanelOverlayProps) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${className}`}
    >
      <div className="rounded-lg bg-black bg-opacity-60 p-2 shadow-lg backdrop-blur-sm md:p-4 lg:p-6 xl:p-8">
        {children}
      </div>
    </div>
  );
};
