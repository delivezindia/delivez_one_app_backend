import { createHash, randomBytes, randomUUID } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { Prisma, type ReturnPickupStatus } from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import { getReturnPickupOptions } from './return-pickup-config.js';
import { calculateReturnPickupQuote } from './return-pickup-pricing.js';
import {
  formatDocumentResponse,
  getReturnDocument,
  storeReturnDocument,
} from './return-pickup-storage.js';
import {
  validateIdempotencyKey,
  validateRescheduleRequest,
  validateReturnPickupRequest,
} from './return-pickup.validation.js';

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

// Format: DRVZ-RET-DDMMYY-XXXXX (e.g., DRVZ-RET-080525-00123)
const makeBookingNumber = (): string => {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  const randomSeq = String(Math.floor(10000 + Math.random() * 90000));
  return `DRVZ-RET-${day}${month}${year}-${randomSeq}`;
};

const makeOtp = (): string => String(Math.floor(1000 + Math.random() * 9000));

const normalizeDocuments = (req: Request, rawDocs: any): any[] => {
  if (!rawDocs) return [];
  let docsArray: any[] = [];
  if (Array.isArray(rawDocs)) {
    docsArray = rawDocs;
  } else if (typeof rawDocs === 'object') {
    docsArray = Object.values(rawDocs);
  } else if (typeof rawDocs === 'string') {
    try {
      const parsed = JSON.parse(rawDocs);
      docsArray = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  return docsArray.map((item, index) => {
    if (typeof item === 'string') {
      return formatDocumentResponse(req, {
        id: item,
        fileName: `document_${index + 1}`,
      });
    }
    return formatDocumentResponse(req, {
      id: item.id || `doc_imported_${index + 1}`,
      documentType: item.documentType || item.type || 'INVOICE_ORDER_PROOF',
      title: item.title,
      fileName: item.fileName || item.name || `document_${index + 1}`,
      fileSize: item.fileSize || item.size || 0,
      mimeType: item.mimeType || item.type || 'application/pdf',
      fileUrl: item.fileUrl || item.url,
      uploadedAt: item.uploadedAt || item.createdAt,
    });
  });
};

const serializeBooking = (req: Request, booking: any) => {
  const documents = normalizeDocuments(req, booking.documents);

  return {
    ...booking,
    estimatedRefundAmount:
      booking.estimatedRefundAmount === null ? null : Number(booking.estimatedRefundAmount),
    declaredValue: booking.declaredValue === null ? null : Number(booking.declaredValue),
    approxWeightKg: booking.approxWeightKg === null ? null : Number(booking.approxWeightKg),
    lengthCm: booking.lengthCm === null ? null : Number(booking.lengthCm),
    widthCm: booking.widthCm === null ? null : Number(booking.widthCm),
    heightCm: booking.heightCm === null ? null : Number(booking.heightCm),
    protectionCoverAmount:
      booking.protectionCoverAmount === null ? 10000 : Number(booking.protectionCoverAmount),
    partnerRating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
    basePickupCharge: Number(booking.basePickupCharge),
    distanceCharge: Number(booking.distanceCharge),
    handlingCharge: Number(booking.handlingCharge),
    deliveryServiceCharge: Number(booking.deliveryServiceCharge),
    protectionCharge: Number(booking.protectionCharge),
    discountAmount: Number(booking.discountAmount),
    taxAmount: Number(booking.taxAmount),
    totalAmount: Number(booking.totalAmount),
    pickupLatitude: booking.pickupLatitude === null ? null : Number(booking.pickupLatitude),
    pickupLongitude: booking.pickupLongitude === null ? null : Number(booking.pickupLongitude),
    returnLatitude: booking.returnLatitude === null ? null : Number(booking.returnLatitude),
    returnLongitude: booking.returnLongitude === null ? null : Number(booking.returnLongitude),
    documents,
    documentsCount: documents.length,
    pickup: {
      storeName: booking.pickupStoreName,
      address: booking.pickupAddress,
      city: booking.pickupCity,
      state: booking.pickupState,
      postalCode: booking.pickupPostalCode,
      contactName: booking.pickupContactName,
      phoneNumber: booking.pickupPhoneNumber,
      referenceNumber: booking.pickupReferenceNumber,
      instructions: booking.pickupInstructions,
      latitude: booking.pickupLatitude === null ? null : Number(booking.pickupLatitude),
      longitude: booking.pickupLongitude === null ? null : Number(booking.pickupLongitude),
    },
    delivery: {
      addressType: booking.returnAddressType,
      address: booking.returnAddress,
      city: booking.returnCity,
      state: booking.returnState,
      postalCode: booking.returnPostalCode,
      contactName: booking.returnContactName,
      phoneNumber: booking.returnPhoneNumber,
      landmark: booking.returnLandmark,
      instructions: booking.returnInstructions,
      latitude: booking.returnLatitude === null ? null : Number(booking.returnLatitude),
      longitude: booking.returnLongitude === null ? null : Number(booking.returnLongitude),
    },
    partner: {
      name: booking.partnerName || 'Ravi Kumar',
      phone: booking.partnerPhone || '+91 98765 43210',
      vehicle: booking.partnerVehicle || 'DL1Z 9876',
      rating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
      hub: booking.currentHubLocation || 'Tumkur Hub',
    },
  };
};

export const getOptions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      ...getReturnPickupOptions(),
      sandboxGateway: getSandboxGatewayOptions(),
    },
  });
};

