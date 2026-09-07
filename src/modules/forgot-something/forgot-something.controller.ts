import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { Prisma, type ForgotSomethingStatus } from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import { getForgotSomethingOptions } from './forgot-something-config.js';
import { calculateForgotSomethingQuote } from './forgot-something-pricing.js';
import {
  validateForgotSomethingRequest,
  validateIdempotencyKey,
} from './forgot-something.validation.js';

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

// Format: DZ + 8 digits (e.g. DZ12345678 as shown on mobile screens)
const makeBookingNumber = (): string => {
  const digits = Math.floor(10000000 + Math.random() * 90000000);
  return `DZ${digits}`;
};

const makeOtp = (): string => String(Math.floor(1000 + Math.random() * 9000));

const serializeBooking = (booking: any) => ({
  ...booking,
  declaredValue: booking.declaredValue === null ? null : Number(booking.declaredValue),
  retrievalFee: Number(booking.retrievalFee),
  deliveryFee: Number(booking.deliveryFee),
  secureHandlingFee: Number(booking.secureHandlingFee),
  taxAmount: Number(booking.taxAmount),
  totalAmount: Number(booking.totalAmount),
  pickupLatitude: booking.pickupLatitude === null ? null : Number(booking.pickupLatitude),
  pickupLongitude: booking.pickupLongitude === null ? null : Number(booking.pickupLongitude),
  dropoffLatitude: booking.dropoffLatitude === null ? null : Number(booking.dropoffLatitude),
  dropoffLongitude: booking.dropoffLongitude === null ? null : Number(booking.dropoffLongitude),
  partnerRating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
  pickup: {
    flatBuilding: booking.pickupFlatBuilding,
    street: booking.pickupStreet,
    area: booking.pickupArea,
    city: booking.pickupCity,
    state: booking.pickupState,
    postalCode: booking.pickupPostalCode,
    contactName: booking.pickupContactName,
    phoneNumber: booking.pickupPhoneNumber,
    landmark: booking.pickupLandmark,
    latitude: booking.pickupLatitude === null ? null : Number(booking.pickupLatitude),
    longitude: booking.pickupLongitude === null ? null : Number(booking.pickupLongitude),
  },
  dropoff: {
    addressType: booking.dropoffAddressType,
    addressLine1: booking.dropoffAddressLine1,
    addressLine2: booking.dropoffAddressLine2,
    area: booking.dropoffArea,
    city: booking.dropoffCity,
    state: booking.dropoffState,
    postalCode: booking.dropoffPostalCode,
    recipientName: booking.dropoffRecipientName,
    phoneNumber: booking.dropoffPhoneNumber,
    landmark: booking.dropoffLandmark,
    latitude: booking.dropoffLatitude === null ? null : Number(booking.dropoffLatitude),
    longitude: booking.dropoffLongitude === null ? null : Number(booking.dropoffLongitude),
  },
  partner: {
    name: booking.partnerName || 'Rajesh Kumar',
    phone: booking.partnerPhone || '+91 98765 43210',
    vehicle: booking.partnerVehicle || 'TVS Apache - KA 01 AB 1234',
    rating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
  },
});

export const getOptions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      ...getForgotSomethingOptions(),
      sandboxGateway: getSandboxGatewayOptions(),
    },
  });
};

export const getQuote: RequestHandler = (req, res) => {
  const quote = calculateForgotSomethingQuote(req.body ?? {});
  res.status(200).json({
    status: 'success',
    data: { quote },
  });
};

