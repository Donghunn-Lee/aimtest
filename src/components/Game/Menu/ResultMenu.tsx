import { useState } from "react";
import { PanelOverlay } from "../../common/PanelOverlay";
import { addRanking, formatRankingScore, formatAccuracy, formatPlayTime } from "../../../services/rankingService";

interface ResultMenuProps {
  score: number;
  elapsedTime: number;
  onRestart: () => void;
  onMenu: () => void;
  accuracy: number;
}

const ResultMenu = ({ score, accuracy, elapsedTime, onRestart, onMenu }: ResultMenuProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
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
        <h2 className="text-2xl font-bold mb-4 text-white text-center">Game Over</h2>
        <div className="text-white text-center space-y-2">
          <p>Score: {formatRankingScore(score)}</p>
          <p>Accuracy: {formatAccuracy(accuracy)}</p>
          <p>Time: {formatPlayTime(elapsedTime)}</p>
        </div>
        <div className="space-y-4 w-full max-w-md">
          <div className="space-y-2">
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="Enter your name (2-20 characters)"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
            {!isNameValid && userName.length > 0 && (
              <p className="text-red-500 text-sm">Name must be between 2 and 20 characters</p>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={!isNameValid || isSaving}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'SAVE'}
          </button>
          {saveStatus === 'success' && (
            <p className="text-green-500 text-center">Ranking saved successfully!</p>
          )}
          {saveStatus === 'error' && (
            <p className="text-red-500 text-center">Failed to save ranking. Please try again.</p>
          )}
          <button
            onClick={onRestart}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            RESTART
          </button>
          <button
            onClick={onMenu}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            RANKING
          </button>
        </div>
      </div>
    </PanelOverlay>
  );
};

export default ResultMenu; 