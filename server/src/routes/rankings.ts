import { Router } from 'express';

import {
  addRanking,
  getRankings,
  getScoreRank,
  getUserRankings,
} from '../controllers/rankingsController';

export const router = Router();

// 랭킹 추가
router.post('/', addRanking);

// 전체 랭킹 조회
router.get('/', getRankings);

// 특정 사용자 랭킹 조회
router.get('/:userName', getUserRankings);

// 특정 점수의 순위 조회
router.get('/rank/:score', getScoreRank);