export const createBooking: RequestHandler = async (req, res) => {
  const idempotencyKey = validateIdempotencyKey(req.get('Idempotency-Key'));
  const input = validateForgotSomethingRequest(req.body);
  const requestFingerprint = fingerprint(input);
  const userId = req.user!.id;

  const existing = await prisma.forgotSomethingBooking.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    include: { service: true },
  });

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new AppError(409, 'This Idempotency-Key was already used for different booking details.');
    }
    res.status(200).json({
      status: 'success',
      data: { booking: serializeBooking(existing), idempotentReplay: true },
    });
    return;
  }

  const quote = calculateForgotSomethingQuote({
    speed: input.speed,
    tamperProofPackaging: input.tamperProofPackaging,
    itemQuantity: input.itemQuantity,
    declaredValue: input.declaredValue ?? undefined,
  });

  const fetchService = await prisma.service.findFirst({
    where: { slug: 'forgot-something', isActive: true },
    select: { id: true },
  });

  const isInstantConfirmation = input.paymentMethod === 'PAY_ON_DELIVERY' || input.paymentMethod === 'WALLET';
  const status: ForgotSomethingStatus = isInstantConfirmation ? 'CONFIRMED' : 'PAYMENT_PENDING';
  const paymentStatus = isInstantConfirmation ? (input.paymentMethod === 'WALLET' ? 'PAID' : 'NOT_REQUIRED') : 'PENDING';
  const confirmedAt = status === 'CONFIRMED' ? new Date() : null;

  const pickupOtp = makeOtp();
  const deliveryOtp = makeOtp();

  try {
    const booking = await prisma.forgotSomethingBooking.create({
      data: {
        bookingNumber: makeBookingNumber(),
        userId,
        serviceId: fetchService?.id ?? null,
        idempotencyKey,
        requestFingerprint,
        status,
        itemCategory: input.itemCategory,
        itemName: input.itemName,
        itemDescription: input.itemDescription || null,
        itemBrandColor: input.itemBrandColor || null,
        itemQuantity: input.itemQuantity,
        declaredValue: input.declaredValue ? new Prisma.Decimal(input.declaredValue) : null,
        itemTags: input.itemTags,
        itemPhotoUrl: input.itemPhotoUrl || null,
        itemPhotoData: input.itemPhotoData || null,
        locationType: input.locationType,
        handoverType: input.handoverType,
        handoverCustomName: input.handoverCustomName || null,
        handoverCustomPhone: input.handoverCustomPhone || null,

        pickupFlatBuilding: input.pickup.flatBuilding,
        pickupStreet: input.pickup.street,
        pickupArea: input.pickup.area || null,
        pickupCity: input.pickup.city,
        pickupState: input.pickup.state || 'Karnataka',
        pickupPostalCode: input.pickup.postalCode,
        pickupContactName: input.pickup.contactName,
        pickupPhoneNumber: input.pickup.phoneNumber,
        pickupLandmark: input.pickup.landmark || null,
        pickupLatitude: input.pickup.latitude !== null && input.pickup.latitude !== undefined ? new Prisma.Decimal(input.pickup.latitude) : null,
        pickupLongitude: input.pickup.longitude !== null && input.pickup.longitude !== undefined ? new Prisma.Decimal(input.pickup.longitude) : null,

        dropoffAddressType: input.dropoff.addressType || 'Home',
        dropoffAddressLine1: input.dropoff.addressLine1,
        dropoffAddressLine2: input.dropoff.addressLine2 || null,
        dropoffArea: input.dropoff.area || null,
        dropoffCity: input.dropoff.city,
        dropoffState: input.dropoff.state || 'Karnataka',
        dropoffPostalCode: input.dropoff.postalCode || '560001',
        dropoffRecipientName: input.dropoff.recipientName,
        dropoffPhoneNumber: input.dropoff.phoneNumber,
        dropoffLandmark: input.dropoff.landmark || null,
        dropoffLatitude: input.dropoff.latitude !== null && input.dropoff.latitude !== undefined ? new Prisma.Decimal(input.dropoff.latitude) : null,
        dropoffLongitude: input.dropoff.longitude !== null && input.dropoff.longitude !== undefined ? new Prisma.Decimal(input.dropoff.longitude) : null,

        speed: input.speed,
        scheduledDate: input.scheduledDate || null,
        scheduledTimeSlot: input.scheduledTimeSlot || null,

        pickupOtpRequired: input.pickupOtpRequired,
        deliveryOtpRequired: input.deliveryOtpRequired,
        photoAtPickup: input.photoAtPickup,
        photoAtDelivery: input.photoAtDelivery,
        tamperProofPackaging: input.tamperProofPackaging,
        receiverSignature: input.receiverSignature,
        callBeforeArrival: input.callBeforeArrival,
        pickupOtp,
        deliveryOtp,

        partnerName: 'Rajesh Kumar',
        partnerPhone: '+91 98765 43210',
        partnerVehicle: 'TVS Apache - KA 01 AB 1234',
        partnerRating: new Prisma.Decimal(4.9),

        currency: quote.currency,
        retrievalFee: new Prisma.Decimal(quote.retrievalFee),
        deliveryFee: new Prisma.Decimal(quote.deliveryFee),
        secureHandlingFee: new Prisma.Decimal(quote.secureHandlingFee),
        taxAmount: new Prisma.Decimal(quote.taxAmount),
        totalAmount: new Prisma.Decimal(quote.totalAmount),

        paymentMethod: input.paymentMethod,
        paymentStatus,
        paymentProvider: input.paymentMethod === 'WALLET' ? 'DELIVEZ_WALLET' : null,
        paymentReference: input.paymentMethod === 'WALLET' ? `WAL-${randomBytes(4).toString('hex').toUpperCase()}` : null,
        confirmedAt,
        partnerAssignedAt: status === 'CONFIRMED' ? new Date() : null,
      },
      include: { service: true },
    });

    res.status(201).json({
      status: 'success',
      data: { booking: serializeBooking(booking), idempotentReplay: false },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const replay = await prisma.forgotSomethingBooking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: { service: true },
      });
      if (replay?.requestFingerprint === requestFingerprint) {
        res.status(200).json({
          status: 'success',
          data: { booking: serializeBooking(replay), idempotentReplay: true },
        });
        return;
      }
    }
    throw error;
  }
};

