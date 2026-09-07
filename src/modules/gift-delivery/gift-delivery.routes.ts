import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  adminUpdateStatus,
  cancelBooking,
  completeSandboxPayment,
  createBooking,
  getBooking,
  getCardPhoto,
  getCategoryPhoto,
  getInvoice,
  getOptions,
  getProductPhoto,
  getQuote,
  listBookings,
  rescheduleBooking,
  submitFeedback,
  trackBooking,
  verifyOtp,
} from './gift-delivery.controller.js';

export const giftDeliveryRouter = Router();

// Configuration & Quote calculation (Public)
giftDeliveryRouter.get('/options', getOptions);
giftDeliveryRouter.post('/quote', getQuote);

// Dynamic Image Serving (Public)
giftDeliveryRouter.get('/categories/:id/image', getCategoryPhoto);
giftDeliveryRouter.get('/products/:id/image', getProductPhoto);
giftDeliveryRouter.get('/cards/:id/image', getCardPhoto);


// Tracking (Open access by bookingNumber or ID)
giftDeliveryRouter.get('/track/:identifier', trackBooking);
giftDeliveryRouter.get('/tracking/:identifier', trackBooking);

// OTP Verification (Open or authenticated)
giftDeliveryRouter.post('/:id/verify-otp', verifyOtp);
giftDeliveryRouter.post('/track/:id/verify-otp', verifyOtp);
giftDeliveryRouter.post('/bookings/:id/verify-otp', verifyOtp);

// Status simulation & admin update
giftDeliveryRouter.patch('/track/:id/status', adminUpdateStatus);
giftDeliveryRouter.patch('/bookings/:id/status', authenticate, adminUpdateStatus);
giftDeliveryRouter.patch('/admin/bookings/:id/status', authenticate, adminUpdateStatus);
giftDeliveryRouter.patch('/:id/status', authenticate, adminUpdateStatus);
giftDeliveryRouter.post('/:id/status', authenticate, adminUpdateStatus);

// User-Authenticated booking endpoints
giftDeliveryRouter.post('/', authenticate, requireUser, createBooking);
giftDeliveryRouter.post('/bookings', authenticate, requireUser, createBooking);
giftDeliveryRouter.get('/', authenticate, requireUser, listBookings);
giftDeliveryRouter.get('/bookings', authenticate, requireUser, listBookings);

// Booking details, reschedule, invoice, cancel, feedback, payments
giftDeliveryRouter.get('/bookings/:id', authenticate, requireUser, getBooking);
giftDeliveryRouter.get('/:id', authenticate, requireUser, getBooking);

giftDeliveryRouter.post('/:id/reschedule', authenticate, requireUser, rescheduleBooking);
giftDeliveryRouter.post('/bookings/:id/reschedule', authenticate, requireUser, rescheduleBooking);
giftDeliveryRouter.patch('/:id/reschedule', authenticate, requireUser, rescheduleBooking);
giftDeliveryRouter.patch('/bookings/:id/reschedule', authenticate, requireUser, rescheduleBooking);

giftDeliveryRouter.get('/:id/invoice', authenticate, requireUser, getInvoice);
giftDeliveryRouter.get('/bookings/:id/invoice', authenticate, requireUser, getInvoice);
giftDeliveryRouter.get('/:id/receipt', authenticate, requireUser, getInvoice);
giftDeliveryRouter.get('/bookings/:id/receipt', authenticate, requireUser, getInvoice);

giftDeliveryRouter.post('/:id/cancel', authenticate, requireUser, cancelBooking);
giftDeliveryRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelBooking);
giftDeliveryRouter.patch('/bookings/:id/cancel', authenticate, requireUser, cancelBooking);

giftDeliveryRouter.post('/:id/feedback', authenticate, requireUser, submitFeedback);
giftDeliveryRouter.post('/bookings/:id/feedback', authenticate, requireUser, submitFeedback);

giftDeliveryRouter.post('/:id/payments/sandbox', authenticate, requireUser, completeSandboxPayment);
giftDeliveryRouter.post('/bookings/:id/payments/sandbox', authenticate, requireUser, completeSandboxPayment);
giftDeliveryRouter.post('/:id/payments/sandbox-complete', authenticate, requireUser, completeSandboxPayment);
giftDeliveryRouter.post('/bookings/:id/payments/sandbox-complete', authenticate, requireUser, completeSandboxPayment);
