import { ReactNode } from 'react';

interface MenuWindowProps {
  children: ReactNode;
}

export const MenuWindow = ({ children }: MenuWindowProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}; 