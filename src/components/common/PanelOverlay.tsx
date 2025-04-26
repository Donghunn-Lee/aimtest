import { ReactNode } from 'react';

interface PanelOverlayProps {
  children: ReactNode;
  className?: string;
}

export const PanelOverlay = ({ children, className }: PanelOverlayProps) => {
  return (
    <div className={`fixed inset-0 flex items-center justify-center ${className}`}>
      <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}; 