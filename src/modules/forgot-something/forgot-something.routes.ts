import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  adminUpdateStatus,
  cancelBooking,
  completeSandboxPayment,
  createBooking,
  getBooking,
  listBookings,
  getOptions,
  getQuote,
  trackBooking,
  verifyOtp,
} from './forgot-something.controller.js';

export const forgotSomethingRouter = Router();

// Public / Discovery endpoints
forgotSomethingRouter.get('/options', getOptions);
forgotSomethingRouter.post('/quote', getQuote);
forgotSomethingRouter.get('/track/:identifier', trackBooking);
forgotSomethingRouter.post('/track/:id/verify-otp', verifyOtp);
forgotSomethingRouter.patch('/track/:id/status', adminUpdateStatus);

// User-Authenticated endpoints
forgotSomethingRouter.post('/bookings', authenticate, requireUser, createBooking);
forgotSomethingRouter.get('/bookings', authenticate, requireUser, listBookings);
forgotSomethingRouter.get('/bookings/:id', authenticate, requireUser, getBooking);
forgotSomethingRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelBooking);
forgotSomethingRouter.post('/bookings/:id/verify-otp', authenticate, requireUser, verifyOtp);
forgotSomethingRouter.post(
  '/bookings/:id/payments/sandbox',
  authenticate,
  requireUser,
  completeSandboxPayment
);

// Status update / Admin / Simulation endpoints
forgotSomethingRouter.patch('/bookings/:id/status', authenticate, adminUpdateStatus);
forgotSomethingRouter.patch('/admin/bookings/:id/status', authenticate, adminUpdateStatus);
