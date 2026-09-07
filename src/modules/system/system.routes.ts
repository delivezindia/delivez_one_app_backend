import { Router } from 'express';

import { prisma } from '../../lib/prisma.js';

export const systemRouter = Router();

const handleHealth = (_request: any, response: any) => {
  response.status(200).json({
    status: 'ok',
    service: 'delivery-app-backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
};

systemRouter.get('/', handleHealth);
systemRouter.get('/live', handleHealth);

systemRouter.get('/ready', async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`;

  response.status(200).json({
    status: 'ready',
    database: 'connected',
    dependencies: { database: 'up' },
    timestamp: new Date().toISOString(),
  });
});
