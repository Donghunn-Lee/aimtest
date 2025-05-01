import { ReactNode } from 'react';

interface PanelOverlayProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export const PanelOverlay = ({
  children,
  className,
  animate = false,
}: PanelOverlayProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50">
      <div
        className={`fixed inset-0 flex items-center justify-center ${
          animate
            ? `translate-y-0 opacity-100 transition-all duration-1000`
            : ''
        } ${className}`}
      >
        <div className="rounded-lg bg-black bg-opacity-60 p-2 shadow-lg backdrop-blur-sm md:p-4 lg:p-6 xl:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
