import { Router } from 'express';

import { requireAdmin } from '../../middleware/admin.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadServiceImage } from '../../middleware/service-image.middleware.js';
import {
  createService,
  deleteServiceImage,
  listAllServices,
  updateService,
} from './admin-service.controller.js';

export const adminServiceRouter = Router();

adminServiceRouter.use(authenticate, requireAdmin);
adminServiceRouter.get('/', listAllServices);
adminServiceRouter.post('/', uploadServiceImage, createService);
adminServiceRouter.patch('/:id', uploadServiceImage, updateService);
adminServiceRouter.post('/:id/image', uploadServiceImage, updateService);
adminServiceRouter.patch('/:id/image', uploadServiceImage, updateService);
adminServiceRouter.delete('/:id/image', deleteServiceImage);
