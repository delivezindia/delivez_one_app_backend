import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'production' ? 20 : 10000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => env.NODE_ENV !== 'production' || req.ip === '127.0.0.1' || req.ip === '::1',
  handler(_req, res) {
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts. Please try again later.',
    });
  },
});