export const getQuote: RequestHandler = (req, res) => {
  const quote = calculateReturnPickupQuote(req.body ?? {});
  res.status(200).json({
    status: 'success',
    data: { quote },
  });
};

// Standalone Document / File Upload Endpoint
export const uploadDocument: RequestHandler = (req, res) => {
  const files: Express.Multer.File[] = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : req.file
      ? [req.file]
      : [];

  if (files.length === 0) {
    throw new AppError(
      400,
      'No file was provided for upload. Attach a file using the "file", "document", or "files" field.',
    );
  }

  const defaultType =
    typeof req.body?.documentType === 'string'
      ? req.body.documentType.trim()
      : 'INVOICE_ORDER_PROOF';
  const customTitle = typeof req.body?.title === 'string' ? req.body.title.trim() : undefined;
  const bookingId = typeof req.body?.bookingId === 'string' ? req.body.bookingId.trim() : undefined;
  const userId = req.user?.id;

  const uploadedRecords = files.map((file) => {
    const record = storeReturnDocument(file, {
      documentType: defaultType,
      title: customTitle,
      bookingId,
      userId,
    });
    return formatDocumentResponse(req, record);
  });

  res.status(201).json({
    status: 'success',
    message: `${uploadedRecords.length} document${uploadedRecords.length > 1 ? 's' : ''} uploaded successfully.`,
    data: {
      document: uploadedRecords[0],
      documents: uploadedRecords,
    },
  });
};

// Binary File Serving & Download Endpoint
export const serveDocumentFile: RequestHandler = (req, res) => {
  const docId = String(req.params.docId || req.params.fileId);
  const doc = getReturnDocument(docId);

  if (!doc) {
    throw new AppError(404, 'The requested return document or file was not found.');
  }

  const encodedFileName = encodeURIComponent(doc.fileName);

  res.set({
    'Content-Type': doc.mimeType,
    'Content-Length': String(doc.buffer.length),
    'Content-Disposition': `inline; filename*=UTF-8''${encodedFileName}`,
    'Cache-Control': 'public, max-age=86400',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    ETag: `"${doc.id}-${doc.fileSize}"`,
  });

  res.status(200).send(doc.buffer);
};

