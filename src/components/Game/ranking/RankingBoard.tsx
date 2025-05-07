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
            Close
          </Button>
        </div>

        <div className="overflow-x-auto rounded-md border border-white/30">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`${styles.header} rounded-tl-md`}>Name</th>
                <th className={styles.header}>Score</th>
                <th className={styles.header}>Accuracy</th>
                <th className={styles.header}>Play Time</th>
                <th className={`${styles.header} rounded-tr-md`}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {ranking.map((item) => (
                <tr key={item.id}>
                  <td className={styles.cellBold}>{item.user_name}</td>
                  <td className={styles.cell}>{item.score.toLocaleString()}</td>
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
    </PanelOverlay>
  );
};

export default RankingBoard;
