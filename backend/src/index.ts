import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import fundRoutes from './interfaces/http/routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    name: 'fund-research-dashboard-backend',
    status: 'ok',
    version: '0.1.0',
    endpoints: ['/health', '/api/funds', '/api/funds/movers', '/api/funds/volume-top', '/api/funds/compare', '/api/funds/:code']
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', fundRoutes);

app.listen(config.port, () => {
  console.log(`Fund research backend listening on port ${config.port}`);
});
