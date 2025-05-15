import { useEffect, useState } from 'react';

import Button from '@/components/common/Button';
import { PanelOverlay } from '@/components/common/PanelOverlay';
import {
  getRankings,
  type RankingResponse,
  formatAccuracy,
  formatPlayTime,
} from '@/services/rankingService';

interface RankingBoardProps {
  onClose: () => void;
  animate?: boolean;
}

const styles = {
  header:
    'px-1.5 py-[0.2rem] text-left text-[10px] font-medium text-gray-300 uppercase tracking-wider md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm',
  cell: 'px-1.5 py-[0.2rem] whitespace-nowrap text-[10px] text-gray-300 md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm',
  cellBold:
    'px-1.5 py-[0.2rem] whitespace-nowrap text-[10px] font-medium text-white md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm',
  rankCell: 'w-8 text-center',
  rank1: 'text-yellow-400 font-bold',
  rank2: 'text-gray-300 font-bold',
  rank3: 'text-amber-500 font-bold',
};

const RankingBoard = ({ onClose, animate = true }: RankingBoardProps) => {
  const [ranking, setRanking] = useState<RankingResponse[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const ranking = await getRankings();
      setRanking(ranking);
    };

    fetchRanking();
  }, []);

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return styles.rank1;
      case 1:
        return styles.rank2;
      case 2:
        return styles.rank3;
      default:
        return '';
    }
  };

  return (
    <PanelOverlay animate={animate}>
      <div className="mx-auto w-full max-w-[660px] space-y-1 p-0.5 md:space-y-1.5 md:p-0.5 lg:space-y-2 lg:p-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold text-white md:text-lg lg:text-xl">
            Ranking Board
          </h1>
          <Button
            onClick={onClose}
            variant="danger"
            size="sm"
          >
            ←
          </Button>
        </div>

        <div className="rounded-md border border-white/30 p-1">
          <div className="max-h-[240px] overflow-y-auto md:max-h-[320px] lg:max-h-[400px] xl:max-h-[480px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:p-2 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  <th
                    className={`${styles.header} ${styles.rankCell} rounded-tl-md`}
                  >
                    Rank
                  </th>
                  <th className={styles.header}>Name</th>
                  <th className={styles.header}>Score</th>
                  <th className={styles.header}>Accuracy</th>
                  <th className={styles.header}>Play Time</th>
                  <th className={`${styles.header} rounded-tr-md`}>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 overflow-y-auto">
                {ranking.map((item, index) => (
                  <tr key={item.id}>
                    <td
                      className={`${styles.cell} ${styles.rankCell} ${getRankStyle(index)}`}
                    >
                      {index + 1}
                    </td>
                    <td className={styles.cellBold}>{item.user_name}</td>
                    <td className={styles.cell}>
                      {item.score.toLocaleString()}
                    </td>
                    <td className={styles.cell}>
                      {formatAccuracy(item.accuracy)}
                    </td>
                    <td className={styles.cell}>
                      {formatPlayTime(item.play_time)}
                    </td>
                    <td className={styles.cell}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PanelOverlay>
  );
};

export default RankingBoard;
