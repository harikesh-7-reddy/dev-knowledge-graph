import { Router } from 'express'; import { checkHealth } from '../db/health.js';
export const healthRouter = Router();
healthRouter.get('/', async (_req,res) => { const h = await checkHealth(); res.status(h.status === 'ok' ? 200 : 503).json(h); });
