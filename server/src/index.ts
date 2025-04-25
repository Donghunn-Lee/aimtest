import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rankingsRouter from './routes/rankings';

// 환경 변수 로드
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // React는 3000, 서버는 3001

// 미들웨어 설정
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'AIM Game Server' });
});

// 라우트 연결
app.use('/api/rankings', rankingsRouter);

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
