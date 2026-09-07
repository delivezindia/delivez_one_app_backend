import { randomUUID } from 'node:crypto';

import { pinoHttp } from 'pino-http';

import { logger } from '../lib/logger.js';

export const requestLogger = pinoHttp({
  logger,
  genReqId(request, response) {
    const incomingId = request.headers['x-request-id'];
    const requestId =
      typeof incomingId === 'string' && incomingId.length <= 128 ? incomingId : randomUUID();

    response.setHeader('x-request-id', requestId);
    return requestId;
  },
  customLogLevel(_request, response, error) {
    if (error || response.statusCode >= 500) return 'error';
    if (response.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage(request, response) {
    return `${request.method ?? 'UNKNOWN'} ${request.url ?? '/'} completed with ${response.statusCode}`;
  },
  customErrorMessage(request, response) {
    return `${request.method ?? 'UNKNOWN'} ${request.url ?? '/'} failed with ${response.statusCode}`;
  },
});
