import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  addBookingDocument,
  adminUpdateStatus,
  cancelBooking,
  completeSandboxPayment,
  createBooking,
  deleteBookingDocument,
  getBooking,
  getBookingInvoice,
  getOptions,
  getQuote,
  listBookingDocuments,
  listBookings,
  rescheduleBooking,
  serveDocumentFile,
  submitFeedback,
  trackBooking,
  uploadDocument,
  verifyOtp,
} from './return-pickup.controller.js';
import { uploadReturnDocument } from './return-pickup-upload.middleware.js';

export const returnPickupRouter = Router();

// Configuration & Quote calculation
returnPickupRouter.get('/options', getOptions);
returnPickupRouter.post('/quote', getQuote);

// Standalone Document Upload & Binary File Serving (public & authenticated)
returnPickupRouter.post('/upload', uploadReturnDocument, uploadDocument);
returnPickupRouter.post('/documents/upload', uploadReturnDocument, uploadDocument);
returnPickupRouter.post('/files/upload', uploadReturnDocument, uploadDocument);
returnPickupRouter.get('/documents/:docId', serveDocumentFile);
returnPickupRouter.get('/documents/:docId/file', serveDocumentFile);
returnPickupRouter.get('/files/:fileId', serveDocumentFile);

// Tracking (open access by bookingNumber or ID)
returnPickupRouter.get('/track/:identifier', trackBooking);
returnPickupRouter.get('/tracking/:identifier', trackBooking);

// OTP Verification (open or authenticated)
returnPickupRouter.post('/:id/verify-otp', verifyOtp);
returnPickupRouter.post('/track/:id/verify-otp', verifyOtp);
returnPickupRouter.post('/bookings/:id/verify-otp', verifyOtp);

// Status simulation & admin update
returnPickupRouter.patch('/track/:id/status', adminUpdateStatus);
returnPickupRouter.patch('/bookings/:id/status', authenticate, adminUpdateStatus);
returnPickupRouter.patch('/admin/bookings/:id/status', authenticate, adminUpdateStatus);
returnPickupRouter.patch('/:id/status', authenticate, adminUpdateStatus);
returnPickupRouter.post('/:id/status', authenticate, adminUpdateStatus);

// User-Authenticated booking endpoints (supports both JSON and multipart form-data)
returnPickupRouter.post('/', authenticate, requireUser, uploadReturnDocument, createBooking);
returnPickupRouter.post(
  '/bookings',
  authenticate,
  requireUser,
  uploadReturnDocument,
  createBooking,
);
returnPickupRouter.get('/', authenticate, requireUser, listBookings);
returnPickupRouter.get('/bookings', authenticate, requireUser, listBookings);

// Booking document management
returnPickupRouter.post(
  '/:id/documents',
  authenticate,
  requireUser,
  uploadReturnDocument,
  addBookingDocument,
);
returnPickupRouter.post(
  '/bookings/:id/documents',
  authenticate,
  requireUser,
  uploadReturnDocument,
  addBookingDocument,
);
returnPickupRouter.get('/:id/documents', authenticate, requireUser, listBookingDocuments);
returnPickupRouter.get('/bookings/:id/documents', authenticate, requireUser, listBookingDocuments);
returnPickupRouter.delete(
  '/:id/documents/:docId',
  authenticate,
  requireUser,
  deleteBookingDocument,
);
returnPickupRouter.delete(
  '/bookings/:id/documents/:docId',
  authenticate,
  requireUser,
  deleteBookingDocument,
);

// Booking operations (Reschedule, Invoice, Cancel, Feedback, Payment)
returnPickupRouter.post('/:id/reschedule', authenticate, requireUser, rescheduleBooking);
returnPickupRouter.post('/bookings/:id/reschedule', authenticate, requireUser, rescheduleBooking);
returnPickupRouter.patch('/:id/reschedule', authenticate, requireUser, rescheduleBooking);
returnPickupRouter.patch('/bookings/:id/reschedule', authenticate, requireUser, rescheduleBooking);

returnPickupRouter.get('/:id/invoice', authenticate, requireUser, getBookingInvoice);
returnPickupRouter.get('/bookings/:id/invoice', authenticate, requireUser, getBookingInvoice);
returnPickupRouter.get('/:id/receipt', authenticate, requireUser, getBookingInvoice);
returnPickupRouter.get('/bookings/:id/receipt', authenticate, requireUser, getBookingInvoice);

returnPickupRouter.get('/bookings/:id', authenticate, requireUser, getBooking);
returnPickupRouter.get('/:id', authenticate, requireUser, getBooking);

returnPickupRouter.post('/:id/cancel', authenticate, requireUser, cancelBooking);
returnPickupRouter.post('/bookings/:id/cancel', authenticate, requireUser, cancelBooking);
returnPickupRouter.patch('/bookings/:id/cancel', authenticate, requireUser, cancelBooking);

returnPickupRouter.post('/:id/feedback', authenticate, requireUser, submitFeedback);
returnPickupRouter.post('/bookings/:id/feedback', authenticate, requireUser, submitFeedback);

returnPickupRouter.post('/:id/payments/sandbox', authenticate, requireUser, completeSandboxPayment);
returnPickupRouter.post(
  '/bookings/:id/payments/sandbox',
  authenticate,
  requireUser,
  completeSandboxPayment,
);
returnPickupRouter.post(
  '/:id/payments/sandbox-complete',
  authenticate,
  requireUser,
  completeSandboxPayment,
);
returnPickupRouter.post(
  '/bookings/:id/payments/sandbox-complete',
  authenticate,
  requireUser,
  completeSandboxPayment,
);
