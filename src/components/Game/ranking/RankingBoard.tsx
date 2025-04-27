import { useEffect } from "react";
import { useState } from "react";
import { PanelOverlay } from "../../common/PanelOverlay";
import { getRankings, type RankingResponse, formatAccuracy, formatPlayTime } from "../../../services/rankingService";

const tableHeaderStyles = "px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider";
const tableCellStyles = "px-6 py-4 whitespace-nowrap text-sm text-gray-300";
const tableCellBoldStyles = "px-6 py-4 whitespace-nowrap text-sm font-medium text-white";

interface RankingBoardProps {
  onClose: () => void;
}

const RankingBoard = ({ onClose }: RankingBoardProps) => {
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
    <PanelOverlay>
      <div className="space-y-8 p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Ranking Board</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-white/30 rounded-md border-separate border-spacing-0">
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
                  <td className={tableCellBoldStyles}>
                    {item.user_name}
                  </td>
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