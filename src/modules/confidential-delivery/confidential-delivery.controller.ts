import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import type {
  ConfidentialAddressKind,
  ConfidentialBookingStatus,
  ConfidentialDeliverySpeed,
  ConfidentialDocumentType,
  ConfidentialPaymentMethod,
  ConfidentialPaymentStatus,
  ConfidentialSecurityLevel,
} from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import { getVaultOptions, vaultSecurityLevels, vaultServiceTypes } from './confidential-delivery-config.js';
import { calculateVaultQuote } from './confidential-delivery-pricing.js';

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

// Format: DV-YYMMDD-XXXX (e.g. DV-250811-8F7X)
export const makeVaultId = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = randomBytes(2).toString('hex').toUpperCase();
  return `DV-${yy}${mm}${dd}-${rand}`;
};

const mapDocumentType = (type?: unknown): ConfidentialDocumentType => {
  if (typeof type !== 'string') return 'OTHER';
  const upper = type.toUpperCase();
  const validTypes: ConfidentialDocumentType[] = [
    'LEGAL',
    'FINANCIAL',
    'BUSINESS',
    'IDENTITY',
    'MEDICAL',
    'OTHER',
  ];
  if (validTypes.includes(upper as ConfidentialDocumentType)) {
    return upper as ConfidentialDocumentType;
  }
  return 'OTHER';
};

const mapSecurityLevel = (level?: unknown): ConfidentialSecurityLevel => {
  if (typeof level !== 'string') return 'TAMPER_EVIDENT';
  const upper = level.toUpperCase();
  if (upper === 'STANDARD_CONFIDENTIAL' || upper === 'STANDARD_SECURE' || upper === 'SECURE_SEAL') return 'SECURE_SEAL';
  if (upper === 'CRITICAL' || upper === 'CHAIN_OF_CUSTODY' || upper === 'ULTRA') return 'CHAIN_OF_CUSTODY';
  return 'TAMPER_EVIDENT';
};

const mapDeliverySpeed = (speed?: unknown): ConfidentialDeliverySpeed => {
  if (typeof speed !== 'string') return 'PRIORITY';
  const upper = speed.toUpperCase();
  const validSpeeds: ConfidentialDeliverySpeed[] = [
    'STANDARD',
    'PRIORITY',
    'EXPRESS',
    'EXACT_TIME',
  ];
  if (validSpeeds.includes(upper as ConfidentialDeliverySpeed)) {
    return upper as ConfidentialDeliverySpeed;
  }
  return 'PRIORITY';
};

export const getOptions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      ...getVaultOptions(),
      sandboxGateway: getSandboxGatewayOptions(),
    },
  });
};

export const getQuote: RequestHandler = (req, res) => {
  const quote = calculateVaultQuote(req.body ?? {});
  res.status(200).json({
    status: 'success',
    data: quote,
  });
};

