// luggage-delivery.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  getLuggageDeliveryOptionsHandler,
  getLuggageDeliveryQuoteHandler,
  validateCouponHandler,
  createLuggageDeliveryBookingHandler,
  listLuggageDeliveryBookingsHandler,
  getLuggageDeliveryBookingDetailsHandler,
  getLuggageDeliveryReceiptHandler,
  getLuggageDeliveryPaymentHandler,
  getLuggageDeliveryTrackingHandler,
  createLuggagePaymentHandler,
  verifyLuggagePaymentHandler,
  verifyLuggageDeliveryOtpHandler,
  submitLuggageDeliveryPodHandler,
  advanceLuggageDeliveryMilestoneHandler,
  cancelLuggageDeliveryBookingHandler,
  processLuggageDeliverySandboxPaymentHandler,
} from './luggage-delivery.controller.js';

export const luggageDeliveryRouter = Router();

// 1. Discovery, Quote & Coupon endpoints
luggageDeliveryRouter.get('/options', getLuggageDeliveryOptionsHandler);
luggageDeliveryRouter.post('/quote', getLuggageDeliveryQuoteHandler);
luggageDeliveryRouter.post('/bookings/quote', getLuggageDeliveryQuoteHandler);
luggageDeliveryRouter.post('/validate-coupon', validateCouponHandler);
luggageDeliveryRouter.post('/bookings/validate-coupon', validateCouponHandler);

// 2. Tracking endpoints
luggageDeliveryRouter.get('/tracking/:trackingId', getLuggageDeliveryTrackingHandler);
luggageDeliveryRouter.get('/track/:trackingId', getLuggageDeliveryTrackingHandler);

// 3. Authenticated Booking lifecycle endpoints
luggageDeliveryRouter.post('/bookings', authenticate, requireUser, createLuggageDeliveryBookingHandler);
luggageDeliveryRouter.get('/bookings', authenticate, requireUser, listLuggageDeliveryBookingsHandler);
luggageDeliveryRouter.get('/bookings/:id', authenticate, requireUser, getLuggageDeliveryBookingDetailsHandler);
luggageDeliveryRouter.get('/bookings/:id/receipt', authenticate, requireUser, getLuggageDeliveryReceiptHandler);
luggageDeliveryRouter.get('/bookings/:id/payment', authenticate, requireUser, getLuggageDeliveryPaymentHandler);
luggageDeliveryRouter.get('/bookings/:id/tracking', getLuggageDeliveryTrackingHandler);
luggageDeliveryRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelLuggageDeliveryBookingHandler);

// 4. Payment endpoints (Production gateway create/verify & sandbox)
luggageDeliveryRouter.post('/payments/create', authenticate, requireUser, createLuggagePaymentHandler);
luggageDeliveryRouter.post('/payments/verify', authenticate, requireUser, verifyLuggagePaymentHandler);
luggageDeliveryRouter.post('/bookings/:id/payments/create', authenticate, requireUser, createLuggagePaymentHandler);
luggageDeliveryRouter.post('/bookings/:id/payments/verify', authenticate, requireUser, verifyLuggagePaymentHandler);
luggageDeliveryRouter.post('/bookings/:id/pay', processLuggageDeliverySandboxPaymentHandler);
luggageDeliveryRouter.post('/bookings/:id/payments/sandbox', processLuggageDeliverySandboxPaymentHandler);

// 5. Delivery milestone, OTP, and POD endpoints
luggageDeliveryRouter.post('/bookings/:id/verify-otp', verifyLuggageDeliveryOtpHandler);
luggageDeliveryRouter.post('/bookings/:id/pod', submitLuggageDeliveryPodHandler);
luggageDeliveryRouter.post('/bookings/:id/advance-milestone', advanceLuggageDeliveryMilestoneHandler);

// 6. Top level aliases
luggageDeliveryRouter.get('/:id', getLuggageDeliveryBookingDetailsHandler);
luggageDeliveryRouter.get('/:id/receipt', getLuggageDeliveryReceiptHandler);
