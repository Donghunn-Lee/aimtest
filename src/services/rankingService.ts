import axios from 'axios';

export interface RankingData {
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
}

export interface RankingResponse {
  id: number;
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
  created_at: string;
}

// =========================
// API
// =========================

export async function addRanking(data: RankingData): Promise<void> {
  await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rankings`, data);
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/health`,
      { timeout: 3000 }
    );

    return response.status === 200;
  } catch {
    // 헬스 체크는 실패 자체가 결과이므로 로그 X
    return false;
  }
}

export async function getRankings(): Promise<RankingResponse[]> {
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/rankings`
  );
  return response.data;
}

export async function getUserRankings(
  userName: string
): Promise<RankingResponse[]> {
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/rankings/${userName}`
  );
  return response.data;
}

export async function getScoreRank(score: number): Promise<number> {
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/rankings/rank/${score}`
  );
  return response.data.rank_position;
}

// =========================
// Utilities
// =========================

export function formatRankingScore(score: number): string {
  return score.toLocaleString();
}

export function formatAccuracy(accuracy: number): string {
  return `${accuracy.toFixed(2)}%`;
}

export function formatPlayTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

export function sortRankings(rankings: RankingResponse[]): RankingResponse[] {
  return [...rankings].sort((a, b) => b.score - a.score);
}