export const createBooking: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({
      message: 'Authentication required.',
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  }

  const body = req.body ?? {};
  if (!body.pickup || !body.delivery) {
    throw new AppError({
      message: 'Pickup and delivery details are required.',
      statusCode: 400,
      code: 'BAD_REQUEST',
    });
  }

  const quote = calculateVaultQuote({
    securityLevel: body.securityLevel,
    packaging: body.packaging,
    serviceType: body.serviceType,
  });

  const vaultId = makeVaultId();
  const idempotencyKey = String(req.headers['idempotency-key'] || body.idempotencyKey || vaultId);
  const requestFingerprint = fingerprint({ userId: user.id, body });

  // Map to Prisma Service
  const service = await prisma.service.findFirst({
    where: { slug: { in: ['confidential-delivery', 'confidential-courier'] } },
  });

  const paymentMethod: ConfidentialPaymentMethod =
    body.paymentMethod === 'ONLINE' ? 'ONLINE' : 'PAY_ON_DELIVERY';
  const paymentStatus: ConfidentialPaymentStatus =
    paymentMethod === 'ONLINE' ? 'PENDING' : 'NOT_REQUIRED';
  const status: ConfidentialBookingStatus =
    paymentMethod === 'ONLINE' ? 'PAYMENT_PENDING' : 'CONFIRMED';

  const pickupInstructions = body.pickup?.instructions || body.pickupInstructions || '';
  const accessRequirements = Array.isArray(body.pickup?.accessRequirements)
    ? body.pickup.accessRequirements.join(', ')
    : (body.accessRequirements || '');

  const deliveryInstructions = body.delivery?.instructions || body.deliveryInstructions || '';
  const designation = body.delivery?.designation || body.recipientDesignation || 'Authorized Recipient';
  const verificationMethod = body.delivery?.verificationMethod || body.verificationMethod || 'OTP';

  const booking = await prisma.confidentialCourierBooking.create({
    data: {
      bookingNumber: vaultId,
      userId: user.id,
      serviceId: service?.id ?? null,
      idempotencyKey,
      requestFingerprint,
      status,
      documentType: mapDocumentType(body.itemType || body.documentType),
      envelopeSize: 'LARGE',
      pageCount: 1,
      documentDescription: body.itemDescription || body.itemType || 'Confidential Shipment in Delivez Vault',
      containsOriginals: true,
      requiresReturn: false,
      declaredValue: body.declaredValue ? Number(body.declaredValue) : 50000,
      complianceAcceptedAt: new Date(),
      securityLevel: mapSecurityLevel(body.securityLevel),
      handoverMethod: verificationMethod === 'GOVT_ID' ? 'SIGNATURE' : 'OTP_AND_SIGNATURE',
      recipientIdRequired: true,
      pickupProofRequired: true,
      deliverySpeed: mapDeliverySpeed(body.serviceType),
      scheduleType: body.pickupSchedule ? 'SCHEDULED' : 'ASAP',
      scheduledPickupAt: body.pickupSchedule ? new Date(body.pickupSchedule) : null,
      distanceKm: quote.breakdown.distanceKm,
      pricingVersion: 'v2-vault',
      currency: 'INR',
      baseCharge: quote.baseFare,
      distanceCharge: 0,
      securityCharge: quote.securityHandling,
      handoverCharge: quote.addOnServices,
      originalsCharge: 0,
      returnCharge: 0,
      taxAmount: quote.breakdown.gstAmount,
      totalAmount: quote.totalAmount,
      paymentMethod,
      paymentStatus,
      addresses: {
        create: [
          {
            kind: 'PICKUP',
            label: body.pickup.label || body.pickup.companyName || 'Pickup Location',
            contactName: body.pickup.contactName,
            countryCode: body.pickup.countryCode || '+91',
            phoneNumber: body.pickup.phoneNumber,
            addressLine1: body.pickup.addressLine1,
            addressLine2: body.pickup.addressLine2 || (pickupInstructions ? `Instructions: ${pickupInstructions}` : null),
            landmark: accessRequirements ? `Access: ${accessRequirements}` : (body.pickup.landmark || null),
            city: body.pickup.city,
            state: body.pickup.state,
            postalCode: body.pickup.postalCode,
            country: 'India',
          },
          {
            kind: 'DROPOFF',
            label: body.delivery.label || body.delivery.companyName || 'Delivery Location',
            contactName: body.delivery.contactName,
            countryCode: body.delivery.countryCode || '+91',
            phoneNumber: body.delivery.phoneNumber,
            addressLine1: body.delivery.addressLine1,
            addressLine2: body.delivery.addressLine2 || (deliveryInstructions ? `Instructions: ${deliveryInstructions}` : null),
            landmark: designation ? `Role: ${designation}` : null,
            city: body.delivery.city,
            state: body.delivery.state,
            postalCode: body.delivery.postalCode,
            country: 'India',
          },
        ],
      },
    },
    include: {
      addresses: true,
      service: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const pickupDateDisplay = body.pickupDateDisplay || (body.pickupSchedule ? new Date(body.pickupSchedule).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Today, 10:00 AM - 12:00 PM');
  const secName = vaultSecurityLevels.find(s => s.id === body.securityLevel)?.name || 'Highly Confidential';

  res.status(201).json({
    status: 'success',
    data: {
      booking: {
        id: booking.id,
        vaultId: booking.bookingNumber,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        securityLevel: secName,
        encryption: 'AES-256 Encrypted',
        pickupDate: pickupDateDisplay,
        timeSlot: body.timeSlot || '10:00 AM - 12:00 PM',
        expectedDelivery: 'Today by 06:00 PM',
        totalAmount: Number(booking.totalAmount),
        baseFare: quote.baseFare,
        securityHandling: quote.securityHandling,
        addOnServices: quote.addOnServices,
        packagingFee: quote.packagingFee,
        serviceFee: quote.serviceFee,
        paymentMethod: booking.paymentMethod,
        paymentStatus: booking.paymentStatus,
        addresses: {
          pickup: booking.addresses.find((a) => a.kind === 'PICKUP'),
          delivery: booking.addresses.find((a) => a.kind === 'DROPOFF'),
        },
        recipient: {
          name: body.delivery.contactName,
          email: body.delivery.email || 'confidential@domain.com',
          phone: body.delivery.phoneNumber,
          designation,
          verificationMethod: verificationMethod === 'GOVT_ID' ? 'Govt ID Verification' : (verificationMethod === 'QR_CODE' ? 'QR Code Verification' : 'OTP Verification'),
        },
        additionalServices: [
          'Tamper-Proof Seal',
          'Chain of Custody',
          'Photo Proof of Delivery',
          'Secure Handling Protocol',
        ],
      },
    },
  });
};

export const getBookings: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({
      message: 'Authentication required.',
      statusCode: 401,
      code: 'UNAUTHORIZED',
    });
  }

  const bookings = await prisma.confidentialCourierBooking.findMany({
    where: { userId: user.id },
    include: { addresses: true, service: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map((b) => ({
        id: b.id,
        vaultId: b.bookingNumber,
        bookingNumber: b.bookingNumber,
        status: b.status,
        documentType: b.documentType,
        securityLevel: b.securityLevel,
        handoverMethod: b.handoverMethod,
        declaredValue: Number(b.declaredValue || 0),
        deliverySpeed: b.deliverySpeed,
        documentDescription: b.documentDescription,
        complianceAcceptedAt: b.complianceAcceptedAt,
        totalAmount: Number(b.totalAmount),
        currency: b.currency,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
        addresses: {
          pickup: b.addresses.find((a) => a.kind === 'PICKUP'),
          dropoff: b.addresses.find((a) => a.kind === 'DROPOFF'),
        },
      })),
    },
  });
};

export const getBookingById: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { addresses: true, service: true },
  });

  if (!booking) {
    throw new AppError({
      message: 'Vault booking not found.',
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking: {
        ...booking,
        vaultId: booking.bookingNumber,
        totalAmount: Number(booking.totalAmount),
        baseCharge: Number(booking.baseCharge),
        securityCharge: Number(booking.securityCharge),
        handoverCharge: Number(booking.handoverCharge),
        addresses: {
          pickup: booking.addresses.find((a) => a.kind === 'PICKUP'),
          dropoff: booking.addresses.find((a) => a.kind === 'DROPOFF'),
        },
      },
    },
  });
};

