import { useEffect } from "react";
import { useState } from "react";
import { PanelOverlay } from "../../common/PanelOverlay";
import { getRankings, type RankingResponse } from "../../../services/rankingService";

const RankingBoard = () => {

  const [ranking, setRanking] = useState<RankingResponse[]>([]);

  useEffect(() => {
    const fetchRanking = async () => {
      const ranking = await getRankings();
      setRanking(ranking);
    };

    fetchRanking();
  }, []);


  return (
    <PanelOverlay>
      <div>
        <h1>Ranking Board</h1>
        <div>
          {ranking.map((item) => (
            <div key={item.id}>{item.user_name}</div>
          ))}
        </div>
      </div>
    </PanelOverlay>
  );
};

export default RankingBoard;
