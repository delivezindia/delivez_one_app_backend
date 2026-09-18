import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  adminListVaultBookings,
  adminUpdateVaultStatus,
  cancelBookingHandler,
  submitBookingReviewHandler,
  getBookingReviewHandler,
  completeSandboxPaymentHandler,
  createBooking,
  getBookingById,
  getBookings,
  getOptions,
  getQuote,
  trackVault,
  verifyDeliveryOtp,
  getVaultSummary,
  getVaultPod,
  submitVaultPod,
  getVaultInvoice,
} from './confidential-delivery.controller.js';

export const confidentialDeliveryRouter = Router();

// Public / discovery endpoints
confidentialDeliveryRouter.get('/options', getOptions);
confidentialDeliveryRouter.post('/quote', getQuote);
confidentialDeliveryRouter.post('/order-review', getQuote);
confidentialDeliveryRouter.post('/preview', getQuote);
confidentialDeliveryRouter.get('/track/:vaultId', trackVault);
confidentialDeliveryRouter.post('/track/:id/verify-otp', verifyDeliveryOtp);
// Public discovery / tracking routes
confidentialDeliveryRouter.get('/summary/:vaultId', getVaultSummary);
confidentialDeliveryRouter.get('/pod/:vaultId', getVaultPod);
confidentialDeliveryRouter.post('/pod/:vaultId', submitVaultPod);
confidentialDeliveryRouter.get('/invoice/:vaultId', getVaultInvoice);
confidentialDeliveryRouter.get('/receipt/:vaultId', getVaultInvoice);

// User-authenticated / booking operations
confidentialDeliveryRouter.get('/bookings/:id/summary', authenticate, requireUser, getVaultSummary);
confidentialDeliveryRouter.get('/bookings/:id/pod', authenticate, requireUser, getVaultPod);
confidentialDeliveryRouter.post('/bookings/:id/pod', authenticate, requireUser, submitVaultPod);
confidentialDeliveryRouter.get('/bookings/:id/invoice', authenticate, requireUser, getVaultInvoice);
confidentialDeliveryRouter.get('/bookings/:id/receipt', authenticate, requireUser, getVaultInvoice);


// User-authenticated endpoints
confidentialDeliveryRouter.post('/bookings', authenticate, requireUser, createBooking);
confidentialDeliveryRouter.get('/bookings', authenticate, requireUser, getBookings);
confidentialDeliveryRouter.get('/bookings/:id', authenticate, requireUser, getBookingById);
confidentialDeliveryRouter.post('/bookings/:id/verify-otp', authenticate, requireUser, verifyDeliveryOtp);
confidentialDeliveryRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelBookingHandler);
// Review & Feedback endpoints
confidentialDeliveryRouter.get('/bookings/:id/review', getBookingReviewHandler);
confidentialDeliveryRouter.get('/:id/review', getBookingReviewHandler);
confidentialDeliveryRouter.post('/bookings/:id/review', authenticate, requireUser, submitBookingReviewHandler);
confidentialDeliveryRouter.post('/bookings/:id/feedback', authenticate, requireUser, submitBookingReviewHandler);
confidentialDeliveryRouter.post('/:id/review', authenticate, requireUser, submitBookingReviewHandler);
confidentialDeliveryRouter.post('/:id/feedback', authenticate, requireUser, submitBookingReviewHandler);

confidentialDeliveryRouter.post(
  '/bookings/:id/payments/sandbox',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/:id/payments/sandbox',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/bookings/:id/sandbox-payment',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/:id/sandbox-payment',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/bookings/:id/payments/sandbox-complete',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/:id/payments/sandbox-complete',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/bookings/:id/payment',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);
confidentialDeliveryRouter.post(
  '/:id/payment',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);

// Admin-authenticated endpoints
confidentialDeliveryRouter.get('/admin/bookings', authenticate, requireAdmin, adminListVaultBookings);
confidentialDeliveryRouter.patch('/admin/bookings/:id/status', authenticate, requireAdmin, adminUpdateVaultStatus);


