import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getUserPaymentMethods,
  addPaymentMethodForUser,
  setDefaultMethodForUser,
  deleteMethodForUser,
} from './payment-methods.store.js';

export const getPaymentMethodsOverview: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required.');
  }

  // Get live wallet balance from user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { walletBalance: true },
  });

  const walletBalance = Number(user?.walletBalance ?? 11250);
  const savedMethods = getUserPaymentMethods(userId);

  res.status(200).json({
    status: 'success',
    data: {
      delivezMoney: {
        balance: walletBalance,
        currency: 'INR',
        formattedBalance: `₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        description: 'Add money to your wallet and enjoy faster checkouts, exclusive offers and rewards.',
      },
      savedMethods,
      availableTypes: [
        {
          type: 'CREDIT_CARD',
          title: 'Credit or Debit Card',
          description: 'Add Visa, Mastercard, RuPay or other cards',
          icon: 'credit-card',
        },
        {
          type: 'UPI',
          title: 'UPI',
          description: 'Link your UPI ID (Google Pay, PhonePe, Paytm, etc.)',
          icon: 'qr-code',
        },
        {
          type: 'WALLET',
          title: 'Wallet',
          description: 'Add Paytm, Amazon Pay or other wallets',
          icon: 'wallet',
        },
        {
          type: 'NET_BANKING',
          title: 'Net Banking',
          description: 'Pay directly from your bank account',
          icon: 'landmark',
        },
      ],
    },
  });
};

export const createPaymentMethod: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const { type, cardHolderName, cardBrand, cardNumber, expiryDate, upiId, walletProvider, linkedPhone, bankName, isDefault } = req.body;

  if (!type) {
    throw new AppError(400, 'Payment method type is required.');
  }

  const validTypes = ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'NET_BANKING'];
  if (!validTypes.includes(type)) {
    throw new AppError(400, `Invalid payment method type. Supported types: ${validTypes.join(', ')}`);
  }

  const method = addPaymentMethodForUser(userId, type, {
    cardHolderName,
    cardBrand,
    cardNumber,
    expiryDate,
    upiId,
    walletProvider,
    linkedPhone,
    bankName,
    isDefault,
  });

  res.status(201).json({
    status: 'success',
    message: 'Payment method added successfully.',
    data: { paymentMethod: method },
  });
};

export const setDefaultPaymentMethod: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const id = String(req.params.id);
  const updated = setDefaultMethodForUser(userId, id);
  if (!updated) {
    throw new AppError(404, 'Payment method not found.');
  }

  res.status(200).json({
    status: 'success',
    message: `${updated.title} set as default payment method.`,
    data: { paymentMethod: updated },
  });
};

export const deletePaymentMethod: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const id = String(req.params.id);
  const success = deleteMethodForUser(userId, id);
  if (!success) {
    throw new AppError(404, 'Payment method not found.');
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment method removed successfully.',
  });
};
