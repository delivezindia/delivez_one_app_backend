import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getPaymentMethodsOverview,
  createPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
} from './payment-methods.controller.js';

export const paymentMethodsRouter = Router();

paymentMethodsRouter.use(authenticate);

paymentMethodsRouter.get('/', getPaymentMethodsOverview);
paymentMethodsRouter.post('/', createPaymentMethod);
paymentMethodsRouter.patch('/:id/default', setDefaultPaymentMethod);
paymentMethodsRouter.put('/:id/default', setDefaultPaymentMethod);
paymentMethodsRouter.delete('/:id', deletePaymentMethod);
