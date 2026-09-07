import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  adminListVaultBookings,
  adminUpdateVaultStatus,
  cancelBookingHandler,
  completeSandboxPaymentHandler,
  createBooking,
  getBookingById,
  getBookings,
  getOptions,
  getQuote,
  trackVault,
  verifyDeliveryOtp,
} from './confidential-delivery.controller.js';

export const confidentialDeliveryRouter = Router();

// Public / discovery endpoints
confidentialDeliveryRouter.get('/options', getOptions);
confidentialDeliveryRouter.post('/quote', getQuote);
confidentialDeliveryRouter.get('/track/:vaultId', trackVault);
confidentialDeliveryRouter.post('/track/:id/verify-otp', verifyDeliveryOtp);

// User-authenticated endpoints
confidentialDeliveryRouter.post('/bookings', authenticate, requireUser, createBooking);
confidentialDeliveryRouter.get('/bookings', authenticate, requireUser, getBookings);
confidentialDeliveryRouter.get('/bookings/:id', authenticate, requireUser, getBookingById);
confidentialDeliveryRouter.post('/bookings/:id/verify-otp', authenticate, requireUser, verifyDeliveryOtp);
confidentialDeliveryRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelBookingHandler);
confidentialDeliveryRouter.post(
  '/bookings/:id/payments/sandbox',
  authenticate,
  requireUser,
  completeSandboxPaymentHandler
);

// Admin-authenticated endpoints
confidentialDeliveryRouter.get('/admin/bookings', authenticate, requireAdmin, adminListVaultBookings);
confidentialDeliveryRouter.patch('/admin/bookings/:id/status', authenticate, requireAdmin, adminUpdateVaultStatus);


