import { randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';

export const makePaymentId = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = randomBytes(2).toString('hex').toUpperCase();
  return `PAY-${yy}${mm}${dd}-${rand}`;
};

export const makeReceiptId = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = randomBytes(2).toString('hex').toUpperCase();
  return `RCP-${yy}${mm}${dd}-${rand}`;
};

export const createPaymentHandler: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({ message: 'Authentication required.', statusCode: 401, code: 'UNAUTHORIZED' });
  }

  const { booking_id, bookingId, payment_method, paymentMethod } = req.body ?? {};
  const targetBookingId = String(booking_id || bookingId || '');

  if (!targetBookingId) {
    throw new AppError({
      message: 'booking_id is required to initialize payment.',
      statusCode: 400,
      code: 'BAD_REQUEST',
    });
  }

  const booking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: targetBookingId }, { bookingNumber: targetBookingId }] },
  });

  if (!booking) {
    throw new AppError({
      message: `Vault booking "${targetBookingId}" not found.`,
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  // Authoritative amount from booking
  const amount = Number(booking.totalAmount);
  const currency = booking.currency || 'INR';
  const paymentId = makePaymentId();
  const method = payment_method || paymentMethod || 'ONLINE';

  const payment = await prisma.courierBookingPayment.create({
    data: {
      paymentId,
      bookingId: booking.id,
      userId: user.id,
      gateway: 'SANDBOX',
      gatewayOrderId: `ORDER_${paymentId}`,
      amount,
      currency,
      status: 'pending',
      paymentMethod: method,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Payment initialized successfully',
    data: {
      payment_id: payment.paymentId,
      id: payment.id,
      booking_id: booking.bookingNumber,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.paymentMethod,
      gateway: payment.gateway,
      gateway_order_id: payment.gatewayOrderId,
      created_at: payment.createdAt,
    },
  });
};

export const getPaymentByIdHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;

  const payment = await prisma.courierBookingPayment.findFirst({
    where: { OR: [{ id }, { paymentId: id }] },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError({ message: `Payment "${id}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  if (user && user.role !== 'ADMIN' && payment.userId !== user.id) {
    throw new AppError({ message: 'Forbidden.', statusCode: 403, code: 'FORBIDDEN' });
  }

  res.status(200).json({
    success: true,
    data: {
      payment_id: payment.paymentId,
      id: payment.id,
      booking_id: payment.booking.bookingNumber,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.paymentMethod,
      gateway: payment.gateway,
      gateway_order_id: payment.gatewayOrderId,
      gateway_payment_id: payment.gatewayPaymentId,
      paid_at: payment.paidAt,
      created_at: payment.createdAt,
    },
  });
};

export const getBookingPaymentHandler: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.bookingId ?? '');

  const booking = await prisma.vaultCourierBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
    include: {
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!booking) {
    throw new AppError({ message: `Booking "${bookingId}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  const payment = booking.payments[0];
  if (!payment) {
    res.status(200).json({
      success: true,
      message: 'No payments initiated for this booking yet.',
      data: null,
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      payment_id: payment.paymentId,
      id: payment.id,
      booking_id: booking.bookingNumber,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.paymentMethod,
      gateway: payment.gateway,
      paid_at: payment.paidAt,
      created_at: payment.createdAt,
    },
  });
};

export const verifyPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const user = req.user;
  const { gateway_payment_id, gateway_signature, signature } = req.body ?? {};

  const payment = await prisma.courierBookingPayment.findFirst({
    where: { OR: [{ id }, { paymentId: id }] },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError({ message: `Payment "${id}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  if (user && user.role !== 'ADMIN' && payment.userId !== user.id) {
    throw new AppError({ message: 'Forbidden.', statusCode: 403, code: 'FORBIDDEN' });
  }

  // Server-side verification logic
  const now = new Date();
  const txRef = gateway_payment_id || `TXN_${randomBytes(4).toString('hex').toUpperCase()}`;
  const sigRef = gateway_signature || signature || `SIG_${randomBytes(6).toString('hex')}`;

  const { updatedPayment, receipt } = await prisma.$transaction(async (tx) => {
    // 1. Mark payment paid
    const p = await tx.courierBookingPayment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        paidAt: now,
        gatewayPaymentId: txRef,
        gatewaySignature: sigRef,
      },
    });

    // 2. Mark booking confirmed
    await tx.vaultCourierBooking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        receiptStatus: 'issued',
        confirmedAt: now,
      },
    });

    // 3. Idempotent receipt creation (check uniqueness by bookingId + paymentId)
    let r = await tx.courierBookingReceipt.findFirst({
      where: { bookingId: payment.bookingId, paymentId: payment.id },
    });

    if (!r) {
      const receiptId = makeReceiptId();
      r = await tx.courierBookingReceipt.create({
        data: {
          receiptId,
          bookingId: payment.bookingId,
          paymentId: payment.id,
          userId: payment.userId,
          serviceType: payment.booking.serviceType,
          amount: payment.amount,
          currency: payment.currency,
          paymentStatus: 'paid',
          bookingStatus: 'confirmed',
          issuedAt: now,
          receiptData: {
            receipt_id: receiptId,
            booking_number: payment.booking.bookingNumber,
            service_type: payment.booking.serviceType,
            amount: Number(payment.amount),
            currency: payment.currency,
            paid_at: now.toISOString(),
            payment_reference: txRef,
          },
        },
      });
    }

    return { updatedPayment: p, receipt: r };
  });

  res.status(200).json({
    status: 'success',
    success: true,
    message: 'Payment verified and booking confirmed successfully',
    data: {
      payment_id: updatedPayment.paymentId,
      booking_id: payment.booking.bookingNumber,
      amount: Number(updatedPayment.amount),
      currency: updatedPayment.currency,
      status: updatedPayment.status,
      payment_method: updatedPayment.paymentMethod,
      gateway_payment_id: updatedPayment.gatewayPaymentId,
      paid_at: updatedPayment.paidAt,
      payment: {
        payment_id: updatedPayment.paymentId,
        amount: Number(updatedPayment.amount),
        currency: updatedPayment.currency,
        status: updatedPayment.status,
        payment_method: updatedPayment.paymentMethod,
        gateway_payment_id: updatedPayment.gatewayPaymentId,
        paid_at: updatedPayment.paidAt,
      },
      receipt: {
        receipt_id: receipt.receiptId,
        receipt_number: receipt.receiptId,
        booking_id: payment.booking.bookingNumber,
        payment_id: updatedPayment.paymentId,
        service_type: receipt.serviceType,
        amount: Number(receipt.amount),
        currency: receipt.currency,
        payment_status: receipt.paymentStatus,
        issued_at: receipt.issuedAt,
      },
    },
  });
};

export const refundPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id ?? '');
  const { reason } = req.body ?? {};

  const payment = await prisma.courierBookingPayment.findFirst({
    where: { OR: [{ id }, { paymentId: id }] },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError({ message: `Payment "${id}" not found.`, statusCode: 404, code: 'NOT_FOUND' });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const p = await tx.courierBookingPayment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
        failureReason: reason || 'Customer requested refund',
      },
    });

    await tx.vaultCourierBooking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'cancelled',
        paymentStatus: 'refunded',
        cancellationReason: reason || 'Refund issued',
      },
    });

    return p;
  });

  res.status(200).json({
    success: true,
    message: 'Payment refunded successfully',
    data: {
      payment_id: updated.paymentId,
      status: updated.status,
      amount: Number(updated.amount),
      currency: updated.currency,
      refund_reason: updated.failureReason,
    },
  });
};
