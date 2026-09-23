import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getPaymentMethodsOverview,
  createPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  addWalletBalance,
  getWalletTransactions,
} from './payment-methods.controller.js';

export const paymentMethodsRouter = Router();
paymentMethodsRouter.use(authenticate);

// Payment Methods
paymentMethodsRouter.get('/', getPaymentMethodsOverview);
paymentMethodsRouter.post('/', createPaymentMethod);
paymentMethodsRouter.patch('/:id/default', setDefaultPaymentMethod);
paymentMethodsRouter.put('/:id/default', setDefaultPaymentMethod);
paymentMethodsRouter.delete('/:id', deletePaymentMethod);

// Wallet Balance & History Endpoints (mounted under /payment-methods)
paymentMethodsRouter.post('/wallet/add', addWalletBalance);
paymentMethodsRouter.post('/wallet/topup', addWalletBalance);
paymentMethodsRouter.get('/wallet/transactions', getWalletTransactions);
paymentMethodsRouter.get('/wallet/history', getWalletTransactions);
paymentMethodsRouter.get('/wallet', getPaymentMethodsOverview);

// Dedicated walletRouter (mounted directly under /wallet)
export const walletRouter = Router();
walletRouter.use(authenticate);
walletRouter.get('/', getPaymentMethodsOverview);
walletRouter.post('/add', addWalletBalance);
walletRouter.post('/topup', addWalletBalance);
walletRouter.get('/transactions', getWalletTransactions);
walletRouter.get('/history', getWalletTransactions);
walletRouter.post('/wallet/add', addWalletBalance);
walletRouter.get('/wallet/transactions', getWalletTransactions);