export const trackVault: RequestHandler = async (req, res) => {
  const vaultId = String(req.params.vaultId ?? '');
  let booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ bookingNumber: vaultId }, { id: vaultId }] },
    include: { addresses: true },
  });

  let pickupAddr = booking?.addresses.find((a) => a.kind === 'PICKUP');
  let dropoffAddr = booking?.addresses.find((a) => a.kind === 'DROPOFF');
  let currentStatus = booking?.status || 'CONFIRMED';

  if (!booking) {
    const courier = await prisma.courierBooking.findFirst({
      where: { OR: [{ bookingNumber: vaultId }, { id: vaultId }] },
      include: { addresses: true },
    });
    if (courier) {
      booking = {
        id: courier.id,
        bookingNumber: courier.bookingNumber,
        status: courier.status as any,
      } as any;
      currentStatus = courier.status as any;
      const cPickup = courier.addresses.find((a: any) => a.type === 'PICKUP');
      const cDropoff = courier.addresses.find((a: any) => a.type === 'DROPOFF');
      pickupAddr = cPickup ? { city: cPickup.city } as any : undefined;
      dropoffAddr = cDropoff ? { city: cDropoff.city } as any : undefined;
    }
  }
  const isDelivered = currentStatus === 'DELIVERED';
  const isInTransit = currentStatus === 'IN_TRANSIT' || currentStatus === 'DELIVERED';
  const isPickedUp = currentStatus === 'PICKED_UP' || isInTransit;

  const milestones = [
    {
      id: 5,
      title: 'Delivered Securely',
      time: isDelivered ? 'Today, 02:15 PM' : 'Expected today by 06:00 PM',
      description: isDelivered
        ? 'Handover completed with OTP & digital signature verification.'
        : 'Shipment will be handed over strictly to the designated recipient.',
      location: dropoffAddr ? `${dropoffAddr.city}, India` : 'Recipient Location',
      facilityCode: 'FINAL-DEST',
      completed: isDelivered,
      current: isDelivered,
      icon: 'CheckCircle2',
    },
    {
      id: 4,
      title: 'In Transit - Secure',
      time: isInTransit ? 'Today, 11:35 AM' : 'Pending pickup',
      description: 'Shipment is in high-security transit with direct routing.',
      location: 'Enroute to BLR-FC-02',
      facilityCode: 'BLR-FC-02',
      completed: isInTransit,
      current: currentStatus === 'IN_TRANSIT',
      icon: 'Package',
    },
    {
      id: 3,
      title: 'Picked Up',
      time: isPickedUp ? 'Today, 10:20 AM' : 'Scheduled today',
      description: 'Vault has been picked up & verified by our custody executive.',
      location: 'BLR-FC-01',
      facilityCode: 'BLR-FC-01',
      completed: isPickedUp,
      current: currentStatus === 'PICKED_UP' || currentStatus === 'PICKUP_ASSIGNED',
      icon: 'Truck',
    },
    {
      id: 2,
      title: 'Vault Created',
      time: 'Today, 09:45 AM',
      description: 'Your confidential shipment is registered & secured in Delivez Vault.',
      location: pickupAddr ? `${pickupAddr.city}` : 'Bengaluru',
      facilityCode: 'VAULT-CORE',
      completed: true,
      current: false,
      icon: 'Shield',
    },
    {
      id: 1,
      title: 'Booking Confirmed',
      time: 'Today, 09:40 AM',
      description: 'Vault booking has been confirmed successfully.',
      location: null,
      facilityCode: null,
      completed: true,
      current: false,
      icon: 'FileText',
    },
  ];

  const statusBadge =
    currentStatus === 'DELIVERED'
      ? 'Delivered'
      : currentStatus === 'IN_TRANSIT'
      ? 'In Transit - Secure'
      : currentStatus === 'PICKED_UP'
      ? 'Picked Up'
      : currentStatus === 'CANCELLED'
      ? 'Cancelled'
      : 'Confirmed - Ready for Pickup';

  const liveData = {
    vaultId: booking?.bookingNumber ?? vaultId,
    bookingId: booking?.id ?? null,
    status: currentStatus,
    statusBadge,
    pickupDate: 'Today • 10:00 AM - 12:00 PM',
    lastUpdated: 'Just now',
    milestones,
    currentLocation: {
      address: isDelivered ? (dropoffAddr?.addressLine1 || 'Delivered to recipient') : 'Near Hebbal Flyover, Bengaluru, Karnataka',
      subtext: isDelivered ? 'Delivered successfully' : 'Enroute to destination facility',
      eta: isDelivered ? 'Completed' : 'Today, 02:15 PM',
      coordinates: { lat: 13.0358, lng: 77.5970 },
    },
    executive: {
      name: 'Vikram S.',
      badgeId: 'EXEC-7729',
      phone: '+91 98765 43210',
      securityClearance: 'Level 3 Custody Certified',
    },
    route: {
      from: pickupAddr ? `${pickupAddr.contactName}, ${pickupAddr.city}` : 'Block 1, MG Road, Bengaluru - 560001',
      to: dropoffAddr ? `${dropoffAddr.contactName}, ${dropoffAddr.city}` : 'Unit 601, MG Road, Bengaluru - 560001',
    },
    recipient: dropoffAddr ? {
      name: dropoffAddr.contactName,
      phone: dropoffAddr.phoneNumber,
    } : null,
    securityBanner: {
      title: 'Security First',
      message: 'Do not share your Vault ID or OTP with anyone except the authorized executive at handover.',
    },
  };

  res.status(200).json({
    status: 'success',
    data: liveData,
  });
};

