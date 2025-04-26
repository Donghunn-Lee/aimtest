import { PanelOverlay } from '../../common/PanelOverlay';

interface ResultMenuProps {
  score: number;
  elapsedTime: number;
  onRestart: () => void;
}

export const ResultMenu = ({ score, elapsedTime, onRestart }: ResultMenuProps) => {
  const onSave = () => {
    console.log('save');
  };

  return (
    <PanelOverlay>
      <div className="flex flex-col items-center justify-center space-y-8 px-6">
        <h2 className="text-2xl font-bold mb-4 text-white">게임 결과</h2>
        <div className="text-white mb-6">
          <p className="text-lg mb-2">점수: {score}</p>
          <p className="text-lg">플레이 시간: {elapsedTime.toFixed(2)}초</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            다시하기
          </button>
          <button
            onClick={onSave}
            className="px-6 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            기록하기
          </button>
        </div>
      </div>
    </PanelOverlay>
  );
}; 