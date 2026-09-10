import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import {
  listMoreServicesHandler,
  getMoreServiceBySlugHandler,
  adminListMoreServicesHandler,
  adminCreateMoreServiceHandler,
  adminUpdateMoreServiceHandler,
  adminDeleteMoreServiceHandler,
  adminReorderMoreServicesHandler
} from './more-services.controller.js';

export const publicMoreServicesRouter = Router();
publicMoreServicesRouter.get('/', listMoreServicesHandler);
publicMoreServicesRouter.get('/list', listMoreServicesHandler);
publicMoreServicesRouter.get('/:slug', getMoreServiceBySlugHandler);

export const adminMoreServicesRouter = Router();
adminMoreServicesRouter.use(authenticate, requireAdmin);
adminMoreServicesRouter.get('/', adminListMoreServicesHandler);
adminMoreServicesRouter.post('/', adminCreateMoreServiceHandler);
adminMoreServicesRouter.post('/reorder', adminReorderMoreServicesHandler);
adminMoreServicesRouter.get('/:id', getMoreServiceBySlugHandler);
adminMoreServicesRouter.put('/:id', adminUpdateMoreServiceHandler);
adminMoreServicesRouter.patch('/:id', adminUpdateMoreServiceHandler);
adminMoreServicesRouter.delete('/:id', adminDeleteMoreServiceHandler);
