import { Router } from 'express';
import {
  addRanking,
  getRankings,
  getUserRankings,
} from '../controllers/rankingsController';

const router = Router();

// 랭킹 추가
router.post('/', addRanking);

// 전체 랭킹 조회
router.get('/', getRankings);

// 특정 사용자 랭킹 조회
router.get('/:userName', getUserRankings);

export default router;
