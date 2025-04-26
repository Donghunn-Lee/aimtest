import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface RankingData {
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
}

export interface RankingResponse {
  user_name: string;
  score: number;
  accuracy: number;
  play_time: number;
  created_at: string;
}

// API
export const addRanking = async (data: RankingData): Promise<void> => {
  try {
    await axios.post(`${API_BASE_URL}/rankings`, data);
  } catch (error) {
    console.error('Error adding ranking:', error);
    throw error;
  }
};

export const getRankings = async (): Promise<RankingResponse[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rankings`);
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
    const response = await axios.get(`${API_BASE_URL}/rankings/${userName}`);
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
  return `${(accuracy * 100).toFixed(1)}%`;
};

export const formatPlayTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const sortRankings = (
  rankings: RankingResponse[]
): RankingResponse[] => {
  return [...rankings].sort((a, b) => b.score - a.score);
};
