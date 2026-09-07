const sanitizeConfidentialAddress = (addr: any) => ({
  label: addr.label || '',
  contactName: addr.contactName,
  countryCode: addr.countryCode || '+91',
  phoneNumber: addr.phoneNumber,
  addressLine1: addr.addressLine1,
  addressLine2: addr.addressLine2 || null,
  landmark: addr.landmark || null,
  city: addr.city,
  state: addr.state,
  postalCode: addr.postalCode,
  country: addr.country || 'India',
  latitude: addr.latitude === null || addr.latitude === undefined ? null : Number(addr.latitude),
  longitude: addr.longitude === null || addr.longitude === undefined ? null : Number(addr.longitude),
});
import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import type {
  Prisma,
} from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import {
  confidentialPaymentMethods,
  getConfidentialCourierOptions,
} from './confidential-courier-config.js';
import { calculateConfidentialCourierQuote } from './confidential-courier-pricing.js';
import {
  validateConfidentialCourierRequest,
  validateConfidentialIdempotencyKey,
} from './confidential-courier.validation.js';

const bookingInclude = {
  addresses: true,
  service: {
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
    },
  },
} satisfies Prisma.ConfidentialCourierBookingInclude;

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

const makeBookingNumber = (): string =>
  `CC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomBytes(3).toString('hex').toUpperCase()}`;

const serializeAddress = (address: any) => ({
  ...address,
  latitude: address.latitude === null ? null : Number(address.latitude),
  longitude: address.longitude === null ? null : Number(address.longitude),
});

const serializeBooking = (booking: any) => ({
  ...booking,
  distanceKm: booking.distanceKm === null ? null : Number(booking.distanceKm),
  baseCharge: Number(booking.baseCharge),
  distanceCharge: Number(booking.distanceCharge),
  securityCharge: Number(booking.securityCharge),
  handoverCharge: Number(booking.handoverCharge),
  originalsCharge: Number(booking.originalsCharge),
  returnCharge: Number(booking.returnCharge),
  taxAmount: Number(booking.taxAmount),
  totalAmount: Number(booking.totalAmount),
  declaredValue:
    booking.declaredValue === null ? null : Number(booking.declaredValue),
  addresses: Array.isArray(booking.addresses)
    ? booking.addresses.map(serializeAddress)
    : [],
});

export const getOptions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      ...getConfidentialCourierOptions(),
      sandboxGateway: getSandboxGatewayOptions(),
    },
  });
};

export const createQuote: RequestHandler = (req, res) => {
  const input = validateConfidentialCourierRequest(req.body);
  const quote = calculateConfidentialCourierQuote(input);
  res.status(200).json({ status: 'success', data: { quote } });
};