export const verifyDeliveryOtp: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body ?? {};

  if (!otp || String(otp).trim().length < 4) {
    throw new AppError({
      message: 'Please provide a valid 4-digit or 6-digit delivery OTP.',
      statusCode: 400,
      code: 'INVALID_OTP',
    });
  }

  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id: String(id) }, { bookingNumber: String(id) }] },
  });

  if (!booking) {
    throw new AppError({
      message: 'Vault booking not found.',
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  // Update booking to DELIVERED
  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: booking.id },
    data: {
      status: 'DELIVERED',
    },
    include: { addresses: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'OTP verified successfully. Shipment marked as Delivered.',
    data: {
      vaultId: updated.bookingNumber,
      status: updated.status,
    },
  });
};

export const cancelBookingHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  if (!user) throw new AppError(401, 'Authentication required.');

  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: {
      OR: [{ id: String(id) }, { bookingNumber: String(id) }],
      ...(user.role !== 'ADMIN' ? { userId: user.id } : {}),
    },
  });

  if (!booking) throw new AppError(404, 'Vault booking not found.');

  if (['DELIVERED', 'CANCELLED'].includes(booking.status)) {
    throw new AppError(400, `Cannot cancel booking with status ${booking.status}.`);
  }

  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: req.body?.reason || 'Cancelled by user',
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Vault booking has been cancelled.',
    data: {
      vaultId: updated.bookingNumber,
      status: updated.status,
    },
  });
};

