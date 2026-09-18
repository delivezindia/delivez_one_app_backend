import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  createVaultBookingHandler,
  getVaultBookingsHandler,
  getVaultBookingByIdHandler,
  updateVaultBookingHandler,
  patchVaultBookingHandler,
  deleteVaultBookingHandler,
  getCanonicalTemplateHandler,
  getCanonicalServicesHandler,
} from './vault-courier.controller.js';
import {
  createPaymentHandler,
  getPaymentByIdHandler,
  getBookingPaymentHandler,
  verifyPaymentHandler,
  refundPaymentHandler,
} from './vault-payment.controller.js';
import {
  createReceiptHandler,
  listReceiptsHandler,
  getReceiptByIdHandler,
  getBookingReceiptHandler,
} from './vault-receipt.controller.js';

export const vaultCourierRouter = Router();


// Public canonical template & services endpoints (accessible with or without token)
vaultCourierRouter.get('/services/canonical-template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/canonical-template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/template', getCanonicalTemplateHandler);
vaultCourierRouter.get('/services', getCanonicalServicesHandler);

// Authentication middleware for booking & payment operations
vaultCourierRouter.use(authenticate, requireUser);

// 1. BOOKINGS API
vaultCourierRouter.post('/bookings', createVaultBookingHandler);
vaultCourierRouter.get('/bookings', getVaultBookingsHandler);
vaultCourierRouter.get('/bookings/:id', getVaultBookingByIdHandler);
vaultCourierRouter.put('/bookings/:id', updateVaultBookingHandler);
vaultCourierRouter.patch('/bookings/:id', patchVaultBookingHandler);
vaultCourierRouter.delete('/bookings/:id', deleteVaultBookingHandler);

// 2. PAYMENTS API
vaultCourierRouter.post('/payments', createPaymentHandler);
vaultCourierRouter.get('/payments/:id', getPaymentByIdHandler);
vaultCourierRouter.get('/bookings/:bookingId/payment', getBookingPaymentHandler);
vaultCourierRouter.post('/payments/:id/verify', verifyPaymentHandler);
vaultCourierRouter.post('/payments/:id/refund', refundPaymentHandler);

// 3. RECEIPTS API
vaultCourierRouter.post('/receipts', createReceiptHandler);
vaultCourierRouter.get('/receipts', listReceiptsHandler);
vaultCourierRouter.get('/receipts/:id', getReceiptByIdHandler);
vaultCourierRouter.get('/bookings/:bookingId/receipt', getBookingReceiptHandler);