export const createBooking: RequestHandler = async (req, res) => {
  const idempotencyKey = validateIdempotencyKey(req.get('Idempotency-Key'));
  const input = validateReturnPickupRequest(req.body);
  const requestFingerprint = fingerprint(input);
  const userId = req.user!.id;

  const existing = await prisma.returnPickupBooking.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    include: { service: true },
  });

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new AppError(
        409,
        'This Idempotency-Key was already used for different return booking details.',
      );
    }
    res.status(200).json({
      status: 'success',
      data: { booking: serializeBooking(req, existing), idempotentReplay: true },
    });
    return;
  }

  // Process any files uploaded directly in multipart form data
  const directUploadedDocs: any[] = [];
  const multipartFiles: Express.Multer.File[] = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : req.file
      ? [req.file]
      : [];

  for (const file of multipartFiles) {
    // Map field name (e.g. invoiceFile, returnAuthFile) to documentType if specified
    let docType = 'INVOICE_ORDER_PROOF';
    if (
      file.fieldname.toLowerCase().includes('auth') ||
      file.fieldname.toLowerCase().includes('returnauth')
    ) {
      docType = 'RETURN_AUTHORIZATION';
    } else if (
      file.fieldname.toLowerCase().includes('repair') ||
      file.fieldname.toLowerCase().includes('receipt')
    ) {
      docType = 'REPAIR_RECEIPT';
    } else if (file.fieldname.toLowerCase().includes('warranty')) {
      docType = 'WARRANTY_DOC';
    } else if (
      file.fieldname.toLowerCase().includes('qr') ||
      file.fieldname.toLowerCase().includes('barcode')
    ) {
      docType = 'QR_BARCODE';
    } else if (file.fieldname.toLowerCase().includes('pickup')) {
      docType = 'PICKUP_AUTH';
    } else if (file.fieldname.toLowerCase().includes('photo')) {
      docType = 'ITEM_PHOTO';
    }

    const stored = storeReturnDocument(file, {
      documentType: docType,
      userId,
    });
    directUploadedDocs.push(formatDocumentResponse(req, stored));
  }

  // Combine initial documents from input JSON and multipart uploads
  const initialDocs = normalizeDocuments(req, input.documents);
  const combinedDocs = [...initialDocs, ...directUploadedDocs];

  const quote = calculateReturnPickupQuote({
    deliveryService: input.deliveryService,
    shipmentProtection: input.shipmentProtection,
    itemQuantity: input.itemQuantity,
    declaredValue: input.declaredValue ?? undefined,
    couponCode: input.couponCode ?? undefined,
  });

  const returnService = await prisma.service.findFirst({
    where: { slug: { in: ['return-pickup', 'personal-return-pickup'] }, isActive: true },
    select: { id: true },
  });

  const isInstantConfirmation =
    input.paymentMethod === 'PAY_ON_PICKUP' || input.paymentMethod === 'WALLET';
  const status: ReturnPickupStatus = isInstantConfirmation ? 'CONFIRMED' : 'PAYMENT_PENDING';
  const paymentStatus = isInstantConfirmation
    ? input.paymentMethod === 'WALLET'
      ? 'PAID'
      : 'NOT_REQUIRED'
    : 'PENDING';
  const confirmedAt = status === 'CONFIRMED' ? new Date() : null;

  const pickupOtp = makeOtp();
  const deliveryOtp = makeOtp();

  try {
    const booking = await prisma.returnPickupBooking.create({
      data: {
        bookingNumber: makeBookingNumber(),
        userId,
        serviceId: returnService?.id ?? null,
        idempotencyKey,
        requestFingerprint,
        status,

        returnType: input.returnType,
        destinationType: input.destinationType,
        destinationName: input.destinationName || null,
        orderId: input.orderId || null,
        returnId: input.returnId || null,
        returnBeforeDate: input.returnBeforeDate || null,
        estimatedRefundAmount: input.estimatedRefundAmount
          ? new Prisma.Decimal(input.estimatedRefundAmount)
          : null,

        pickupStoreName: input.pickupStoreName,
        pickupAddress: input.pickupAddress,
        pickupCity: input.pickupCity,
        pickupState: input.pickupState || 'Karnataka',
        pickupPostalCode: input.pickupPostalCode,
        pickupContactName: input.pickupContactName,
        pickupPhoneNumber: input.pickupPhoneNumber,
        pickupReferenceNumber: input.pickupReferenceNumber || null,
        pickupInstructions: input.pickupInstructions || null,
        pickupLatitude:
          input.pickupLatitude !== null && input.pickupLatitude !== undefined
            ? new Prisma.Decimal(input.pickupLatitude)
            : null,
        pickupLongitude:
          input.pickupLongitude !== null && input.pickupLongitude !== undefined
            ? new Prisma.Decimal(input.pickupLongitude)
            : null,

        returnAddressType: input.returnAddressType || 'My Home',
        returnAddress: input.returnAddress,
        returnCity: input.returnCity,
        returnState: input.returnState || 'Karnataka',
        returnPostalCode: input.returnPostalCode,
        returnContactName: input.returnContactName,
        returnPhoneNumber: input.returnPhoneNumber,
        returnLandmark: input.returnLandmark || null,
        returnInstructions: input.returnInstructions || null,
        returnLatitude:
          input.returnLatitude !== null && input.returnLatitude !== undefined
            ? new Prisma.Decimal(input.returnLatitude)
            : null,
        returnLongitude:
          input.returnLongitude !== null && input.returnLongitude !== undefined
            ? new Prisma.Decimal(input.returnLongitude)
            : null,

        itemCategory: input.itemCategory,
        itemDescription: input.itemDescription,
        itemQuantity: input.itemQuantity,
        declaredValue: input.declaredValue ? new Prisma.Decimal(input.declaredValue) : null,
        approxWeightKg: input.approxWeightKg ? new Prisma.Decimal(input.approxWeightKg) : null,
        lengthCm: input.lengthCm ? new Prisma.Decimal(input.lengthCm) : null,
        widthCm: input.widthCm ? new Prisma.Decimal(input.widthCm) : null,
        heightCm: input.heightCm ? new Prisma.Decimal(input.heightCm) : null,
        itemCondition: input.itemCondition,
        specialHandlingTags: input.specialHandlingTags,
        documents:
          combinedDocs.length > 0 ? (combinedDocs as Prisma.InputJsonValue) : Prisma.JsonNull,

        scheduledDate: input.scheduledDate || null,
        scheduledTimeSlot: input.scheduledTimeSlot || '11:00 AM - 1:00 PM',
        deliveryService: input.deliveryService,
        shipmentProtection: input.shipmentProtection,
        protectionCoverAmount: new Prisma.Decimal(10000),

        pickupOtp,
        deliveryOtp,

        partnerName: 'Ravi Kumar',
        partnerPhone: '+91 98765 43210',
        partnerVehicle: 'DL1Z 9876',
        partnerRating: new Prisma.Decimal(4.9),
        currentHubLocation: 'Tumkur Hub',

        currency: quote.currency,
        basePickupCharge: new Prisma.Decimal(quote.basePickupCharge),
        distanceCharge: new Prisma.Decimal(quote.distanceCharge),
        handlingCharge: new Prisma.Decimal(quote.handlingCharge),
        deliveryServiceCharge: new Prisma.Decimal(quote.deliveryServiceCharge),
        protectionCharge: new Prisma.Decimal(quote.protectionCharge),
        discountAmount: new Prisma.Decimal(quote.discountAmount),
        taxAmount: new Prisma.Decimal(quote.taxAmount),
        totalAmount: new Prisma.Decimal(quote.totalAmount),

        paymentMethod: input.paymentMethod,
        paymentStatus,
        paymentProvider: input.paymentMethod === 'WALLET' ? 'DELIVEZ_WALLET' : null,
        paymentReference:
          input.paymentMethod === 'WALLET'
            ? `WAL-RET-${randomBytes(4).toString('hex').toUpperCase()}`
            : null,
        confirmedAt,
        pickupScheduledAt: status === 'CONFIRMED' ? new Date() : null,
      },
      include: { service: true },
    });

    res.status(201).json({
      status: 'success',
      data: { booking: serializeBooking(req, booking), idempotentReplay: false },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const replay = await prisma.returnPickupBooking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: { service: true },
      });
      if (replay?.requestFingerprint === requestFingerprint) {
        res.status(200).json({
          status: 'success',
          data: { booking: serializeBooking(req, replay), idempotentReplay: true },
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
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : null;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : null;
  const returnTypeFilter =
    typeof req.query.returnType === 'string' ? req.query.returnType.trim() : null;
  const userId = req.user!.id;

  const where: Prisma.ReturnPickupBookingWhereInput = { userId };

  if (returnTypeFilter) {
    where.returnType = returnTypeFilter as any;
  }

  if (statusFilter && statusFilter !== 'ALL') {
    if (statusFilter === 'ACTIVE') {
      where.status = {
        in: [
          'CONFIRMED',
          'PICKUP_SCHEDULED',
          'PARTNER_ON_THE_WAY',
          'ARRIVED_AT_PICKUP',
          'PICKED_UP',
          'IN_TRANSIT',
          'AT_DESTINATION',
          'OUT_FOR_DELIVERY',
        ],
      };
    } else if (statusFilter === 'COMPLETED') {
      where.status = 'DELIVERED';
    } else if (statusFilter === 'CANCELLED') {
      where.status = 'CANCELLED';
    } else if (
      [
        'PAYMENT_PENDING',
        'CONFIRMED',
        'PICKUP_SCHEDULED',
        'PARTNER_ON_THE_WAY',
        'ARRIVED_AT_PICKUP',
        'PICKED_UP',
        'IN_TRANSIT',
        'AT_DESTINATION',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ].includes(statusFilter)
    ) {
      where.status = statusFilter as ReturnPickupStatus;
    }
  }

  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { itemDescription: { contains: search, mode: 'insensitive' } },
      { pickupStoreName: { contains: search, mode: 'insensitive' } },
      { destinationName: { contains: search, mode: 'insensitive' } },
      { orderId: { contains: search, mode: 'insensitive' } },
      { returnId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [bookings, total] = await prisma.$transaction([
    prisma.returnPickupBooking.findMany({
      where,
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.returnPickupBooking.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map((b) => serializeBooking(req, b)),
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

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(req, booking) },
  });
};

// Add Document to an existing booking
export const addBookingDocument: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  const files: Express.Multer.File[] = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : req.file
      ? [req.file]
      : [];

  if (files.length === 0 && !req.body?.fileUrl) {
    throw new AppError(400, 'Please attach a document file to upload or provide a fileUrl.');
  }

  const docType =
    typeof req.body?.documentType === 'string'
      ? req.body.documentType.trim()
      : 'INVOICE_ORDER_PROOF';
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : undefined;

  const currentDocs = normalizeDocuments(req, booking.documents);
  const newUploadedDocs: any[] = [];

  for (const file of files) {
    const stored = storeReturnDocument(file, {
      documentType: docType,
      title,
      bookingId: booking.id,
      userId,
    });
    newUploadedDocs.push(formatDocumentResponse(req, stored));
  }

  if (files.length === 0 && req.body?.fileUrl) {
    newUploadedDocs.push(
      formatDocumentResponse(req, {
        id: `doc_${randomUUID().replace(/-/g, '').slice(0, 14)}`,
        documentType: docType,
        title,
        fileName: typeof req.body?.fileName === 'string' ? req.body.fileName.trim() : 'document',
        fileUrl: req.body.fileUrl,
        bookingId: booking.id,
      }),
    );
  }

  const updatedDocs = [...currentDocs, ...newUploadedDocs];

  const updated = await prisma.returnPickupBooking.update({
    where: { id: booking.id },
    data: {
      documents: updatedDocs as Prisma.InputJsonValue,
    },
    include: { service: true },
  });

  res.status(201).json({
    status: 'success',
    message: 'Document added to return pickup booking successfully.',
    data: {
      documents: normalizeDocuments(req, updated.documents),
      booking: serializeBooking(req, updated),
    },
  });
};

// List all documents on a booking
export const listBookingDocuments: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  const documents = normalizeDocuments(req, booking.documents);

  res.status(200).json({
    status: 'success',
    data: {
      bookingId: booking.id,
      bookingNumber: booking.bookingNumber,
      documents,
      total: documents.length,
    },
  });
};

// Delete a document from a booking
export const deleteBookingDocument: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const docId = String(req.params.docId);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  const currentDocs = normalizeDocuments(req, booking.documents);
  const filteredDocs = currentDocs.filter((d) => d.id !== docId);

  if (filteredDocs.length === currentDocs.length) {
    throw new AppError(404, 'Document not found on this booking.');
  }

  const updated = await prisma.returnPickupBooking.update({
    where: { id: booking.id },
    data: {
      documents:
        filteredDocs.length > 0 ? (filteredDocs as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Document removed from return booking.',
    data: {
      documents: normalizeDocuments(req, updated.documents),
      booking: serializeBooking(req, updated),
    },
  });
};

// Reschedule Booking
export const rescheduleBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const input = validateRescheduleRequest(req.body);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  const allowedStatuses: ReturnPickupStatus[] = [
    'CONFIRMED',
    'PAYMENT_PENDING',
    'PICKUP_SCHEDULED',
  ];
  if (!allowedStatuses.includes(booking.status)) {
    throw new AppError(
      400,
      `Cannot reschedule return booking in status "${booking.status}". Only upcoming pickups can be rescheduled.`,
    );
  }

  const updated = await prisma.returnPickupBooking.update({
    where: { id: booking.id },
    data: {
      scheduledDate: input.scheduledDate,
      scheduledTimeSlot: input.scheduledTimeSlot,
      pickupInstructions:
        input.pickupInstructions !== undefined
          ? input.pickupInstructions
          : booking.pickupInstructions,
      pickupScheduledAt: new Date(),
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Return pickup successfully rescheduled.',
    data: { booking: serializeBooking(req, updated) },
  });
};

// Tax Invoice / Receipt Breakdown
export const getBookingInvoice: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: { service: true, user: true },
  });

  if (!booking) {
    throw new AppError(404, 'Return pickup booking not found.');
  }

  const subtotal =
    Number(booking.basePickupCharge) +
    Number(booking.distanceCharge) +
    Number(booking.handlingCharge) +
    Number(booking.deliveryServiceCharge) +
    Number(booking.protectionCharge);

  const discount = Number(booking.discountAmount);
  const taxableAmount = Math.max(0, subtotal - discount);
  const totalTax = Number(booking.taxAmount);
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  const invoiceNumber = `INV-RET-${booking.bookingNumber.replace('DRVZ-RET-', '')}`;
  const invoiceDate = booking.confirmedAt || booking.createdAt;

  res.status(200).json({
    status: 'success',
    data: {
      invoice: {
        invoiceNumber,
        invoiceDate,
        bookingNumber: booking.bookingNumber,
        hsnSacCode: '996812',
        serviceDescription: 'Return Pickup and Reverse Logistics Services',
        customer: {
          name: booking.user.fullName || booking.pickupContactName,
          phone: booking.user.mobileNumber || booking.pickupPhoneNumber,
          email: booking.user.email,
        },
        pickup: {
          storeName: booking.pickupStoreName,
          address: `${booking.pickupAddress}, ${booking.pickupCity}, ${booking.pickupPostalCode}`,
          contact: `${booking.pickupContactName} (${booking.pickupPhoneNumber})`,
        },
        delivery: {
          destination: booking.destinationName || booking.returnAddressType || 'Destination Store',
          address: `${booking.returnAddress}, ${booking.returnCity}, ${booking.returnPostalCode}`,
          contact: `${booking.returnContactName} (${booking.returnPhoneNumber})`,
        },
        item: {
          category: booking.itemCategory,
          description: booking.itemDescription,
          quantity: booking.itemQuantity,
          condition: booking.itemCondition,
        },
        lineItems: [
          { description: 'Base Pickup Charge', amount: Number(booking.basePickupCharge) },
          { description: 'Distance Charge', amount: Number(booking.distanceCharge) },
          { description: 'Handling & Safety Fee', amount: Number(booking.handlingCharge) },
          {
            description: `Delivery Service (${booking.deliveryService})`,
            amount: Number(booking.deliveryServiceCharge),
          },
          ...(Number(booking.protectionCharge) > 0
            ? [
                {
                  description: 'Shipment Protection Cover (₹10,000)',
                  amount: Number(booking.protectionCharge),
                },
              ]
            : []),
        ],
        subtotal,
        discount,
        taxableAmount,
        taxes: [
          { name: 'CGST (9%)', rate: '9%', amount: cgst },
          { name: 'SGST (9%)', rate: '9%', amount: sgst },
        ],
        totalTax,
        grandTotal: Number(booking.totalAmount),
        currency: booking.currency || 'INR',
        payment: {
          method: booking.paymentMethod,
          status: booking.paymentStatus,
          reference: booking.paymentReference,
        },
      },
    },
  });
};

export const trackBooking: RequestHandler = async (req, res) => {
  const identifier = String(req.params.identifier || req.params.id);

  const booking = await prisma.returnPickupBooking.findFirst({
    where: {
      OR: [{ id: identifier }, { bookingNumber: identifier }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Tracking details not found for this return pickup request.');
  }

  const statusOrder: ReturnPickupStatus[] = [
    'CONFIRMED',
    'PICKUP_SCHEDULED',
    'PARTNER_ON_THE_WAY',
    'ARRIVED_AT_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'AT_DESTINATION',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
  ];

  const currentIndex = statusOrder.indexOf(booking.status);

  // Dynamic live simulated partner coordinates & speed based on status
  const baseLat = Number(booking.pickupLatitude) || 12.9716;
  const baseLng = Number(booking.pickupLongitude) || 77.5946;
  const destLat = Number(booking.returnLatitude) || 12.9352;
  const destLng = Number(booking.returnLongitude) || 77.6245;

  let partnerLat = baseLat;
  let partnerLng = baseLng;
  let eta = '15–20 min';
  let distanceRemainingKm = '2.3 km';
  let partnerSpeedKmh = 0;

  if (booking.status === 'PARTNER_ON_THE_WAY') {
    partnerLat = baseLat + 0.006;
    partnerLng = baseLng + 0.005;
    eta = '8–12 mins';
    distanceRemainingKm = '1.4 km';
    partnerSpeedKmh = 28;
  } else if (booking.status === 'ARRIVED_AT_PICKUP') {
    partnerLat = baseLat;
    partnerLng = baseLng;
    eta = 'Arrived at pickup location';
    distanceRemainingKm = '0.0 km';
    partnerSpeedKmh = 0;
  } else if (booking.status === 'PICKED_UP') {
    partnerLat = baseLat;
    partnerLng = baseLng;
    eta = 'Item picked up, heading to hub';
    distanceRemainingKm = '4.8 km';
    partnerSpeedKmh = 25;
  } else if (booking.status === 'IN_TRANSIT') {
    partnerLat = (baseLat + destLat) / 2;
    partnerLng = (baseLng + destLng) / 2;
    eta = 'In Transit to facility (Est. 45 mins)';
    distanceRemainingKm = '3.1 km';
    partnerSpeedKmh = 35;
  } else if (booking.status === 'AT_DESTINATION') {
    partnerLat = destLat + 0.002;
    partnerLng = destLng + 0.002;
    eta = 'At destination facility';
    distanceRemainingKm = '0.5 km';
    partnerSpeedKmh = 0;
  } else if (booking.status === 'OUT_FOR_DELIVERY') {
    partnerLat = destLat + 0.001;
    partnerLng = destLng + 0.001;
    eta = 'Out for final return delivery (10 mins)';
    distanceRemainingKm = '0.8 km';
    partnerSpeedKmh = 22;
  } else if (booking.status === 'DELIVERED') {
    partnerLat = destLat;
    partnerLng = destLng;
    eta = 'Delivered to seller';
    distanceRemainingKm = '0.0 km';
    partnerSpeedKmh = 0;
  }

  const milestones = [
    {
      key: 'RETURN_BOOKED',
      label: 'Return Booked',
      description: 'Your return request has been confirmed.',
      completed: true,
      timestamp: booking.confirmedAt || booking.createdAt,
    },
    {
      key: 'PICKUP_SCHEDULED',
      label: 'Pickup Scheduled',
      description: `Partner will arrive at pickup between ${booking.scheduledTimeSlot || '11:00 AM - 1:00 PM'}.`,
      completed: currentIndex >= 1 || booking.status === 'DELIVERED',
      timestamp:
        booking.pickupScheduledAt ||
        (booking.confirmedAt ? new Date(booking.confirmedAt.getTime() + 60000) : null),
    },
    {
      key: 'PARTNER_ON_THE_WAY',
      label: 'Partner On the Way',
      description: `Partner: ${booking.partnerName} • ${booking.partnerVehicle}`,
      completed: currentIndex >= 2 || booking.status === 'DELIVERED',
      timestamp: booking.partnerOnTheWayAt,
    },
    {
      key: 'ARRIVED_AT_PICKUP',
      label: 'Arrived at Pickup',
      description: 'Partner has arrived at your pickup address.',
      completed: currentIndex >= 3 || booking.status === 'DELIVERED',
      timestamp: booking.arrivedAtPickupAt,
    },
    {
      key: 'PICKED_UP',
      label: 'Picked Up',
      description: 'Item has been picked up from your location.',
      completed: currentIndex >= 4 || booking.status === 'DELIVERED',
      timestamp: booking.pickedUpAt,
    },
    {
      key: 'IN_TRANSIT',
      label: 'In Transit',
      description: `Your return is on the way. Location: ${booking.currentHubLocation || 'Tumkur Hub'}`,
      completed: currentIndex >= 5 || booking.status === 'DELIVERED',
      timestamp: booking.inTransitAt,
    },
    {
      key: 'AT_DESTINATION',
      label: 'At Destination Facility',
      description: 'Your return has reached destination facility (Bangalore Logistics Hub).',
      completed: currentIndex >= 6 || booking.status === 'DELIVERED',
      timestamp: booking.atDestinationAt,
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'Your return is out for final delivery to destination seller.',
      completed: currentIndex >= 7 || booking.status === 'DELIVERED',
      timestamp: booking.outForDeliveryAt,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Your return has been delivered successfully to destination seller.',
      completed: booking.status === 'DELIVERED',
      timestamp: booking.deliveredAt,
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(req, booking),
      tracking: {
        bookingId: booking.bookingNumber,
        currentStatus: booking.status,
        distanceKm: distanceRemainingKm,
        eta,
        estimatedDeliveryDate: '12 May 2026 by 8:00 PM',
        milestones,
        partner: {
          name: booking.partnerName || 'Ravi Kumar',
          phone: booking.partnerPhone || '+91 98765 43210',
          vehicle: booking.partnerVehicle || 'DL1Z 9876',
          rating: 4.9,
          hub: booking.currentHubLocation || 'Tumkur Hub',
          currentLocation: {
            latitude: partnerLat,
            longitude: partnerLng,
            speedKmh: partnerSpeedKmh,
            headingDegrees: 45,
          },
        },
        pickupLocation: {
          storeName: booking.pickupStoreName,
          address: booking.pickupAddress,
          city: booking.pickupCity,
          postalCode: booking.pickupPostalCode,
          latitude: baseLat,
          longitude: baseLng,
        },
        destinationLocation: {
          name: booking.destinationName || booking.returnAddressType,
          address: booking.returnAddress,
          city: booking.returnCity,
          postalCode: booking.returnPostalCode,
          latitude: destLat,
          longitude: destLng,
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

  const booking = await prisma.returnPickupBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!booking) throw new AppError(404, 'Return pickup booking not found.');

  if (type === 'PICKUP') {
    if (booking.pickupOtp !== String(otp).trim()) {
      throw new AppError(400, 'Invalid pickup verification OTP.');
    }
    const updated = await prisma.returnPickupBooking.update({
      where: { id: booking.id },
      data: {
        pickupOtpVerifiedAt: new Date(),
        status: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'Pickup OTP verified successfully. Return item picked up.',
      data: { booking: serializeBooking(req, updated) },
    });
    return;
  }

  if (type === 'DELIVERY') {
    if (booking.deliveryOtp !== String(otp).trim()) {
      throw new AppError(400, 'Invalid delivery verification OTP.');
    }
    const updated = await prisma.returnPickupBooking.update({
      where: { id: booking.id },
      data: {
        deliveryOtpVerifiedAt: new Date(),
        status: 'DELIVERED',
        deliveredAt: new Date(),
      },
    });
    res.status(200).json({
      status: 'success',
      message: 'Delivery OTP verified successfully. Return item delivered to destination.',
      data: { booking: serializeBooking(req, updated) },
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

  const result = await prisma.returnPickupBooking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: {
        in: [
          'CONFIRMED',
          'PAYMENT_PENDING',
          'PICKUP_SCHEDULED',
          'PARTNER_ON_THE_WAY',
          'ARRIVED_AT_PICKUP',
        ],
      },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason,
    },
  });

  if (result.count === 0) {
    const exists = await prisma.returnPickupBooking.findFirst({
      where: { id: bookingId, userId },
      select: { status: true },
    });
    if (!exists) throw new AppError(404, 'Return pickup booking not found.');
    throw new AppError(409, `A return request with status ${exists.status} cannot be cancelled.`);
  }

  const updated = await prisma.returnPickupBooking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const submitFeedback: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const { rating, reviewText } = req.body ?? {};

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    throw new AppError(400, 'Rating must be an integer between 1 and 5.');
  }

  const booking = await prisma.returnPickupBooking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new AppError(404, 'Return pickup booking not found.');

  const updated = await prisma.returnPickupBooking.update({
    where: { id: booking.id },
    data: {
      rating: Math.round(numRating),
      reviewText: typeof reviewText === 'string' ? reviewText.trim().slice(0, 500) : null,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Feedback submitted successfully.',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const completeSandboxPayment: RequestHandler = async (req, res) => {
  const input = validateSandboxPayment(req.body);
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const existing = await prisma.returnPickupBooking.findFirst({
    where: { id: bookingId, userId },
    include: { service: true },
  });

  if (!existing) throw new AppError(404, 'Return pickup booking not found.');
  if (existing.status === 'CANCELLED') {
    throw new AppError(409, 'A cancelled return booking cannot be paid.');
  }
  if (existing.paymentStatus === 'PAID') {
    res.status(200).json({
      status: 'success',
      data: {
        booking: serializeBooking(req, existing),
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
  const booking = await prisma.returnPickupBooking.update({
    where: { id: existing.id },
    data: {
      status: succeeded ? 'CONFIRMED' : 'PAYMENT_PENDING',
      paymentStatus: succeeded ? 'PAID' : 'FAILED',
      paymentProvider: SANDBOX_PAYMENT_PROVIDER,
      paymentReference: makeSandboxPaymentReference(input.outcome),
      confirmedAt: succeeded ? new Date() : null,
      pickupScheduledAt: succeeded ? new Date() : null,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(req, booking),
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
  const { status, hubLocation } = req.body ?? {};

  const validStatuses: ReturnPickupStatus[] = [
    'CONFIRMED',
    'PICKUP_SCHEDULED',
    'PARTNER_ON_THE_WAY',
    'ARRIVED_AT_PICKUP',
    'PICKED_UP',
    'IN_TRANSIT',
    'AT_DESTINATION',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const existing = await prisma.returnPickupBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!existing) throw new AppError(404, 'Return pickup booking not found.');

  const updateData: Prisma.ReturnPickupBookingUpdateInput = { status };
  const now = new Date();

  if (hubLocation && typeof hubLocation === 'string') {
    updateData.currentHubLocation = hubLocation.trim();
  }

  if (status === 'PICKUP_SCHEDULED' && !existing.pickupScheduledAt) {
    updateData.pickupScheduledAt = now;
  } else if (status === 'PARTNER_ON_THE_WAY' && !existing.partnerOnTheWayAt) {
    updateData.partnerOnTheWayAt = now;
  } else if (status === 'ARRIVED_AT_PICKUP' && !existing.arrivedAtPickupAt) {
    updateData.arrivedAtPickupAt = now;
  } else if (status === 'PICKED_UP' && !existing.pickedUpAt) {
    updateData.pickedUpAt = now;
  } else if (status === 'IN_TRANSIT' && !existing.inTransitAt) {
    updateData.inTransitAt = now;
  } else if (status === 'AT_DESTINATION' && !existing.atDestinationAt) {
    updateData.atDestinationAt = now;
  } else if (status === 'OUT_FOR_DELIVERY' && !existing.outForDeliveryAt) {
    updateData.outForDeliveryAt = now;
  } else if (status === 'DELIVERED' && !existing.deliveredAt) {
    updateData.deliveredAt = now;
  } else if (status === 'CANCELLED' && !existing.cancelledAt) {
    updateData.cancelledAt = now;
  }

  const updated = await prisma.returnPickupBooking.update({
    where: { id: existing.id },
    data: updateData,
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(req, updated) },
  });
};
