import { Router } from 'express';

import { authenticate } from '../../middleware/auth.middleware.js';
import { courierMutationRateLimit } from '../../middleware/courier-rate-limit.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  cancelBooking,
  completeSandboxPayment,
  createBooking,
  createQuote,
  getBooking,
  getOptions,
  listBookings,
  updateBooking,
  getBookingTracking,
  getBookingPod,
} from './personal-courier.controller.js';

export const personalCourierRouter = Router();

// Public routes (options, universal tracking, public POD)
personalCourierRouter.get('/options', getOptions);
personalCourierRouter.get('/bookings/:id/track', getBookingTracking);
personalCourierRouter.get('/track/:id', getBookingTracking);
personalCourierRouter.get('/:id/track', getBookingTracking);
personalCourierRouter.get('/pod/:id', getBookingPod);
personalCourierRouter.get('/bookings/:id/pod', getBookingPod);

// Protected routes requiring authentication
personalCourierRouter.use(authenticate, requireUser);
personalCourierRouter.post('/quote', courierMutationRateLimit, createQuote);
personalCourierRouter.post('/bookings', courierMutationRateLimit, createBooking);
personalCourierRouter.post(
  '/bookings/:id/payments/sandbox',
  courierMutationRateLimit,
  completeSandboxPayment,
);
personalCourierRouter.get('/bookings', listBookings);
personalCourierRouter.get('/bookings/:id', getBooking);
personalCourierRouter.patch('/bookings/:id', updateBooking);
personalCourierRouter.post(
  '/bookings/:id/cancel',
  courierMutationRateLimit,
  cancelBooking,
);
