import { Router } from 'express';

import {
  getService,
  getServiceImage,
  listServices,
} from './service.controller.js';

export const serviceRouter = Router();

serviceRouter.get('/', listServices);
serviceRouter.get('/:slug/image', getServiceImage);
serviceRouter.get('/:slug', getService);
