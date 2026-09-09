import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestLogger } from './middleware/request-logger.js';
import { autoAuditLogger } from './middleware/audit-logger.middleware.js';
import { systemRouter } from './modules/system/system.routes.js';
import { apiRouter } from './routes.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);

app.use(requestLogger);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: false, limit: env.JSON_BODY_LIMIT }));
app.use(autoAuditLogger);

app.use('/health', systemRouter);
app.use(
  '/api',
  rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.NODE_ENV === 'production' ? env.RATE_LIMIT_MAX : 100000,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => env.NODE_ENV !== 'production' || req.ip === '127.0.0.1' || req.ip === '::1',
  }),
);
app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
