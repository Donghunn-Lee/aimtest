import { VolumeStateType, VolumeActionsType } from '@/hooks/useVolume';

interface VolumeSliderProps {
  volumeState: VolumeStateType;
  volumeActions: VolumeActionsType;
}

const VolumeSlider = ({ volumeState, volumeActions }: VolumeSliderProps) => {
  return (
    <div className="m-0 h-fit items-center p-0">
      <div>
        <p className="md:text-md text-sm text-gray-300 lg:text-lg">효과음</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={volumeActions.toggleEfMute}
            className="rounded px-2 py-1 text-white"
          >
            {volumeState.isEfMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeState.efVolume}
            onChange={(e) => volumeActions.setEfVolume(Number(e.target.value))}
            disabled={volumeState.isEfMuted}
            className="w-full"
          />
          <p className="w-10 items-center">
            {volumeState.isEfMuted ? '0' : volumeState.efVolume}
          </p>
        </div>
      </div>
      <div>
        <p className="md:text-md text-sm text-gray-300 lg:text-lg">배경음</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={volumeActions.toggleBgMute}
            className="rounded px-2 py-1 text-white"
          >
            {volumeState.isBgMuted ? '🔇' : '🔊'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volumeState.bgVolume}
            onChange={(e) => volumeActions.setBgVolume(Number(e.target.value))}
            disabled={volumeState.isBgMuted}
            className="w-full"
          />
          <p className="w-10 items-center">
            {volumeState.isBgMuted ? '0' : volumeState.bgVolume}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolumeSlider;
