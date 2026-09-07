import { createServer } from 'node:http';

import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const server = createServer(app);
let isShuttingDown = false;

server.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, `Delivery API is listening on port ${env.PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info({ signal }, 'Graceful shutdown started');

  const forcedShutdown = setTimeout(() => {
    logger.error('Graceful shutdown timed out; forcing exit');
    process.exit(1);
  }, env.SHUTDOWN_TIMEOUT_MS);
  forcedShutdown.unref();

  server.close((serverError) => {
    void (async () => {
      if (serverError) logger.error({ err: serverError }, 'HTTP server failed to close cleanly');
      await prisma.$disconnect();
      clearTimeout(forcedShutdown);
      logger.info('Graceful shutdown completed');
      process.exit(serverError ? 1 : 0);
    })();
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('SIGTERM');
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection');
  shutdown('SIGTERM');
});
