import { PrismaClient } from '@prisma/client';

import { env } from '../config/env.js';
import { logger } from './logger.js';

const prismaLog = [
  { emit: 'event' as const, level: 'query' as const },
  { emit: 'event' as const, level: 'error' as const },
  { emit: 'event' as const, level: 'warn' as const },
];

type LoggedPrismaClient = PrismaClient<{ log: typeof prismaLog }>;

const globalForPrisma = globalThis as unknown as { prisma?: LoggedPrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: prismaLog });

prisma.$on('error', (event) => logger.error({ event }, 'Prisma error'));
prisma.$on('warn', (event) => logger.warn({ event }, 'Prisma warning'));

if (env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    logger.debug({ durationMs: event.duration, query: event.query }, 'Database query');
  });
  globalForPrisma.prisma = prisma;
}
