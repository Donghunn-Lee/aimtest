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
  await axios.post(`/api/rankings`, data);
}

export async function checkHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const response = await axios.get(`/api/health`, {
      timeout: 10000,
      signal,
    });

    return response.status === 200;
  } catch {
    // 헬스 체크는 실패 자체가 결과이므로 로그 X
    return false;
  }
}

export async function getRankings(): Promise<RankingResponse[]> {
  const response = await axios.get(`/api/rankings`);
  return response.data;
}

export async function getScoreRank(score: number): Promise<number> {
  const response = await axios.get(`/api/rankings/rank/${score}`);
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
  // 소수부를 부동소수로 떼면 0.29가 28로 절삭되므로 1/100초 정수로 나눈다
  const centiseconds = Math.round(seconds * 100);
  const totalSeconds = Math.floor(centiseconds / 100);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const milliseconds = centiseconds % 100;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}
