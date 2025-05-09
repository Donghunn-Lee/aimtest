import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rankingsRouter from './routes/rankings';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'AIM TEST Server' });
});

app.use('/api/rankings', rankingsRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
