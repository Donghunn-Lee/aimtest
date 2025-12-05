import { VolumeState, VolumeActions } from '@/hooks/useVolume';

interface VolumeSliderProps {
  volumeState: VolumeState;
  volumeActions: VolumeActions;
}

// 효과음/배경음 볼륨 및 음소거 UI 컨트롤러
export const VolumeSlider = ({
  volumeState,
  volumeActions,
}: VolumeSliderProps) => {
  return (
    <div className="m-0 h-fit items-center p-0">
      <div>
        <p className="md:text-md text-sm text-gray-300 lg:text-lg">효과음</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={volumeActions.toggleEfMute}
            className="flex h-8 w-8 items-center justify-center rounded text-white"
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
            className="h-2 w-full rounded-lg bg-gray-200 accent-blue-600"
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
            className="flex h-8 w-8 items-center justify-center rounded text-white"
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
            className="h-2 w-full rounded-lg bg-gray-200 accent-blue-600"
          />
          <p className="w-10 items-center">
            {volumeState.isBgMuted ? '0' : volumeState.bgVolume}
          </p>
        </div>
      </div>
    </div>
  );
};
