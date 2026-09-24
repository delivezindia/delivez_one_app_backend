import { Router } from 'express';
import {
  getSchedulePickupConfigHandler,
  createScheduledPickupHandler,
  listScheduledPickupsHandler,
  getScheduledPickupByIdHandler,
  cancelScheduledPickupHandler,
} from './schedule-pickup.controller.js';

export const schedulePickupRouter = Router();

schedulePickupRouter.get('/config', getSchedulePickupConfigHandler);
schedulePickupRouter.post('/', createScheduledPickupHandler);
schedulePickupRouter.post('/create', createScheduledPickupHandler);
schedulePickupRouter.get('/', listScheduledPickupsHandler);
schedulePickupRouter.get('/:id', getScheduledPickupByIdHandler);
schedulePickupRouter.post('/:id/cancel', cancelScheduledPickupHandler);
schedulePickupRouter.delete('/:id', cancelScheduledPickupHandler);
