import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  updateAddress,
} from './address.controller.js';

export const addressRouter = Router();

addressRouter.use(authenticate, requireUser);
addressRouter.get('/', listAddresses);
addressRouter.post('/', createAddress);
addressRouter.put('/:id', updateAddress);
addressRouter.delete('/:id', deleteAddress);
