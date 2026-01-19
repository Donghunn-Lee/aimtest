import { Button } from '@/components/common/Button';
import { ArrowLeftIcon } from '@/components/common/Icons';
import { PanelOverlay } from '@/components/common/PanelOverlay';
import { ResolutionSettings } from '@/components/game/settings/ResolutionSettings';
import { VolumeSlider } from '@/components/game/ui/VolumeSlider';
import { VolumeActions, VolumeState } from '@/hooks/useVolume';
import { Resolution } from '@/types/image';

interface StartMenuProps {
  onStart: () => void;
  onRanking: () => void;
  onBackToMain: () => void;
  selectedResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  volumeState: VolumeState;
  volumeActions: VolumeActions;
}

export const StartMenu = ({
  onStart,
  onRanking,
  onBackToMain,
  selectedResolution,
  onResolutionChange,
  volumeState,
  volumeActions,
}: StartMenuProps) => {
  return (
    <PanelOverlay>
      <button
        onClick={onBackToMain}
        className="group absolute left-4 top-4 z-10 p-1 text-gray-500 transition-colors hover:text-[#00ff00] md:left-2 md:top-2"
        aria-label="Back"
      >
        <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
      </button>

      <div className="relative flex flex-col items-center justify-center space-y-4 px-1 lg:space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-black tracking-tighter text-white md:text-2xl lg:text-3xl">
            GAME{' '}
            <span className="bg-gradient-to-r from-[#00ff00] to-[#007700] bg-clip-text text-transparent">
              SETUP
            </span>
          </h2>
        </div>

        <div className="flex w-full max-w-xs flex-col rounded-xl border border-white/5 bg-white/5 p-2 md:max-w-sm md:gap-2 md:px-4 md:py-2 lg:max-w-md lg:gap-4 lg:px-6 lg:py-4 xl:max-w-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-xs">
              Resolution
            </span>
            <ResolutionSettings
              selectedResolution={selectedResolution}
              onResolutionChange={onResolutionChange}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 md:text-xs">
              Volume
            </span>
            <VolumeSlider
              volumeState={volumeState}
              volumeActions={volumeActions}
            />
          </div>
        </div>

        <div className="flex w-full max-w-xs flex-col gap-3 md:max-w-sm lg:max-w-md xl:max-w-lg">
          <Button
            onClick={onStart}
            variant="primary"
            size="md"
            fullWidth
            className="font-bold tracking-widest"
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
