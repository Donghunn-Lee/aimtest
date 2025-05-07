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
export const addRanking = async (data: RankingData): Promise<void> => {
  try {
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/rankings`, data);
  } catch (error) {
    console.error('Error adding ranking:', error);
    throw error;
  }
};

export const getRankings = async (): Promise<RankingResponse[]> => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/rankings`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting rankings:', error);
    throw error;
  }
};

export const getUserRankings = async (
  userName: string
): Promise<RankingResponse[]> => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/rankings/${userName}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting user rankings:', error);
    throw error;
  }
};

// 유틸리티 함수
export const formatRankingScore = (score: number): string => {
  return score.toLocaleString();
};

export const formatAccuracy = (accuracy: number): string => {
  return `${accuracy.toFixed(2)}%`;
};

export const formatPlayTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds % 1) * 100);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
};

export const sortRankings = (
  rankings: RankingResponse[]
): RankingResponse[] => {
  return [...rankings].sort((a, b) => b.score - a.score);
};
