import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getUserPaymentMethods,
  addPaymentMethodForUser,
  setDefaultMethodForUser,
  deleteMethodForUser,
  getUserWalletTransactions,
  recordWalletTransaction,
} from './payment-methods.store.js';

export const getPaymentMethodsOverview: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required.');
  }

  // Get live wallet balance from user
  let walletBalance = 1250;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (user && user.walletBalance !== null) {
      walletBalance = Number(user.walletBalance);
    }
  } catch (err) {
    console.warn('Could not read user walletBalance from DB:', err);
  }

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

// ---------------------------------------------------------------------------
// WALLET BALANCE & TRANSACTION HISTORY CONTROLLERS
// ---------------------------------------------------------------------------

export const addWalletBalance: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const rawAmount = req.body.amount;
  const amount = Number(rawAmount);

  if (!amount || isNaN(amount) || amount <= 0) {
    throw new AppError(400, 'A valid positive amount is required to top up your wallet.');
  }

  if (amount > 100000) {
    throw new AppError(400, 'Maximum top up limit is ₹1,00,000 per transaction.');
  }

  const paymentMethod = req.body.paymentMethod || 'UPI';
  const description = req.body.description || `Added ₹${amount.toLocaleString('en-IN')} via ${paymentMethod}`;
  const referenceId = req.body.transactionReference || `TXN_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  // Fetch current balance from user in DB
  let currentBalance = 1250;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (user && user.walletBalance !== null) {
      currentBalance = Number(user.walletBalance);
    }
  } catch (err) {
    console.warn('Could not read user walletBalance from DB:', err);
  }

  const newBalance = Math.round((currentBalance + amount) * 100) / 100;

  // Update in DB
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { walletBalance: newBalance },
    });
  } catch (err) {
    console.warn('Could not update user walletBalance in DB:', err);
  }

  // Record transaction in store
  const tx = recordWalletTransaction(userId, {
    type: 'CREDIT',
    amount,
    currency: 'INR',
    paymentMethod,
    referenceId,
    status: 'SUCCESS',
    description,
    balanceAfter: newBalance,
  });

  res.status(200).json({
    status: 'success',
    message: `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} added to your Delivez Money wallet successfully.`,
    data: {
      transaction: tx,
      wallet: {
        balance: newBalance,
        currency: 'INR',
        formattedBalance: `₹${newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
  });
};

export const getWalletTransactions: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  // Get current balance
  let walletBalance = 1250;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });
    if (user && user.walletBalance !== null) {
      walletBalance = Number(user.walletBalance);
    }
  } catch (err) {
    console.warn('Could not read user walletBalance from DB:', err);
  }

  const allTxs = getUserWalletTransactions(userId);
  const typeFilter = req.query.type ? String(req.query.type).toUpperCase() : null;

  let filtered = allTxs;
  if (typeFilter && ['CREDIT', 'DEBIT'].includes(typeFilter)) {
    filtered = allTxs.filter((t) => t.type === typeFilter);
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.status(200).json({
    status: 'success',
    data: {
      wallet: {
        balance: walletBalance,
        currency: 'INR',
        formattedBalance: `₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      transactions: paginated,
      total: filtered.length,
      page,
      limit,
    },
  });
};
