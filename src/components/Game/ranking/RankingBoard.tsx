import { useEffect } from 'react';
import { useState } from 'react';
import Button from '../../common/Button';
import { PanelOverlay } from '../../common/PanelOverlay';
import {
  getRankings,
  type RankingResponse,
  formatAccuracy,
  formatPlayTime,
} from '../../../services/rankingService';

const tableHeaderStyles =
  'px-1.5 py-[0.2rem] text-left text-[10px] font-medium text-gray-300 uppercase tracking-wider md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm';
const tableCellStyles =
  'px-1.5 py-[0.2rem] whitespace-nowrap text-[10px] text-gray-300 md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm';
const tableCellBoldStyles =
  'px-1.5 py-[0.2rem] whitespace-nowrap text-[10px] font-medium text-white md:px-2 md:py-[0.25rem] md:text-xs lg:px-3 lg:py-[0.3rem] lg:text-sm';

interface RankingBoardProps {
  onClose: () => void;
  animate?: boolean;
}

const RankingBoard = ({ onClose, animate = true }: RankingBoardProps) => {
  const [ranking, setRanking] = useState<RankingResponse[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const ranking = await getRankings();
      console.log(ranking);
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
                <th className={`${tableHeaderStyles} rounded-tl-md`}>Name</th>
                <th className={tableHeaderStyles}>Score</th>
                <th className={tableHeaderStyles}>Accuracy</th>
                <th className={tableHeaderStyles}>Play Time</th>
                <th className={`${tableHeaderStyles} rounded-tr-md`}>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {ranking.map((item, index) => (
                <tr key={item.id}>
                  <td className={tableCellBoldStyles}>{item.user_name}</td>
                  <td className={tableCellStyles}>
                    {item.score.toLocaleString()}
                  </td>
                  <td className={tableCellStyles}>
                    {formatAccuracy(item.accuracy)}
                  </td>
                  <td className={tableCellStyles}>
                    {formatPlayTime(item.play_time)}
                  </td>
                  <td className={tableCellStyles}>
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
