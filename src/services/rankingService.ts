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

// API
export async function addRanking(data: RankingData): Promise<void> {
  try {
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rankings`, data);
  } catch (error) {
    console.error('Error adding ranking:', error);
    throw error;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/health`,
      { timeout: 3000 }
    );

    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export async function getRankings(): Promise<RankingResponse[]> {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/rankings`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting rankings:', error);
    throw error;
  }
}

export async function getUserRankings(
  userName: string
): Promise<RankingResponse[]> {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/rankings/${userName}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user rankings:', error);
    throw error;
  }
}

export async function getScoreRank(score: number): Promise<number> {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/rankings/rank/${score}`
    );
    return response.data.rank_position;
  } catch (error) {
    console.error('Error getting score rank:', error);
    throw error;
  }
}

// 유틸리티 함수
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
