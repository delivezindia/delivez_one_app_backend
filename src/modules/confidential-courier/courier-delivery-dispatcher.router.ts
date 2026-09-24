import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import { personalCourierRouter } from '../personal-courier/personal-courier.routes.js';
import { getOptions, getLottieIconHandler } from '../personal-courier/personal-courier.controller.js';
import { CANONICAL_SERVICES } from './vault-courier.validation.js';
import { prisma } from '../../lib/prisma.js';
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

export const courierDeliveryDispatcherRouter = Router();


// ==========================================
// 0. COURIER DELIVERY OPTIONS & LOTTIE (PUBLIC)
// ==========================================
courierDeliveryDispatcherRouter.get('/options', getOptions);
courierDeliveryDispatcherRouter.get('/delivery-config', getOptions);
courierDeliveryDispatcherRouter.get('/config', getOptions);
courierDeliveryDispatcherRouter.get('/lottie/:iconName', getLottieIconHandler);

// ==========================================
// 0. CANONICAL TEMPLATE & SERVICES ENDPOINTS
// ==========================================
courierDeliveryDispatcherRouter.get('/services/canonical-template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/canonical-template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/template', getCanonicalTemplateHandler);
courierDeliveryDispatcherRouter.get('/services', getCanonicalServicesHandler);

// ==========================================
// 1. DIRECT PAYMENT ENDPOINTS
// ==========================================
courierDeliveryDispatcherRouter.post('/payments', authenticate, requireUser, createPaymentHandler);
courierDeliveryDispatcherRouter.get('/payments/:id', authenticate, requireUser, getPaymentByIdHandler);
courierDeliveryDispatcherRouter.post('/payments/:id/verify', authenticate, requireUser, verifyPaymentHandler);
courierDeliveryDispatcherRouter.post('/payments/:id/refund', authenticate, requireUser, refundPaymentHandler);
courierDeliveryDispatcherRouter.get('/bookings/:bookingId/payment', authenticate, requireUser, getBookingPaymentHandler);

// ==========================================
// 2. DIRECT RECEIPT ENDPOINTS
// ==========================================
courierDeliveryDispatcherRouter.post('/receipts', authenticate, requireUser, createReceiptHandler);
courierDeliveryDispatcherRouter.get('/receipts', authenticate, requireUser, listReceiptsHandler);
courierDeliveryDispatcherRouter.get('/receipts/:id', authenticate, requireUser, getReceiptByIdHandler);
courierDeliveryDispatcherRouter.get('/bookings/:bookingId/receipt', authenticate, requireUser, getBookingReceiptHandler);

// ==========================================
// 3. BOOKING CREATION (POST /bookings)
// ==========================================
courierDeliveryDispatcherRouter.post('/bookings', (req, res, next) => {
  const rawType = req.body?.service_selection?.service_type || req.body?.service_type || req.body?.serviceType;
  const isVault =
    Boolean(req.body?.service_selection) ||
    Boolean(req.body?.package_details?.packaging) ||
    (typeof rawType === 'string' && (CANONICAL_SERVICES.includes(rawType as any) || rawType.toLowerCase().includes('vault')));

  if (isVault) {
    return authenticate(req, res, (err) => {
      if (err) return next(err);
      return requireUser(req, res, () => createVaultBookingHandler(req, res, next));
    });
  }
  return personalCourierRouter(req, res, next);
});

// ==========================================
// 4. BOOKINGS BY ID (GET, PUT, PATCH, DELETE)
// ==========================================
courierDeliveryDispatcherRouter.all('/bookings/:id', async (req, res, next) => {
  const id = String(req.params.id || '');
  let isVault = id.startsWith('CV-') || id.startsWith('DV-');
  if (!isVault) {
    try {
      const exists = await prisma.vaultCourierBooking.findFirst({
        where: { OR: [{ id }, { bookingNumber: id }] },
        select: { id: true },
      });
      if (exists) isVault = true;
    } catch {}
  }

  if (isVault) {
    return authenticate(req, res, (err) => {
      if (err) return next(err);
      return requireUser(req, res, () => {
        if (req.method === 'GET') return getVaultBookingByIdHandler(req, res, next);
        if (req.method === 'PUT') return updateVaultBookingHandler(req, res, next);
        if (req.method === 'PATCH') return patchVaultBookingHandler(req, res, next);
        if (req.method === 'DELETE') return deleteVaultBookingHandler(req, res, next);
        return next();
      });
    });
  }

  return personalCourierRouter(req, res, next);
});

// ==========================================
// 5. LIST BOOKINGS (GET /bookings)
// ==========================================
courierDeliveryDispatcherRouter.get('/bookings', async (req, res, next) => {
  const serviceType = req.query?.service_type || req.query?.serviceType;
  if (
    serviceType &&
    (CANONICAL_SERVICES.includes(serviceType as any) ||
      String(serviceType).toLowerCase().includes('vault'))
  ) {
    return authenticate(req, res, (err) => {
      if (err) return next(err);
      return requireUser(req, res, () => getVaultBookingsHandler(req, res, next));
    });
  }
  return authenticate(req, res, (err) => {
    if (err) return personalCourierRouter(req, res, next);
    return requireUser(req, res, (err2) => {
      if (err2) return personalCourierRouter(req, res, next);
      return getVaultBookingsHandler(req, res, (err3) => {
        if (err3) return next(err3);
        return personalCourierRouter(req, res, next);
      });
    });
  });
});

// ==========================================
// 6. FALLBACK TO PERSONAL COURIER
// ==========================================
courierDeliveryDispatcherRouter.use(personalCourierRouter);
