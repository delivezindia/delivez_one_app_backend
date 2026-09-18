import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { makeReceiptId } from './vault-payment.controller.js';

export const createReceiptHandler: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({ message: 'Authentication required.', statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const { booking_id, bookingId, payment_id, paymentId } = req.body ?? {};
  const targetBookingId = String(booking_id || bookingId || '');
  const targetPaymentId = String(payment_id || paymentId || '');

  if (!targetBookingId) {
    throw new AppError({ message: 'booking_id is required to create a receipt.', statusCode: 400, code: 'BAD_REQUEST' });
  }

  const booking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: targetBookingId }, { bookingNumber: targetBookingId }] },
    include: { payments: true },
  });

  if (!booking) {
    throw new AppError({ message: `Booking "${targetBookingId}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  const payment = targetPaymentId
    ? await prisma.courierBookingPayment.findFirst({
        where: { OR: [{ id: targetPaymentId }, { paymentId: targetPaymentId }] },
      })
    : booking.payments[0];

  // 1. Idempotency Check: Do not create duplicate receipts
  const existingReceipt = await prisma.courierBookingReceipt.findFirst({
    where: {
      bookingId: booking.id,
      ...(payment ? { paymentId: payment.id } : {}),
    },
  });

  if (existingReceipt) {
    res.status(200).json({
      success: true,
      message: 'Receipt already exists (idempotent)',
      data: {
        receipt_id: existingReceipt.receiptId,
        id: existingReceipt.id,
        booking_id: booking.bookingNumber,
        payment_id: payment ? payment.paymentId : null,
        service_type: existingReceipt.serviceType,
        amount: Number(existingReceipt.amount),
        currency: existingReceipt.currency,
        payment_status: existingReceipt.paymentStatus,
        issued_at: existingReceipt.issuedAt,
        receipt_data: existingReceipt.receiptData,
      },
    });
    return;
  }

  const receiptId = makeReceiptId();
  const amount = payment ? payment.amount : booking.totalAmount;
  const issuedAt = new Date();

  const receipt = await prisma.courierBookingReceipt.create({
    data: {
      receiptId,
      bookingId: booking.id,
      paymentId: payment?.id ?? null,
      userId: user.id,
      serviceType: booking.serviceType,
      amount,
      currency: booking.currency,
      paymentStatus: payment ? payment.status : booking.paymentStatus,
      bookingStatus: booking.status,
      issuedAt,
      receiptData: {
        receipt_id: receiptId,
        booking_number: booking.bookingNumber,
        service_type: booking.serviceType,
        amount: Number(amount),
        currency: booking.currency,
        issued_at: issuedAt.toISOString(),
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Receipt created successfully',
    data: {
      receipt_id: receipt.receiptId,
      id: receipt.id,
      booking_id: booking.bookingNumber,
      payment_id: payment ? payment.paymentId : null,
      service_type: receipt.serviceType,
      amount: Number(receipt.amount),
      currency: receipt.currency,
      payment_status: receipt.paymentStatus,
      issued_at: receipt.issuedAt,
      receipt_data: receipt.receiptData,
    },
  });
};

export const listReceiptsHandler: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({ message: 'Authentication required.', statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const where: any = {};
  if (user.role !== 'ADMIN') {
    where.userId = user.id;
  }

  const receipts = await prisma.courierBookingReceipt.findMany({
    where,
    include: { booking: true, payment: true },
    orderBy: { issuedAt: 'desc' },
  });

  res.status(200).json({
    success: true,
    data: receipts.map((r) => ({
      receipt_id: r.receiptId,
      id: r.id,
      booking_id: r.booking.bookingNumber,
      payment_id: r.payment?.paymentId ?? null,
      service_type: r.serviceType,
      amount: Number(r.amount),
      currency: r.currency,
      payment_status: r.paymentStatus,
      issued_at: r.issuedAt,
    })),
  });
};

export const getReceiptByIdHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;

  const receipt = await prisma.courierBookingReceipt.findFirst({
    where: { OR: [{ id }, { receiptId: id }] },
    include: { booking: true, payment: true },
  });

  if (!receipt) {
    throw new AppError({ message: `Receipt "${id}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  if (user && user.role !== 'ADMIN' && receipt.userId !== user.id) {
    throw new AppError({ message: 'Forbidden.', statusCode: 403, code: 'FORBIDDEN' });
  }

  res.status(200).json({
    success: true,
    data: {
      receipt_id: receipt.receiptId,
      id: receipt.id,
      booking_id: receipt.booking.bookingNumber,
      payment_id: receipt.payment?.paymentId ?? null,
      service_type: receipt.serviceType,
      amount: Number(receipt.amount),
      currency: receipt.currency,
      payment_status: receipt.paymentStatus,
      issued_at: receipt.issuedAt,
      receipt_data: receipt.receiptData,
    },
  });
};

export const getBookingReceiptHandler: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.bookingId ?? '');

  const booking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
    include: {
      receipts: { orderBy: { issuedAt: 'desc' }, take: 1 },
      payments: { take: 1 },
    },
  });

  if (!booking) {
    throw new AppError({ message: `Booking "${bookingId}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  const receipt = booking.receipts[0];
  if (!receipt) {
    res.status(200).json({
      success: true,
      message: 'No receipt issued for this booking yet.',
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      receipt_id: receipt.receiptId,
      id: receipt.id,
      booking_id: booking.bookingNumber,
      payment_id: booking.payments[0]?.paymentId ?? null,
      service_type: receipt.serviceType,
      amount: Number(receipt.amount),
      currency: receipt.currency,
      payment_status: receipt.paymentStatus,
      issued_at: receipt.issuedAt,
      receipt_data: receipt.receiptData,
    },
  });
};
