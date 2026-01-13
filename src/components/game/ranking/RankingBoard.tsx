import { useEffect, useState } from 'react';

import { Button } from '@/components/common/Button';
import { PanelOverlay } from '@/components/common/PanelOverlay';
import {
  formatAccuracy,
  formatPlayTime,
  formatRankingScore,
  getRankings,
  type RankingResponse,
} from '@/services/rankingService';

interface RankingBoardProps {
  onClose: () => void;
}

export const RankingBoard = ({ onClose }: RankingBoardProps) => {
  const [ranking, setRanking] = useState<RankingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setIsLoading(true);
        const data = await getRankings();
        setRanking(data);
      } catch {
        console.error('Failed to fetch rankings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'text-[#00ff00] font-black';
      case 1:
        return 'text-white font-bold';
      case 2:
        return 'text-gray-400 font-bold';
      default:
        return 'text-gray-500 font-medium';
    }
  };

  return (
    <PanelOverlay className="w-[320px] p-3 md:w-[480px] md:p-5 lg:w-[600px]">
      <div className="flex w-full flex-col space-y-1.5 lg:space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-lg font-black tracking-tighter text-white md:text-2xl">
            RANKING{' '}
            <span className="bg-gradient-to-r from-[#00ff00] to-[#007700] bg-clip-text text-transparent">
              BOARD
            </span>
          </h2>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="h-6 w-6 rounded-full p-0 text-[10px] md:h-8 md:w-8 md:text-xs"
          >
            ✕
          </Button>
        </div>

        <div>
          <p className="text-xs text-gray-500">Top 100</p>
        </div>
        <div className="relative w-full overflow-hidden rounded-lg border border-white/5 bg-white/5">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-xs text-gray-500">
              LOADING...
            </div>
          ) : (
            <div className="custom-scrollbar max-h-[300px] overflow-y-auto lg:max-h-[400px]">
              <table className="w-full min-w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[12%] md:w-[10%]" />
                  <col className="w-[28%] md:w-[25%]" />
                  <col className="w-[20%] md:w-[20%]" />
                  <col className="w-[20%] md:w-[15%]" />
                  <col className="w-[20%] md:w-[15%]" />
                  <col className="hidden md:block md:w-[15%]" />
                </colgroup>

                <thead className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm">
                  <tr>
                    <th className="py-2 pl-2 text-[9px] font-bold uppercase text-gray-500 md:pl-4 md:text-[10px]">
                      #
                    </th>
                    <th className="py-2 text-[9px] font-bold uppercase text-gray-500 md:text-[10px]">
                      Name
                    </th>
                    <th className="py-2 text-[9px] font-bold uppercase text-gray-500 md:text-[10px]">
                      Score
                    </th>
                    <th className="py-2 text-[9px] font-bold uppercase text-gray-500 md:text-[10px]">
                      Acc
                    </th>
                    <th className="py-2 text-[9px] font-bold uppercase text-gray-500 md:text-[10px]">
                      Time
                    </th>
                    <th className="hidden py-2 text-[9px] font-bold uppercase text-gray-500 md:block md:text-[10px]">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {ranking.length > 0 ? (
                    ranking.map((item, index) => (
                      <tr
                        key={item.id}
                        className="group transition-colors hover:bg-white/5"
                      >
                        <td
                          className={`py-1.5 pl-2 text-[10px] md:pl-4 md:text-xs ${getRankColor(index)}`}
                        >
                          {index + 1}
                        </td>

                        <td className="truncate py-1.5 text-[10px] font-medium text-gray-300 md:text-xs">
                          {item.user_name}
                        </td>

                        <td className="py-1.5 font-mono text-[10px] text-[#00ff00] md:text-xs">
                          {formatRankingScore(item.score)}
                        </td>

                        <td className="py-1.5 font-mono text-[9px] text-gray-400 md:text-xs">
                          {formatAccuracy(item.accuracy)}
                        </td>

                        <td className="py-1.5 font-mono text-[9px] text-gray-400 md:text-xs">
                          {formatPlayTime(item.play_time)}
                        </td>

                        <td className="hidden py-1.5 text-[9px] text-gray-400/50 md:block md:text-[10px]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-xs text-gray-500"
                      >
                        NO RECORDS YET
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PanelOverlay>
  );
};
