// luggage-delivery.controller.ts
import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import {
  getLuggageOptions,
  luggageTimelineMilestones,
  luggageServices,
} from './luggage-delivery-config.js';
import type { LuggageServiceItem } from './luggage-delivery-config.js';
import { calculateLuggageQuote } from './luggage-delivery-pricing.js';

// Format: DLVZ + 10 digits (e.g. DLVZ2505128947 as in Flutter Dart source)
export const makeLuggageBookingNumber = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DLVZ${yy}${mm}${dd}${rand}`;
};

export const getLuggageDeliveryOptionsHandler: RequestHandler = (_req, res) => {
  res.status(200).json({
    data: getLuggageOptions(),
  });
};

export const getLuggageDeliveryQuoteHandler: RequestHandler = (req, res) => {
  const quote = calculateLuggageQuote(req.body || {});
  res.status(200).json({
    data: {
      quote,
    },
  });
};

export const createLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required to create luggage booking');
  }

  const idempotencyKey =
    (req.headers['idempotency-key'] as string) ||
    req.body.idempotencyKey ||
    randomBytes(16).toString('hex');

  // Check for existing booking with this idempotency key
  const existing = await prisma.luggageDeliveryBooking.findUnique({
    where: {
      userId_idempotencyKey: {
        userId,
        idempotencyKey,
      },
    },
  });

  if (existing) {
    res.status(200).json({
      data: {
        booking: existing,
        isIdempotentReplay: true,
      },
    });
    return;
  }

  const body = req.body || {};
  const serviceId = body.serviceId || 'home_airport';
  const routeType = body.routeType || 'single_trip';

  // Calculate confirmed quote
  const quote = calculateLuggageQuote({
    serviceId,
    routeType,
    luggageItems: body.luggageItems,
    selectedAddOns: body.selectedAddOns || body.addOns,
    selectedProtections: body.selectedProtections || body.protections,
    selectedAirportAssistance: body.selectedAirportAssistance || body.airportAssistance,
    deliverySpeed: body.schedule?.deliverySpeed || body.deliverySpeed,
    distanceKm: body.distanceKm,
  });

  const bookingNumber = makeLuggageBookingNumber();
  const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  const now = new Date();

  // Initialize the 10 journey timeline milestones from Dart source
  const milestones = luggageTimelineMilestones.map((m, idx) => ({
    step: m.step,
    id: m.id,
    title: m.title,
    subtitle: m.subtitle,
    status: idx === 0 ? 'COMPLETED' : idx === 1 ? 'IN_PROGRESS' : 'PENDING',
    timestamp: idx === 0 ? now.toISOString() : null,
    location: idx === 0 ? (body.pickupDetails?.city || 'Origin City') : null,
    note: idx === 0 ? 'Booking confirmed. Pickup executive assigned.' : null,
  }));

  const driverDetails = {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    vehicleNumber: 'DL-01-AB-1234',
    rating: 4.9,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop',
    assignedAt: now.toISOString(),
  };

  const booking = await prisma.luggageDeliveryBooking.create({
    data: {
      bookingNumber,
      userId,
      serviceId,
      routeType,
      status: 'BOOKING_CONFIRMED',
      idempotencyKey,
      pickupDetails: body.pickupDetails || {
        addressLine: '123 Aerocity Enclave',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110037',
        contactName: 'Passenger',
        contactPhone: '+91 9876543210',
      },
      deliveryDetails: body.deliveryDetails || {
        addressLine: 'IGI Airport Terminal 3 Departure Pillar 4',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110037',
        contactName: 'Passenger',
        contactPhone: '+91 9876543210',
      },
      hotelDetails: body.hotelDetails || null,
      flightDetails: body.flightDetails || null,
      multiStops: body.multiStops || null,
      luggageItems: body.luggageItems || [
        { type: 'SUITCASE_TROLLEY', size: 'medium', quantity: 1, weightKg: 15 },
      ],
      protections: body.selectedProtections || body.protections || [],
      addOns: body.selectedAddOns || body.addOns || [],
      airportAssistance: body.selectedAirportAssistance || body.airportAssistance || [],
      schedule: body.schedule || {
        pickupDate: now.toISOString().split('T')[0],
        pickupTimeSlot: '10:00 AM - 12:00 PM',
        deliverySpeed: 'STANDARD',
      },
      gstInvoice: body.gstInvoice || null,
      pricingBreakdown: quote as any,
      totalAmount: quote.totalAmount,
      paymentMethod: (body.paymentMethod || 'WALLET').toUpperCase(),
      paymentStatus: (body.paymentMethod || '').toUpperCase() === 'WALLET' ? 'PAID' : 'PENDING',
      pickupOtp,
      deliveryOtp,
      currentMilestoneIndex: 0,
      milestones: milestones as any,
      driverDetails: driverDetails as any,
    },
  });

  res.status(201).json({
    data: {
      booking,
    },
  });
};

export const listLuggageDeliveryBookingsHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required');
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [total, bookings] = await Promise.all([
    prisma.luggageDeliveryBooking.count({ where: { userId } }),
    prisma.luggageDeliveryBooking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  res.status(200).json({
    data: {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

export const getLuggageDeliveryBookingDetailsHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const userId = req.user?.id;

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
      ...(req.user?.role !== 'ADMIN' && userId ? { userId } : {}),
    },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  res.status(200).json({
    data: {
      booking,
    },
  });
};

export const getLuggageDeliveryTrackingHandler: RequestHandler = async (req, res) => {
  const trackingId = String(req.params.trackingId);

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id: trackingId }, { bookingNumber: trackingId }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery shipment not found');
  }

  // Build real-time tracking payload matching Dart live_tracking.dart & jurney_timeline.dart
  const defaultService: LuggageServiceItem = luggageServices[0]!;
  const service = luggageServices.find((s) => s.id === booking.serviceId) ?? defaultService;
  const pickup = (booking.pickupDetails as Record<string, any>) || {};
  const delivery = (booking.deliveryDetails as Record<string, any>) || {};

  const trackingPayload = {
    bookingId: booking.bookingNumber,
    status: booking.status,
    serviceTitle: service.title,
    currentMilestoneIndex: booking.currentMilestoneIndex,
    milestones: booking.milestones,
    pickupOtp: booking.pickupOtp,
    deliveryOtp: booking.deliveryOtp,
    driver: booking.driverDetails,
    pickupLocation: {
      title: pickup?.addressLine || pickup?.hotelName || pickup?.airportName || 'Pickup Location',
      city: pickup?.city || 'City',
      contactName: pickup?.contactName || pickup?.guestName || 'Contact Person',
      phone: pickup?.contactPhone || pickup?.mobile || '+91 9876543210',
    },
    deliveryLocation: {
      title: delivery?.addressLine || delivery?.hotelName || delivery?.airportName || 'Delivery Location',
      city: delivery?.city || 'City',
      contactName: delivery?.contactName || delivery?.passengerName || 'Recipient',
      phone: delivery?.contactPhone || delivery?.mobile || '+91 9876543210',
    },
    bagCount: Array.isArray(booking.luggageItems)
      ? (booking.luggageItems as any[]).reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
      : 1,
    schedule: booking.schedule,
    podData: booking.podData,
    estimatedDeliveryTime: 'Within 2 hours',
  };

  res.status(200).json({
    data: {
      tracking: trackingPayload,
      booking,
    },
  });
};

export const verifyLuggageDeliveryOtpHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { otp, type } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  const expectedOtp = type === 'pickup' ? booking.pickupOtp : booking.deliveryOtp;
  if (!otp || String(otp).trim() !== String(expectedOtp).trim()) {
    throw new AppError(400, 'Invalid OTP code entered. Please verify and try again.');
  }

  res.status(200).json({
    data: {
      success: true,
      message: `${type === 'pickup' ? 'Pickup' : 'Delivery'} OTP verified successfully.`,
    },
  });
};

export const submitLuggageDeliveryPodHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { receiverName, receiverRelation, otp, signatureUrl, photos, sealIntact } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  if (otp && String(otp).trim() !== String(booking.deliveryOtp).trim()) {
    throw new AppError(400, 'Invalid Delivery OTP for POD verification');
  }

  const now = new Date();
  const podData = {
    receiverName: receiverName || 'Self',
    receiverRelation: receiverRelation || 'Recipient',
    otpVerified: true,
    signatureUrl: signatureUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiPjxwYXRoIGQ9Ik0xMCAzMCBRIDMwIDEwLCA1MCAyNSBVIDcwIDgsIDkwIDI4IiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
    photos: Array.isArray(photos) ? photos : [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop',
    ],
    sealIntact: sealIntact !== false,
    deliveredAt: now.toISOString(),
  };

  // Update all milestones to COMPLETED
  const updatedMilestones = (booking.milestones as any[]).map((m: any) => ({
    ...m,
    status: 'COMPLETED',
    timestamp: m.timestamp || now.toISOString(),
  }));

  const updatedBooking = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      status: 'DELIVERED',
      currentMilestoneIndex: 9,
      milestones: updatedMilestones as any,
      podData: podData as any,
    },
  });

  res.status(200).json({
    data: {
      success: true,
      message: 'Proof of Delivery (POD) recorded successfully.',
      booking: updatedBooking,
    },
  });
};

export const advanceLuggageDeliveryMilestoneHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { targetIndex } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  const currentIndex = booking.currentMilestoneIndex;
  const nextIndex = typeof targetIndex === 'number' ? targetIndex : Math.min(9, currentIndex + 1);

  const now = new Date();
  const milestones = (booking.milestones as any[]).map((m: any, idx: number) => {
    if (idx < nextIndex) {
      return { ...m, status: 'COMPLETED', timestamp: m.timestamp || now.toISOString() };
    }
    if (idx === nextIndex) {
      return { ...m, status: nextIndex === 9 ? 'COMPLETED' : 'IN_PROGRESS', timestamp: now.toISOString() };
    }
    return { ...m, status: 'PENDING' };
  });

  const newStatus =
    nextIndex >= 9
      ? 'DELIVERED'
      : nextIndex >= 5
      ? 'IN_TRANSIT'
      : nextIndex >= 1
      ? 'PICKUP_ASSIGNED'
      : 'BOOKING_CONFIRMED';

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      currentMilestoneIndex: nextIndex,
      status: newStatus,
      milestones: milestones as any,
    },
  });

  res.status(200).json({
    data: {
      booking: updated,
    },
  });
};

export const cancelLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { reason } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  if (booking.status === 'DELIVERED') {
    throw new AppError(400, 'Cannot cancel a delivered luggage booking');
  }

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason || 'Cancelled by user',
      cancelledAt: new Date(),
    },
  });

  res.status(200).json({
    data: {
      booking: updated,
      message: 'Luggage booking cancelled successfully.',
    },
  });
};

export const processLuggageDeliverySandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { method = 'WALLET', outcome = 'SUCCESS' } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage booking not found');
  }

  const totalAmount = Number(booking.totalAmount);
  const paymentValidation = validateSandboxPayment({
    method,
    outcome,
  });

  if (paymentValidation.outcome !== 'SUCCESS') {
    await prisma.luggageDeliveryBooking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'FAILED',
      },
    });
    throw new AppError(402, 'Sandbox payment failed');
  }

  const paymentReference = makeSandboxPaymentReference('SUCCESS');

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
      paymentMethod: paymentValidation.method,
      paymentReference,
    },
  });

  res.status(200).json({
    data: {
      success: true,
      booking: updated,
      payment: {
        provider: SANDBOX_PAYMENT_PROVIDER,
        reference: paymentReference,
        status: 'PAID',
        amount: totalAmount,
        paidAt: new Date().toISOString(),
      },
    },
  });
};
