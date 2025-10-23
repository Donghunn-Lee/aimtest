import { AnimatePresence, motion } from 'framer-motion';

import Button from '@/components/common/Button';
import { PanelOverlay } from '@/components/common/PanelOverlay';
import { ResolutionSettings } from '@/components/game/settings/ResolutionSettings';
import VolumeSlider from '@/components/game/ui/VolumeSlider';

import { Resolution } from '@/types/image';
import { VolumeStateType, VolumeActionsType } from '@/hooks/useVolume';

interface StartMenuProps {
  onStart: () => void;
  onRanking: () => void;
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  animate: boolean;
  volumeState: VolumeStateType;
  volumeActions: VolumeActionsType;
}

const StartMenu = ({
  onStart,
  onRanking,
  selectedResolution,
  onResolutionChange,
  animate,
  volumeState,
  volumeActions,
}: StartMenuProps) => {
  return (
    <PanelOverlay animate={animate}>
      <div className="flex flex-col items-center justify-center space-y-2 px-1 md:px-1 lg:space-y-4 lg:px-6 xl:space-y-6 xl:text-ellipsis xl:px-8">
        <h2 className="mb-2 text-center text-lg font-bold text-white md:mb-3 md:text-lg lg:text-2xl xl:text-3xl">
          FPS Aim Test
        </h2>
        <div className="space-y-1 md:space-y-2">
          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            <ResolutionSettings
              selectedResolution={selectedResolution}
              onResolutionChange={onResolutionChange}
            />
          </div>

          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
            <VolumeSlider
              volumeState={volumeState}
              volumeActions={volumeActions}
            />
          </div>
        </div>
        <div className="w-full max-w-xs space-y-2 md:max-w-sm md:space-y-3 lg:max-w-md lg:space-y-4 xl:max-w-lg xl:space-y-5">
          <Button
            onClick={onStart}
            variant="primary"
            size="md"
            fullWidth
          >
            START
          </Button>
          <Button
            onClick={onRanking}
            variant="secondary"
            size="md"
            fullWidth
          >
            RANKING
          </Button>
        </div>
      </div>
    </PanelOverlay>
  );
};

export default StartMenu;
