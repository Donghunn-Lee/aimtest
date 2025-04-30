import { useState } from 'react';
import { PanelOverlay } from '../../common/PanelOverlay';
import {
  addRanking,
  formatRankingScore,
  formatAccuracy,
  formatPlayTime,
} from '../../../services/rankingService';

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

  return (
    <PanelOverlay>
      <div className="flex flex-col items-center justify-center space-y-8 px-6">
        <h2 className="mb-4 text-center text-2xl font-bold text-white">
          Game Over
        </h2>
        <div className="space-y-2 text-center text-white">
          <p>Score: {formatRankingScore(score)}</p>
          <p>Accuracy: {formatAccuracy(accuracy)}</p>
          <p>Time: {formatPlayTime(elapsedTime)}</p>
        </div>
        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="Enter your name (2-20 characters)"
              className="w-full rounded-lg bg-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            {!isNameValid && userName.length > 0 && (
              <p className="text-sm text-red-500">
                Name must be between 2 and 20 characters
              </p>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={!isNameValid || isSaving}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'SAVE'}
          </button>
          {saveStatus === 'success' && (
            <p className="text-center text-green-500">
              Ranking saved successfully!
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="text-center text-red-500">
              Failed to save ranking. Please try again.
            </p>
          )}
          <button
            onClick={onRestart}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-700"
          >
            RESTART
          </button>
          <button
            onClick={onMenu}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-xl font-bold text-white transition-colors hover:bg-blue-700"
          >
            RANKING
          </button>
        </div>
      </div>
    </PanelOverlay>
  );
};

export default ResultMenu;
