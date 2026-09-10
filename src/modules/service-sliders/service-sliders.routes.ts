import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { uploadServiceImage } from '../../middleware/service-image.middleware.js';
import {
  getPublicServiceSliders,
  getServiceSliderBySlugHandler,
  getSliderImage,
  adminListServiceSliders,
  adminUpdateServiceSlider,
  adminUploadServiceSliderImage,
} from './service-sliders.controller.js';

export const publicServiceSlidersRouter = Router();

publicServiceSlidersRouter.get('/', getPublicServiceSliders);
publicServiceSlidersRouter.get('/images/:filename', getSliderImage);
publicServiceSlidersRouter.get('/:serviceSlug', getServiceSliderBySlugHandler);

export const adminServiceSlidersRouter = Router();

adminServiceSlidersRouter.use(authenticate, requireAdmin);

adminServiceSlidersRouter.get('/', adminListServiceSliders);
adminServiceSlidersRouter.put('/:serviceSlug', adminUpdateServiceSlider);
adminServiceSlidersRouter.post('/upload-image', uploadServiceImage, adminUploadServiceSliderImage);

export { getServiceSliderBySlugHandler };
