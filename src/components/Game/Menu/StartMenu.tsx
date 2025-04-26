import { useState } from "react";
import { PanelOverlay } from "../../common/PanelOverlay";

interface StartMenuProps {
  onStart: () => void;
  onRanking: () => void;
}

export const StartMenu = ({ onStart, onRanking }: StartMenuProps) => {

  const handleRankingClick = () => {
    onRanking();
  };

  return (
    <PanelOverlay>
      <div className="flex flex-col items-center justify-center space-y-8 px-6">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">FPS Aim Test</h2>
        <div className="space-y-4">
          <button
            onClick={onStart}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            START
          </button>
          <button
            onClick={handleRankingClick}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            RANKING
          </button>
        </div>
      </div>
    </PanelOverlay>
  );
}; 