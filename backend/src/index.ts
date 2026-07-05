import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { createApiRouter } from './interfaces/http/routes.js';
import { MengjiaoApiAdapter } from './infrastructure/adapters/mengjiao.adapter.js';
import { MemoryCache } from './infrastructure/cache/memory-cache.js';
import { FundService } from './application/fund.service.js';


const app = express();
app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
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

const cache = new MemoryCache(config.cache.ttlMs, config.cache.maxSize);
const adapter = new MengjiaoApiAdapter(cache);
const service = new FundService(adapter);
const apiRouter = createApiRouter(service);

app.use('/api', apiRouter);

app.listen(config.port, () => {
  console.log(`Fund research backend listening on port ${config.port}`);
});
