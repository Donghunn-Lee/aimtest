import { useCallback, useMemo, useRef, useState } from 'react';

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
 * 사운드 상태·재생 제어
 * - 효과음은 단발 생성으로 동시 재생 허용(타격감 우선)
 * - BGM은 단일 인스턴스 유지 + 지연 재생(중복 예약/stop 경쟁 방지)
 * - mute는 볼륨을 0으로 내려 출력만 차단(상태/슬라이더 값은 유지)
 */
export const useVolume = (): [VolumeState, VolumeActions] => {
  const [efVolume, _setEfVolume] = useState(30);
  const [bgVolume, _setBgVolume] = useState(30);
  const [isEfMuted, setIsEfMuted] = useState(false);
  const [isBgMuted, setIsBgMuted] = useState(false);

  const bgSoundRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setEfVolume = useCallback((volume: number) => {
    _setEfVolume(volume);
  }, []);

  const setBgVolume = useCallback((volume: number) => {
    _setBgVolume(volume);
  }, []);

  const playHitSound = useCallback(() => {
    // 단발 오디오: 빠른 연타/겹침 재생 허용
    const hitSound = new Audio('/sounds/hit.mp3');
    hitSound.volume = isEfMuted ? 0 : efVolume / 100;
    void hitSound.play().catch(() => {});
  }, [efVolume, isEfMuted]);

  const playMissSound = useCallback(() => {
    // 단발 오디오: 빠른 연타/겹침 재생 허용
    const missSound = new Audio('/sounds/miss.mp3');
    missSound.volume = isEfMuted ? 0 : efVolume / 100;
    void missSound.play().catch(() => {});
  }, [efVolume, isEfMuted]);

  const playBGM = useCallback(() => {
    // 중복 예약 방지: start가 연속 호출될 수 있음(게임 시작/복귀 등)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 이미 재생 중이면 재시작하지 않음
    if (bgSoundRef.current && !bgSoundRef.current.paused) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;

      if (!bgSoundRef.current) {
        bgSoundRef.current = new Audio('/sounds/bgm.mp3');
        bgSoundRef.current.loop = true;
      }

      const audio = bgSoundRef.current;
      if (!audio) return;

      audio.volume = isBgMuted ? 0 : bgVolume / 100;

      // stop 직후 예약 재생이 남아있어도 “paused 상태”에서만 재생 시도
      if (audio.paused) {
        void audio.play().catch(() => {});
      }
    }, 1000);
  }, [bgVolume, isBgMuted]);

  const stopBGM = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const audio = bgSoundRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
  }, []);

  const toggleEfMute = useCallback(() => {
    setIsEfMuted((v) => !v);
  }, []);

  const toggleBgMute = useCallback(() => {
    setIsBgMuted((v) => !v);
  }, []);

  const volumeState = useMemo(
    () => ({ efVolume, bgVolume, isEfMuted, isBgMuted }),
    [efVolume, bgVolume, isEfMuted, isBgMuted]
  );

  const volumeActions = useMemo(
    () => ({
      setEfVolume,
      setBgVolume,
      playHitSound,
      playMissSound,
      playBGM,
      stopBGM,
      toggleEfMute,
      toggleBgMute,
    }),
    [
      setEfVolume,
      setBgVolume,
      playHitSound,
      playMissSound,
      playBGM,
      stopBGM,
      toggleEfMute,
      toggleBgMute,
    ]
  );

  return [volumeState, volumeActions];
};
