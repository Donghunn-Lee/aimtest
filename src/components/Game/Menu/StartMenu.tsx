import { PanelOverlay } from "../../common/PanelOverlay";
import { ResolutionSettings } from "../settings/ResolutionSettings";
import { Resolution, DEFAULT_RESOLUTION } from "../types/resolution";

interface StartMenuProps {
  onStart: () => void;
  onRanking: () => void;
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
}

export const StartMenu = ({
  onStart,
  onRanking,
  selectedResolution,
  onResolutionChange
}: StartMenuProps) => {
  const handleRankingClick = () => {
    onRanking();
  };

  return (
    <PanelOverlay>
      <div className="flex flex-col items-center justify-center space-y-8 px-6">
        <h2 className="text-2xl font-bold mb-4 text-white text-center">FPS Aim Test</h2>

        <div className="w-full max-w-md">
          <ResolutionSettings
            selectedResolution={selectedResolution}
            onResolutionChange={onResolutionChange}
          />
        </div>

        <div className="space-y-4 w-full max-w-md">
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