import express from 'express';

import { checkHealth } from './_lib/controllers/rankingsController';
import { router } from './_lib/routes/rankings';

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'AIM TEST Server' });
});

app.get('/api/health', checkHealth);

app.use('/api/rankings', router);

export default app;
