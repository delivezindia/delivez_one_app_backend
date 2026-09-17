// luggage-delivery.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  getLuggageDeliveryOptionsHandler,
  getLuggageDeliveryQuoteHandler,
  createLuggageDeliveryBookingHandler,
  listLuggageDeliveryBookingsHandler,
  getLuggageDeliveryBookingDetailsHandler,
  getLuggageDeliveryTrackingHandler,
  verifyLuggageDeliveryOtpHandler,
  submitLuggageDeliveryPodHandler,
  advanceLuggageDeliveryMilestoneHandler,
  cancelLuggageDeliveryBookingHandler,
  processLuggageDeliverySandboxPaymentHandler,
} from './luggage-delivery.controller.js';

export const luggageDeliveryRouter = Router();

// Public / discovery endpoints
luggageDeliveryRouter.get('/options', getLuggageDeliveryOptionsHandler);
luggageDeliveryRouter.post('/quote', getLuggageDeliveryQuoteHandler);
luggageDeliveryRouter.get('/tracking/:trackingId', getLuggageDeliveryTrackingHandler);
luggageDeliveryRouter.get('/track/:trackingId', getLuggageDeliveryTrackingHandler);

// Authenticated booking endpoints
luggageDeliveryRouter.post('/bookings', authenticate, requireUser, createLuggageDeliveryBookingHandler);
luggageDeliveryRouter.get('/bookings', authenticate, requireUser, listLuggageDeliveryBookingsHandler);
luggageDeliveryRouter.get('/bookings/:id', authenticate, requireUser, getLuggageDeliveryBookingDetailsHandler);
luggageDeliveryRouter.post('/bookings/:id/verify-otp', verifyLuggageDeliveryOtpHandler);
luggageDeliveryRouter.post('/bookings/:id/pod', submitLuggageDeliveryPodHandler);
luggageDeliveryRouter.post('/bookings/:id/advance-milestone', advanceLuggageDeliveryMilestoneHandler);
luggageDeliveryRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelLuggageDeliveryBookingHandler);
luggageDeliveryRouter.post('/bookings/:id/pay', processLuggageDeliverySandboxPaymentHandler);
luggageDeliveryRouter.post('/bookings/:id/payments/sandbox', processLuggageDeliverySandboxPaymentHandler);

// Top level aliases
luggageDeliveryRouter.get('/:id', getLuggageDeliveryBookingDetailsHandler);
