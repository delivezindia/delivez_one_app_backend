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
} from './confidential-courier.controller.js';

export const confidentialCourierRouter = Router();

confidentialCourierRouter.get('/options', getOptions);

confidentialCourierRouter.use(authenticate, requireUser);
confidentialCourierRouter.post('/quote', courierMutationRateLimit, createQuote);
confidentialCourierRouter.post('/bookings', courierMutationRateLimit, createBooking);
confidentialCourierRouter.post(
  '/bookings/:id/payments/sandbox',
  courierMutationRateLimit,
  completeSandboxPayment,
);
confidentialCourierRouter.get('/bookings', listBookings);
confidentialCourierRouter.get('/bookings/:id', getBooking);
confidentialCourierRouter.post(
  '/bookings/:id/cancel',
  courierMutationRateLimit,
  cancelBooking,
);