export const listBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '10'), 10) || 10));
  const userId = req.user!.id;

  const [bookings, total] = await prisma.$transaction([
    prisma.forgotSomethingBooking.findMany({
      where: { userId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.forgotSomethingBooking.count({ where: { userId } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map(serializeBooking),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.forgotSomethingBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Forgot Something booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(booking) },
  });
};

export const trackBooking: RequestHandler = async (req, res) => {
  const identifier = String(req.params.identifier || req.params.id);

  const booking = await prisma.forgotSomethingBooking.findFirst({
    where: {
      OR: [{ id: identifier }, { bookingNumber: identifier }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Tracking details not found for this retrieval request.');
  }

  const milestones = [
    {
      key: 'ORDER_CONFIRMED',
      label: 'Order Confirmed',
      completed: true,
      timestamp: booking.confirmedAt || booking.createdAt,
    },
    {
      key: 'PARTNER_ASSIGNED',
      label: 'Partner Assigned',
      completed: ['PARTNER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(booking.status),
      timestamp: booking.partnerAssignedAt || (booking.confirmedAt ? new Date(booking.confirmedAt.getTime() + 60000) : null),
    },
    {
      key: 'PICKUP_IN_PROGRESS',
      label: 'Pickup in Progress',
      completed: ['PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(booking.status),
      timestamp: booking.pickedUpAt,
    },
    {
      key: 'ON_THE_WAY',
      label: 'On the Way',
      completed: ['IN_TRANSIT', 'DELIVERED'].includes(booking.status),
      timestamp: booking.inTransitAt,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      completed: booking.status === 'DELIVERED',
      timestamp: booking.deliveredAt,
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(booking),
      tracking: {
        bookingId: booking.bookingNumber,
        currentStatus: booking.status,
        milestones,
        eta: booking.status === 'DELIVERED' ? 'Delivered' : '15–20 min',
        serviceName: 'Instant Retrieval',
        partner: {
          name: booking.partnerName || 'Rajesh Kumar',
          phone: booking.partnerPhone || '+91 98765 43210',
          vehicle: booking.partnerVehicle || 'TVS Apache - KA 01 AB 1234',
          rating: 4.9,
        },
        pickupOtp: booking.pickupOtp,
        deliveryOtp: booking.deliveryOtp,
      },
    },
  });
};

export const verifyOtp: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.id);
  const { type, otp } = req.body ?? {};

  if (!type || !otp || (type !== 'PICKUP' && type !== 'DELIVERY')) {
    throw new AppError(400, 'Valid OTP type (PICKUP or DELIVERY) and code are required.');
  }

  const booking = await prisma.forgotSomethingBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!booking) throw new AppError(404, 'Booking not found.');

  if (type === 'PICKUP') {
    if (booking.pickupOtp !== String(otp).trim()) {
      throw new AppError(400, 'Invalid pickup verification OTP.');
    }
    const updated = await prisma.forgotSomethingBooking.update({
      where: { id: booking.id },
      data: {
        pickupOtpVerifiedAt: new Date(),
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'Pickup OTP verified successfully. Item is now picked up.',
      data: { booking: serializeBooking(updated) },
    });
    return;
  }

  if (type === 'DELIVERY') {
    if (booking.deliveryOtp !== String(otp).trim()) {
      throw new AppError(400, 'Invalid delivery verification OTP.');
    }
    const updated = await prisma.forgotSomethingBooking.update({
      where: { id: booking.id },
      data: {
        deliveryOtpVerifiedAt: new Date(),
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'Delivery OTP verified successfully. Item has been delivered safely.',
      data: { booking: serializeBooking(updated) },
    });
    return;
  }
};

export const cancelBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const cancellationReason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : 'Cancelled by customer';

  if (cancellationReason.length < 3 || cancellationReason.length > 250) {
    throw new AppError(400, 'Cancellation reason must be between 3 and 250 characters.');
  }

  const result = await prisma.forgotSomethingBooking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: { in: ['CONFIRMED', 'PAYMENT_PENDING', 'PARTNER_ASSIGNED'] },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason,
    },
  });

  if (result.count === 0) {
    const exists = await prisma.forgotSomethingBooking.findFirst({
      where: { id: bookingId, userId },
      select: { status: true },
    });
    if (!exists) throw new AppError(404, 'Forgot Something booking not found.');
    throw new AppError(409, `A retrieval request with status ${exists.status} cannot be cancelled.`);
  }

  const updated = await prisma.forgotSomethingBooking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(updated) },
  });
};

