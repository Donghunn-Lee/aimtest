import { useEffect, useState } from 'react';

import { Button } from '@/components/common/Button';
import { PanelOverlay } from '@/components/common/PanelOverlay';
import { StatBox } from '@/components/game/ui/StatBox';
import {
  addRanking,
  formatAccuracy,
  formatPlayTime,
  formatRankingScore,
  getScoreRank,
} from '@/services/rankingService';

interface ResultMenuProps {
  score: number;
  elapsedTime: number;
  onRestart: () => void;
  onMenu: () => void;
  accuracy: number;
}

export const ResultMenu = ({
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

  // 단계적 표시 상태(점수→정확도→시간→랭크→버튼 활성화)
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [showRank, setShowRank] = useState(false);
  const [isRestartEnabled, setIsRestartEnabled] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setUserName(name);
    setIsNameValid(name.trim().length >= 2 && name.trim().length <= 10);
  };

  const onSave = async () => {
    if (!isNameValid) return;

    try {
      setIsSaving(true);
      setSaveStatus('idle'); // 재시도 시 UI 상태를 즉시 초기화
      await addRanking({
        user_name: userName.trim(),
        score,
        accuracy,
        play_time: elapsedTime,
      });
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timeouts: number[] = [];
    let animationFrameId: number | undefined;

    const pushTimeout = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    };

    // 메뉴 진입 애니메이션 트리거(타이머는 cleanup으로 반드시 정리)
    pushTimeout(() => {
      setShowMenu(true);
    }, 100);

    const showAnimation = (finalScore: number) => {
      setDisplayScore(score);

      // 순차 공개 UX: 스탯 노출 → 랭크 조회 → RESTART 활성화
      pushTimeout(() => {
        setShowAccuracy(true);
        pushTimeout(() => {
          setShowTime(true);
          pushTimeout(() => {
            // 0점은 Unranked로 표시
            if (finalScore === 0) {
              setRank(null);
              setShowRank(true);
            } else {
              getScoreRank(score)
                .then((rank) => {
                  setRank(rank);
                  setShowRank(true);
                })
                .catch(() => {
                  setRank(-1);
                  setShowRank(true);
                });
            }
            // 모든 정보가 표시된 후 RESTART 버튼 활성화
            pushTimeout(() => {
              setIsRestartEnabled(true);
            }, 300);
          }, 300);
        }, 300);
      }, 300);
    };

    if (score === 0) {
      setDisplayScore(score);
      showAnimation(0);
      return () => {
        timeouts.forEach((id) => clearTimeout(id));
        if (animationFrameId !== undefined)
          cancelAnimationFrame(animationFrameId);
      };
    }

    // 점수 카운트 업 애니메이션(requestAnimationFrame) 적용
    let startTime: number | undefined;
    const duration = 1500;

    const easeOutExpo = (x: number): number => {
      return x === 1 ? 1 : 1 - Math.pow(2, -8 * x);
    };

    const animate = (currentTime: number) => {
      if (startTime === undefined) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = Math.floor(0 + (score - 0) * easedProgress);

      setDisplayScore(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        showAnimation(score);
      }
    };

    // 메뉴가 표시된 후에만 애니메이션 시작(초기 진입 전 프레임 낭비 방지)
    if (showMenu) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      timeouts.forEach((id) => clearTimeout(id));
      if (animationFrameId !== undefined)
        cancelAnimationFrame(animationFrameId);
    };
  }, [score, showMenu]);

  return (
    <PanelOverlay className="w-[180px] p-3 md:w-[260px] md:p-5 lg:w-[320px]">
      <div
        className={`relative flex w-full flex-col items-center justify-center space-y-2.5 transition-all duration-1000 md:space-y-4 lg:space-y-6 ${
          showMenu ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <div className="pt-0.5 text-center">
          <h2 className="text-lg font-black tracking-tighter text-white md:text-xl lg:text-4xl">
            GAME{' '}
            <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              OVER
            </span>
          </h2>
        </div>

        <div className="grid w-full grid-cols-2 gap-1.5 md:gap-2">
          <StatBox
            label="Score"
            value={formatRankingScore(displayScore)}
            show={true}
            highlight
          />
          <StatBox
            label="Accuracy"
            value={formatAccuracy(accuracy)}
            show={showAccuracy}
          />
          <StatBox
            label="Time"
            value={formatPlayTime(elapsedTime)}
            show={showTime}
          />
          <StatBox
            label="Rank"
            value={
              rank === -1
                ? 'ERROR'
                : rank !== null
                  ? `#${rank.toLocaleString()}`
                  : 'UNRANKED'
            }
            show={showRank}
            highlight={rank !== null && rank !== -1}
          />
        </div>

        {score !== 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!isNameValid || isSaving) return;
              onSave();
            }}
            className="w-full space-y-1.5 rounded-lg border border-white/5 bg-white/5 p-2 md:space-y-2 md:p-4"
          >
            {(saveStatus === 'idle' || saveStatus === 'error') && (
              <>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={userName}
                    onChange={handleNameChange}
                    placeholder="ENTER NAME"
                    maxLength={10}
                    className="w-full rounded border border-white/10 bg-black/40 px-2 py-1 text-center text-[10px] font-bold text-white placeholder-gray-600 transition-colors focus:border-[#00ff00] focus:outline-none focus:ring-1 focus:ring-[#00ff00] md:rounded-md md:py-1.5 md:text-sm"
                  />

                  <div className="min-h-[12px] text-center">
                    {userName.length === 0 ? (
                      <p className="text-[8px] text-gray-500 md:text-[9px]">
                        Enter name to save record
                      </p>
                    ) : !isNameValid ? (
                      <p className="text-[8px] text-red-500 md:text-[9px]">
                        2-10 characters required
                      </p>
                    ) : (
                      <p className="text-[8px] text-[#00ff00] md:text-[9px]">
                        Ready to save
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isNameValid || isSaving}
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="h-6 text-[9px] font-bold tracking-wider md:h-9 md:text-xs"
                >
                  {isSaving
                    ? 'SAVING...'
                    : saveStatus === 'error'
                      ? 'RETRY SAVE'
                      : 'SAVE RECORD'}
                </Button>
              </>
            )}

            {saveStatus === 'success' && (
              <div className="py-0.5 text-center">
                <p className="text-[10px] font-bold text-[#00ff00] md:text-sm">
                  RECORD SAVED!
                </p>
              </div>
            )}
          </form>
        )}

        <div className="flex w-full gap-1.5 md:gap-2">
          <Button
            onClick={isRestartEnabled ? onRestart : undefined}
            variant="primary"
            size="sm"
            fullWidth
            disabled={!isRestartEnabled}
            type="submit"
            className={`h-7 text-[10px] font-bold transition-all duration-500 md:h-10 md:text-xs ${
              isRestartEnabled ? 'opacity-100' : 'opacity-50 grayscale'
            }`}
          >
            RESTART
          </Button>
          <Button
            onClick={onMenu}
            variant="secondary"
            size="sm"
            fullWidth
            className="h-7 text-[10px] md:h-10 md:text-xs"
          >
            MENU
          </Button>
        </div>
      </div>
    </PanelOverlay>
  );
};