export const completeSandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const { method, outcome } = validateSandboxPayment(req.body);

  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError({
      message: 'Vault booking not found.',
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const paymentStatus: ConfidentialPaymentStatus = outcome === 'SUCCESS' ? 'PAID' : 'FAILED';
  const status: ConfidentialBookingStatus = outcome === 'SUCCESS' ? 'CONFIRMED' : booking.status;
  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus,
      status,
      paymentMethod: 'ONLINE',
    },
    include: { addresses: true },
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: {
        ...updated,
        vaultId: updated.bookingNumber,
        totalAmount: Number(updated.totalAmount),
      },
      payment: {
        provider: SANDBOX_PAYMENT_PROVIDER,
        method,
        outcome,
        paymentReference: makeSandboxPaymentReference(updated.id),
      },
    },
  });
};

export const adminListVaultBookings: RequestHandler = async (req, res) => {
  const requestedPage = Number.parseInt(String(req.query.page), 10);
  const requestedLimit = Number.parseInt(String(req.query.limit), 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 20;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;

  const where: any = {};
  if (statusFilter && ['CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(statusFilter)) {
    where.status = statusFilter;
  }
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { mobileNumber: { contains: search } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.confidentialCourierBooking.count({ where }),
    prisma.confidentialCourierBooking.findMany({
      where,
      include: {
        addresses: true,
        user: { select: { id: true, fullName: true, mobileNumber: true, email: true } },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map((b) => ({
        id: b.id,
        vaultId: b.bookingNumber,
        bookingNumber: b.bookingNumber,
        status: b.status,
        totalAmount: Number(b.totalAmount),
        currency: b.currency,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
        user: b.user,
        addresses: {
          pickup: b.addresses.find((a) => a.kind === 'PICKUP'),
          dropoff: b.addresses.find((a) => a.kind === 'DROPOFF'),
        },
      })),
      total,
      page,
      limit,
    },
  });
};

export const adminUpdateVaultStatus: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  const validStatuses: ConfidentialBookingStatus[] = [
    'CONFIRMED',
    'PICKUP_ASSIGNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!validStatuses.includes(status)) {
    throw new AppError(400, `Invalid status: ${status}. Valid options are ${validStatuses.join(', ')}`);
  }

  const booking = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id: String(id) }, { bookingNumber: String(id) }] },
  });

  if (!booking) throw new AppError(404, 'Vault booking not found.');

  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: booking.id },
    data: { status },
    include: { addresses: true, user: true },
  });

  res.status(200).json({
    status: 'success',
    message: `Status updated to ${status}.`,
    data: {
      vaultId: updated.bookingNumber,
      status: updated.status,
    },
  });
};


