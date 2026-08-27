import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message, code: err.code });
  logger.error('Unhandled error', err);
  return res.status(500).json({ error: config.isProduction ? 'An unexpected error occurred.' : err instanceof Error ? err.message : 'Unknown error', code: 'INTERNAL_ERROR' });
}
