import { useState, useEffect } from 'react';

import Button from '@/components/common/Button';
import { PanelOverlay } from '@/components/common/PanelOverlay';

import {
  addRanking,
  formatRankingScore,
  formatAccuracy,
  formatPlayTime,
  getScoreRank,
} from '@/services/rankingService';

interface ResultMenuProps {
  score: number;
  elapsedTime: number;
  onRestart: () => void;
  onMenu: () => void;
  accuracy: number;
}

const ResultMenu = ({
  score,
  accuracy,
  elapsedTime,
  onRestart,
  onMenu,
}: ResultMenuProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );
  const [userName, setUserName] = useState('');
  const [isNameValid, setIsNameValid] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [showRank, setShowRank] = useState(false);
  const [isRestartEnabled, setIsRestartEnabled] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    setUserName(name);
    setIsNameValid(name.length >= 2 && name.length <= 20);
  };

  const onSave = async () => {
    if (!isNameValid) return;

    try {
      setIsSaving(true);
      setSaveStatus('idle');
      await addRanking({
        user_name: userName,
        score,
        accuracy,
        play_time: elapsedTime,
      });
      setSaveStatus('success');
    } catch (error) {
      console.error('Failed to save ranking:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const menuTimer = setTimeout(() => {
      setShowMenu(true);
    }, 300);

    // 0점인 경우 카운트업 애니메이션 생략
    if (score === 0) {
      setDisplayScore(score);
      setTimeout(() => {
        setShowAccuracy(true);
        setTimeout(() => {
          setShowTime(true);
          setTimeout(() => {
            // 0점은 unranked로 표시
            setRank(null);
            setShowRank(true);
            // 모든 정보가 표시된 후 RESTART 버튼 활성화
            setTimeout(() => {
              setIsRestartEnabled(true);
            }, 300);
          }, 300);
        }, 300);
      }, 300);
      return () => clearTimeout(menuTimer);
    }

    // 0점 이외에 점수 카운트 업 애니메이션 적용
    let startTime: number;
    let animationFrameId: number;
    const duration = 2000;
    const startValue = 0;
    const endValue = score;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -8 * x);
    };

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easedProgress
      );

      setDisplayScore(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // 점수 애니메이션이 끝나면 순차적으로 정보 표시
        setTimeout(() => {
          setShowAccuracy(true);
          setTimeout(() => {
            setShowTime(true);
            setTimeout(() => {
              // 등수는 마지막에 조회하고 표시
              getScoreRank(score).then((rank) => {
                setRank(rank);
                setShowRank(true);
                // 모든 정보가 표시된 후 RESTART 버튼 활성화
                setTimeout(() => {
                  setIsRestartEnabled(true);
                }, 300);
              });
            }, 300);
          }, 300);
        }, 300);
      }
    };

    // 메뉴가 표시된 후에만 애니메이션 시작
    if (showMenu) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      clearTimeout(menuTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score, showMenu]);

  return (
    <PanelOverlay animate={true}>
      <div
        className={`flex flex-col items-center justify-center space-y-3 px-4 transition-all duration-1000 md:space-y-4 xl:space-y-5 ${
          showMenu ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <h2 className="mb-2 text-center text-lg font-bold text-white md:text-xl lg:text-2xl">
          Game Over
        </h2>
        <div className="h-[110px] space-y-1 text-center text-white md:h-[130px] lg:h-[140px]">
          <p className="text-base md:text-lg lg:text-xl">
            Score: {formatRankingScore(displayScore)}
          </p>
          <p
            className={`text-base transition-all duration-1000 md:text-lg lg:text-xl ${
              showAccuracy
                ? 'translate-y-0 opacity-100'
                : 'translate-y-4 opacity-0'
            }`}
          >
            Accuracy: {formatAccuracy(accuracy)}
          </p>
          <p
            className={`text-base transition-all duration-1000 md:text-lg lg:text-xl ${
              showTime ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            Time: {formatPlayTime(elapsedTime)}
          </p>
          <p
            className={`text-base transition-all duration-1000 md:text-lg lg:text-xl ${
              showRank ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {rank !== null ? `Rank: #${rank.toLocaleString()}` : 'Rank: #-'}
          </p>
        </div>

        {saveStatus === 'idle' && (
          <div className="space-y-1">
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="이름 (2-10자)"
              className="w-full rounded-lg bg-gray-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            <div className="min-h-6 py-1">
              {!isNameValid && userName.length > 0 ? (
                <p className="py-0 text-xs text-red-500">
                  이름은 2~10자로 입력해주세요.
                </p>
              ) : (
                <p className="py-0 text-center text-xs text-green-500">
                  점수 기록을 위해 이름을 입력해주세요!
                </p>
              )}
            </div>
          </div>
        )}
        {saveStatus === 'idle' && (
          <Button
            onClick={onSave}
            disabled={!isNameValid || isSaving}
            variant="primary"
            size="sm"
            fullWidth
          >
            {isSaving ? 'Saving...' : 'SAVE'}
          </Button>
        )}
        {saveStatus === 'success' && (
          <p className="text-center text-green-500">기록이 저장되었습니다!</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-center text-red-500">
            Failed to save ranking. Please try again.
          </p>
        )}

        <div className="flex w-full space-x-2">
          <Button
            onClick={isRestartEnabled ? onRestart : undefined}
            variant="primary"
            size="sm"
            fullWidth
            disabled={!isRestartEnabled}
            className={`transition-all duration-500 ${
              isRestartEnabled ? 'opacity-100' : 'opacity-50'
            }`}
          >
            RESTART
          </Button>
          <Button
            onClick={onMenu}
            variant="secondary"
            size="sm"
            fullWidth
          >
            MENU
          </Button>
        </div>
      </div>
    </PanelOverlay>
  );
};

export default ResultMenu;
