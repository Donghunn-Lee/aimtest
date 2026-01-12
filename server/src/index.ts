import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import { checkHealth } from './controllers/rankingsController';
import rankingsRouter from './routes/rankings';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AIM TEST Server' });
});

app.get('/api/health', checkHealth);

app.use('/api/rankings', rankingsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
