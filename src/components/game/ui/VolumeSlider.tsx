import { VolumeActions, VolumeState } from '@/hooks/useVolume';

interface VolumeSliderProps {
  volumeState: VolumeState;
  volumeActions: VolumeActions;
}

export const VolumeSlider = ({
  volumeState,
  volumeActions,
}: VolumeSliderProps) => {
  const getBackgroundStyle = (volume: number, isMuted: boolean) => {
    const percentage = isMuted ? 0 : volume;
    return {
      background: `linear-gradient(to right, #00ff00 0%, #00ff00 ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`,
    };
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
          <span>SFX</span>
          <span className="text-[#00ff00]">
            {volumeState.isEfMuted ? 'MUTE' : volumeState.efVolume}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={volumeActions.toggleEfMute}
            className="flex h-5 w-5 items-center justify-center rounded text-xs transition-transform hover:scale-110 active:scale-95"
            title="Toggle Mute"
          >
            <span className="grayscale filter hover:grayscale-0">
              {volumeState.isEfMuted ? '🔇' : '🔊'}
            </span>
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={volumeState.efVolume}
            onChange={(e) => volumeActions.setEfVolume(Number(e.target.value))}
            disabled={volumeState.isEfMuted}
            style={getBackgroundStyle(
              volumeState.efVolume,
              volumeState.isEfMuted
            )}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg focus:outline-none disabled:opacity-50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,0,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
          <span>BGM</span>
          <span className="text-[#00ff00]">
            {volumeState.isBgMuted ? 'MUTE' : volumeState.bgVolume}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={volumeActions.toggleBgMute}
            className="flex h-5 w-5 items-center justify-center rounded text-xs transition-transform hover:scale-110 active:scale-95"
            title="Toggle Mute"
          >
            <span className="grayscale filter hover:grayscale-0">
              {volumeState.isBgMuted ? '🔇' : '🔊'}
            </span>
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={volumeState.bgVolume}
            onChange={(e) => volumeActions.setBgVolume(Number(e.target.value))}
            disabled={volumeState.isBgMuted}
            style={getBackgroundStyle(
              volumeState.bgVolume,
              volumeState.isBgMuted
            )}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg focus:outline-none disabled:opacity-50 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(0,255,0,0.5)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
          />
        </div>
      </div>
    </div>
  );
};
