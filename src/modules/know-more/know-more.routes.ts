import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { uploadServiceImage } from '../../middleware/service-image.middleware.js';
import {
  getPublicKnowMoreCards,
  getPublicKnowMoreCardById,
  getKnowMoreImage,
  adminListKnowMoreCards,
  adminGetKnowMoreCard,
  adminCreateKnowMoreCard,
  adminUpdateKnowMoreCard,
  adminDeleteKnowMoreCard,
  adminToggleKnowMoreCard,
  adminUploadKnowMoreImage,
} from './know-more.controller.js';

export const publicKnowMoreRouter = Router();

publicKnowMoreRouter.get('/', getPublicKnowMoreCards);
publicKnowMoreRouter.get('/images/:filename', getKnowMoreImage);
publicKnowMoreRouter.get('/:id', getPublicKnowMoreCardById);

export const adminKnowMoreRouter = Router();

adminKnowMoreRouter.use(authenticate, requireAdmin);

adminKnowMoreRouter.get('/', adminListKnowMoreCards);
adminKnowMoreRouter.post('/', adminCreateKnowMoreCard);
adminKnowMoreRouter.post('/upload-image', uploadServiceImage, adminUploadKnowMoreImage);
adminKnowMoreRouter.get('/:id', adminGetKnowMoreCard);
adminKnowMoreRouter.put('/:id', adminUpdateKnowMoreCard);
adminKnowMoreRouter.delete('/:id', adminDeleteKnowMoreCard);
adminKnowMoreRouter.patch('/:id/toggle', adminToggleKnowMoreCard);
