import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';

import { AppError } from '../../lib/app-error.js';
import { createAccessToken } from '../../lib/jwt.js';
import { prisma } from '../../lib/prisma.js';
import { publicUserSelect } from '../../lib/public-user.js';
import { validateAdminLogin } from '../auth/auth.validation.js';

export const adminLogin: RequestHandler = async (req, res) => {
  const data = validateAdminLogin(req.body);

  const whereOrConditions: any[] = [];
  if (data.email) {
    whereOrConditions.push({
      email: { equals: data.email, mode: 'insensitive' as const },
    });
  }
  if (data.mobileNumber) {
    whereOrConditions.push({
      countryCode: data.countryCode,
      mobileNumber: data.mobileNumber,
    });
    whereOrConditions.push({
      mobileNumber: data.mobileNumber,
    });
  }

  const account = await prisma.user.findFirst({
    where: {
      OR: whereOrConditions,
    },
  });

  const passwordMatches = account?.passwordHash
    ? await bcrypt.compare(data.password, account.passwordHash)
    : false;

  if (!account || !passwordMatches || account.role !== 'ADMIN') {
    throw new AppError(401, 'Invalid administrator credentials.');
  }

  const user = await prisma.user.update({
    where: { id: account.id },
    data: { lastLoginAt: new Date() },
    select: publicUserSelect,
  });
  const { token, expiresIn } = createAccessToken(user.id, data.rememberMe);

  res.status(200).json({
    status: 'success',
    message: 'Administrator login successful.',
    data: {
      user,
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
    },
  });
};

export const getAdminProfile: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
};

export const listUsers: RequestHandler = async (req, res) => {
  const requestedPage = Number.parseInt(String(req.query.page), 10);
  const requestedLimit = Number.parseInt(String(req.query.limit), 10);
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 20;
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { mobileNumber: { contains: search } },
        ],
      }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: { users, total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
  });
};

export const getUserDetails: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      ...publicUserSelect,
      addresses: {
        orderBy: { createdAt: 'desc' },
      },
      courierBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, serviceType: true, createdAt: true },
      },
      confidentialCourierBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, documentType: true, createdAt: true },
      },
      forgotSomethingBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, itemCategory: true, createdAt: true },
      },
      returnPickupBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, itemCategory: true, destinationName: true, createdAt: true },
      },
      giftDeliveryBookings: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, bookingNumber: true, status: true, totalAmount: true, productName: true, recipientName: true, deliveryCity: true, createdAt: true },
      },
    },
  });

  if (!user) throw new AppError(404, 'User not found.');

  const totalCourier = user.courierBookings.length;
  const totalConfidential = user.confidentialCourierBookings.length;
  const totalForgot = user.forgotSomethingBookings.length;
  const totalReturn = user.returnPickupBookings.length;
  const totalGift = user.giftDeliveryBookings.length;
  const lifetimeBookings = totalCourier + totalConfidential + totalForgot + totalReturn + totalGift;

  res.status(200).json({
    status: 'success',
    data: {
      user,
      stats: {
        lifetimeBookings,
        addressesCount: user.addresses.length,
      },
    },
  });
};

export const updateUserRole: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { role } = req.body;
  if (!['USER', 'ADMIN', 'DRIVER'].includes(role)) {
    throw new AppError(400, 'Invalid user role specified.');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: role as any },
    select: publicUserSelect,
  });

  res.status(200).json({
    status: 'success',
    message: `User role updated to ${role}.`,
    data: { user: updated },
  });
};

export const deleteUser: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'User not found.');
  if (existing.role === 'ADMIN') throw new AppError(400, 'Cannot delete an administrator account.');

  await prisma.user.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'User removed successfully.',
  });
};
