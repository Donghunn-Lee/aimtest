import { Request, Response } from 'express';
import { RowDataPacket } from 'mysql2';

import pool from '../database/db';

// 서버 상태 및 DB 연결 확인 (Health Check)
export const checkHealth = async (req: Request, res: Response) => {
  try {
    await pool.execute('SELECT 1');

    res.status(200).json({
      status: 'online',
      message: 'Server and Database are healthy',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'offline',
      error: 'Database connection failed',
    });
  }
};

// 랭킹 추가
export const addRanking = async (req: Request, res: Response) => {
  try {
    const { user_name, score, accuracy, play_time } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO rankings (user_name, score, accuracy, play_time) VALUES (?, ?, ?, ?)',
      [user_name, score, accuracy, play_time]
    );

    res.status(201).json({ message: 'Ranking added successfully', result });
  } catch (error) {
    console.error('Error adding ranking:', error);
    res.status(500).json({ error: 'Failed to add ranking' });
  }
};

// 전체 랭킹 조회
export const getRankings = async (req: Request, res: Response) => {
  try {
    const [rankings] = await pool.execute(
      'SELECT user_name, score, accuracy, play_time, created_at FROM rankings ORDER BY score DESC LIMIT 100'
    );

    res.json(rankings);
  } catch (error) {
    console.error('Error getting rankings:', error);
    res.status(500).json({ error: 'Failed to get rankings' });
  }
};

// 특정 사용자 랭킹 조회
export const getUserRankings = async (req: Request, res: Response) => {
  try {
    const { userName } = req.params;

    const [rankings] = await pool.execute(
      'SELECT user_name, score, accuracy, play_time, created_at FROM rankings WHERE user_name = ? ORDER BY score DESC',
      [userName]
    );

    res.json(rankings);
  } catch (error) {
    console.error('Error getting user rankings:', error);
    res.status(500).json({ error: 'Failed to get user rankings' });
  }
};

// 특정 점수의 순위 조회
export const getScoreRank = async (req: Request, res: Response) => {
  try {
    const { score } = req.params;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) + 1 as rank_position FROM rankings WHERE score > ?',
      [score]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('Error getting score rank:', error);
    res.status(500).json({ error: 'Failed to get score rank' });
  }
};