export const completeSandboxPayment: RequestHandler = async (req, res) => {
  const input = validateSandboxPayment(req.body);
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const existing = await prisma.forgotSomethingBooking.findFirst({
    where: { id: bookingId, userId },
    include: { service: true },
  });

  if (!existing) throw new AppError(404, 'Booking not found.');
  if (existing.status === 'CANCELLED') {
    throw new AppError(409, 'A cancelled booking cannot be paid.');
  }
  if (existing.paymentStatus === 'PAID') {
    res.status(200).json({
      status: 'success',
      data: {
        booking: serializeBooking(existing),
        payment: {
          provider: SANDBOX_PAYMENT_PROVIDER,
          sandbox: true,
          outcome: 'SUCCESS',
          idempotentReplay: true,
        },
      },
    });
    return;
  }

  const succeeded = input.outcome === 'SUCCESS';
  const booking = await prisma.forgotSomethingBooking.update({
    where: { id: existing.id },
    data: {
      status: succeeded ? 'CONFIRMED' : 'PAYMENT_PENDING',
      paymentStatus: succeeded ? 'PAID' : 'FAILED',
      paymentProvider: SANDBOX_PAYMENT_PROVIDER,
      paymentReference: makeSandboxPaymentReference(input.outcome),
      confirmedAt: succeeded ? new Date() : null,
      partnerAssignedAt: succeeded ? new Date() : null,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(booking),
      payment: {
        provider: SANDBOX_PAYMENT_PROVIDER,
        sandbox: true,
        method: input.method,
        outcome: input.outcome,
        idempotentReplay: false,
      },
    },
  });
};

export const adminUpdateStatus: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.id);
  const { status } = req.body ?? {};

  const validStatuses: ForgotSomethingStatus[] = [
    'CONFIRMED',
    'PARTNER_ASSIGNED',
    'PICKUP_IN_PROGRESS',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const existing = await prisma.forgotSomethingBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!existing) throw new AppError(404, 'Booking not found.');

  const updateData: Prisma.ForgotSomethingBookingUpdateInput = { status };
  const now = new Date();

  if (status === 'PARTNER_ASSIGNED' && !existing.partnerAssignedAt) {
    updateData.partnerAssignedAt = now;
  } else if (status === 'PICKED_UP' && !existing.pickedUpAt) {
    updateData.pickedUpAt = now;
  } else if (status === 'IN_TRANSIT' && !existing.inTransitAt) {
    updateData.inTransitAt = now;
  } else if (status === 'DELIVERED' && !existing.deliveredAt) {
    updateData.deliveredAt = now;
  } else if (status === 'CANCELLED' && !existing.cancelledAt) {
    updateData.cancelledAt = now;
  }

  const updated = await prisma.forgotSomethingBooking.update({
    where: { id: existing.id },
    data: updateData,
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(updated) },
  });
};
