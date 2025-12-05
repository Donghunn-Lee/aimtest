import { useRef, useState } from 'react';

export interface VolumeState {
  efVolume: number;
  bgVolume: number;
  isEfMuted: boolean;
  isBgMuted: boolean;
}

export interface VolumeActions {
  setEfVolume: (volume: number) => void;
  setBgVolume: (volume: number) => void;
  toggleEfMute: () => void;
  toggleBgMute: () => void;
  playHitSound: () => void;
  playMissSound: () => void;
  playBGM: () => void;
  stopBGM: () => void;
}

/**
 * 효과음/배경음 볼륨 및 재생 상태 관리 훅
 * - 효과음 볼륨/뮤트 및 히트/미스 사운드 재생
 * - BGM 지연 재생, 루프, 볼륨, 정지 제어
 */
const useVolume = (): [VolumeState, VolumeActions] => {
  const [efVolume, setEfVolume] = useState(30);
  const [bgVolume, setBgVolume] = useState(30);
  const bgSoundRef = useRef<HTMLAudioElement>(null);
  const [isEfMuted, setIsEfMuted] = useState(false);
  const [isBgMuted, setIsBgMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const playHitSound = () => {
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = isEfMuted ? 0 : efVolume / 100;
    hitSound.play().catch(() => {});
  };

  const playMissSound = () => {
    const missSound = new Audio('/sounds/miss.mp3');
    missSound.volume = isEfMuted ? 0 : efVolume / 100;
    missSound.play().catch(() => {});
  };

  const playBGM = () => {
    timerRef.current = setTimeout(() => {
      if (!bgSoundRef.current) {
        bgSoundRef.current = new Audio('/sounds/bgm.mp3');
        bgSoundRef.current.loop = true;
      }
      bgSoundRef.current.volume = isBgMuted ? 0 : bgVolume / 100;
      bgSoundRef.current.play().catch(() => {});
    }, 1000);
  };

  const stopBGM = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (bgSoundRef.current) {
      bgSoundRef.current.pause();
      bgSoundRef.current.currentTime = 0;
    }
  };

  const toggleEfMute = () => {
    setIsEfMuted(!isEfMuted);
  };

  const toggleBgMute = () => {
    setIsBgMuted(!isBgMuted);
  };

  const volumeState = {
    efVolume,
    bgVolume,
    isEfMuted,
    isBgMuted,
  };

  const volumeActions = {
    setEfVolume,
    setBgVolume,
    playHitSound,
    playMissSound,
    playBGM,
    stopBGM,
    toggleEfMute,
    toggleBgMute,
  };

  return [volumeState, volumeActions];
};

export default useVolume;