export const createBooking: RequestHandler = async (req, res) => {
  const idempotencyKey = validateConfidentialIdempotencyKey(
    req.get('Idempotency-Key'),
  );
  const input = validateConfidentialCourierRequest(req.body);
  const userId = req.user!.id;

  if (!confidentialPaymentMethods[input.paymentMethod].available) {
    throw new AppError(
      503,
      'Online payments are not configured. Select pay on delivery.',
    );
  }

  const requestFingerprint = fingerprint(input);
  const existing = await prisma.confidentialCourierBooking.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    include: bookingInclude,
  });

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new AppError(
        409,
        'This Idempotency-Key was already used for different booking details.',
      );
    }
    res.status(200).json({
      status: 'success',
      data: { booking: serializeBooking(existing), idempotentReplay: true },
    });
    return;
  }

  const quote = calculateConfidentialCourierQuote(input);
  const service = await prisma.service.findFirst({
    where: { slug: 'confidential-courier', isActive: true },
    select: { id: true },
  });
  const status =
    input.paymentMethod === 'PAY_ON_DELIVERY' ? 'CONFIRMED' : 'PAYMENT_PENDING';
  const paymentStatus =
    input.paymentMethod === 'PAY_ON_DELIVERY' ? 'NOT_REQUIRED' : 'PENDING';

  try {
    const booking = await prisma.confidentialCourierBooking.create({
      data: {
        bookingNumber: makeBookingNumber(),
        userId,
        serviceId: service?.id ?? null,
        idempotencyKey,
        requestFingerprint,
        status,
        documentType: input.document.type,
        envelopeSize: input.document.envelopeSize,
        pageCount: input.document.pageCount,
        documentDescription: input.document.description,
        containsOriginals: input.document.containsOriginals,
        requiresReturn: input.document.requiresReturn,
        declaredValue: input.document.declaredValue,
        complianceAcceptedAt: new Date(),
        securityLevel: input.security.level,
        handoverMethod: input.security.handoverMethod,
        recipientIdRequired: input.security.recipientIdRequired,
        pickupProofRequired: input.security.pickupProofRequired,
        deliverySpeed: input.deliverySpeed,
        scheduleType: input.schedule.type,
        scheduledPickupAt: input.schedule.scheduledAt,
        distanceKm: quote.distanceKm,
        pricingVersion: quote.pricingVersion,
        currency: quote.currency,
        baseCharge: quote.breakdown.baseCharge,
        distanceCharge: quote.breakdown.distanceCharge,
        securityCharge: quote.breakdown.securityCharge,
        handoverCharge: quote.breakdown.handoverCharge,
        originalsCharge: quote.breakdown.originalsCharge,
        returnCharge: quote.breakdown.returnCharge,
        taxAmount: quote.breakdown.taxAmount,
        totalAmount: quote.totalAmount,
        paymentMethod: input.paymentMethod,
        paymentStatus,
        confirmedAt: status === 'CONFIRMED' ? new Date() : null,
        addresses: {
          create: [
            { kind: 'PICKUP', ...sanitizeConfidentialAddress(input.pickup) },
            { kind: 'DROPOFF', ...sanitizeConfidentialAddress(input.dropoff) },
          ],
        },
      },
      include: bookingInclude,
    });

    res.status(201).json({
      status: 'success',
      data: { booking: serializeBooking(booking), idempotentReplay: false },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const replay = await prisma.confidentialCourierBooking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: bookingInclude,
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
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(req.query.limit ?? '10'), 10) || 10),
  );
  const userId = req.user!.id;

  const [bookings, total] = await prisma.$transaction([
    prisma.confidentialCourierBooking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.confidentialCourierBooking.count({ where: { userId } }),
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
  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Confidential courier booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(booking) },
  });
};

export const cancelBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const reason =
    typeof req.body?.reason === 'string'
      ? req.body.reason.trim()
      : 'Cancelled by customer';

  if (reason.length < 3 || reason.length > 250) {
    throw new AppError(
      400,
      'Cancellation reason must be between 3 and 250 characters.',
    );
  }

  const result = await prisma.confidentialCourierBooking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: { in: ['CONFIRMED', 'PAYMENT_PENDING'] },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
    },
  });

  if (result.count === 0) {
    const exists = await prisma.confidentialCourierBooking.findFirst({
      where: { id: bookingId, userId },
      select: { status: true },
    });
    if (!exists) {
      throw new AppError(404, 'Confidential courier booking not found.');
    }
    throw new AppError(
      409,
      `A booking with status ${exists.status} cannot be cancelled.`,
    );
  }

  const booking = await prisma.confidentialCourierBooking.findUnique({
    where: { id: bookingId },
    include: bookingInclude,
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(booking) },
  });
};

export const completeSandboxPayment: RequestHandler = async (req, res) => {
  const input = validateSandboxPayment(req.body);
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const existing = await prisma.confidentialCourierBooking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!existing) {
    throw new AppError(404, 'Confidential courier booking not found.');
  }
  if (existing.paymentMethod !== 'ONLINE') {
    throw new AppError(
      409,
      'This booking is not configured for online payment.',
    );
  }
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
  const booking = await prisma.confidentialCourierBooking.update({
    where: { id: existing.id },
    data: {
      status: succeeded ? 'CONFIRMED' : 'PAYMENT_PENDING',
      paymentStatus: succeeded ? 'PAID' : 'FAILED',
      paymentProvider: SANDBOX_PAYMENT_PROVIDER,
      paymentReference: makeSandboxPaymentReference(input.outcome),
      confirmedAt: succeeded ? new Date() : null,
    },
    include: bookingInclude,
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
