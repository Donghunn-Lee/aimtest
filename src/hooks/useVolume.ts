import { useRef, useState } from 'react';

export interface VolumeStateType {
  efVolume: number;
  bgVolume: number;
  isEfMuted: boolean;
  isBgMuted: boolean;
}

export interface VolumeActionsType {
  setEfVolume: (volume: number) => void;
  setBgVolume: (volume: number) => void;
  toggleEfMute: () => void;
  toggleBgMute: () => void;
  playHitSound: () => void;
  playMissSound: () => void;
  playBGM: () => void;
  stopBGM: () => void;
}

const useVolume = (): [VolumeStateType, VolumeActionsType] => {
  const [efVolume, setEfVolume] = useState(30);
  const [bgVolume, setBgVolume] = useState(30);
  const bgSoundRef = useRef<HTMLAudioElement>(null);
  const [isEfMuted, setIsEfMuted] = useState(false);
  const [isBgMuted, setIsBgMuted] = useState(false);

  const playHitSound = () => {
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = isEfMuted ? 0 : Math.max(efVolume / 100 - 0.2, 0);
    hitSound.play().catch(() => {});
  };

  const playMissSound = () => {
    const missSound = new Audio('/sounds/miss.mp3');
    missSound.volume = isEfMuted ? 0 : efVolume / 100;
    missSound.play().catch(() => {});
  };

  const playBGM = () => {
    setTimeout(() => {
      if (!bgSoundRef.current) {
        bgSoundRef.current = new Audio('/sounds/bgm.mp3');
        bgSoundRef.current.loop = true;
      }
      bgSoundRef.current.volume = isBgMuted ? 0 : bgVolume / 100 - 0.2;
      bgSoundRef.current.play().catch(() => {});
    }, 1000);
  };

  const stopBGM = () => {
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
