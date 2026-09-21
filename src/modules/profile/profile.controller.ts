import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import fs from 'node:fs';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import { publicUserSelect } from '../../lib/public-user.js';

export const getProfile: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const [user, addresses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    }),
    prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    }),
  ]);

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        ...user,
        walletBalance: Number(user.walletBalance ?? 0),
      },
      addresses,
    },
  });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const {
    fullName,
    email,
    alternatePhone,
    dateOfBirth,
    gender,
    address,
    emergencyContactName,
    emergencyContactPhone,
    memberTier,
  } = req.body;

  const updateData: Record<string, any> = {};

  if (fullName !== undefined) updateData.fullName = String(fullName).trim();
  if (email !== undefined) updateData.email = email ? String(email).trim().toLowerCase() : null;
  if (alternatePhone !== undefined) updateData.alternatePhone = alternatePhone ? String(alternatePhone).trim() : null;
  if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? String(dateOfBirth).trim() : null;
  if (gender !== undefined) updateData.gender = gender ? String(gender).trim() : null;
  if (address !== undefined) updateData.address = address ? String(address).trim() : null;
  if (emergencyContactName !== undefined) updateData.emergencyContactName = emergencyContactName ? String(emergencyContactName).trim() : null;
  if (emergencyContactPhone !== undefined) updateData.emergencyContactPhone = emergencyContactPhone ? String(emergencyContactPhone).trim() : null;
  if (memberTier !== undefined) updateData.memberTier = String(memberTier).trim();

  // If updating email, check uniqueness
  if (updateData.email) {
    const existing = await prisma.user.findFirst({
      where: {
        email: updateData.email,
        id: { not: userId },
      },
    });
    if (existing) {
      throw new AppError(409, 'This email address is already in use by another account.');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: publicUserSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    data: {
      user: {
        ...updatedUser,
        walletBalance: Number(updatedUser.walletBalance ?? 0),
      },
    },
  });
};

export const uploadAvatar: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  if (!req.file) {
    throw new AppError(400, 'No avatar file was uploaded.');
  }

  // Construct URL for client
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: publicUserSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Avatar uploaded successfully.',
    data: {
      avatarUrl,
      user: {
        ...updatedUser,
        walletBalance: Number(updatedUser.walletBalance ?? 0),
      },
    },
  });
};

export const removeAvatar: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });

  if (existing?.avatarUrl && existing.avatarUrl.startsWith('/uploads/avatars/')) {
    const filePath = path.resolve(process.cwd(), existing.avatarUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Could not delete old avatar file:', err);
      }
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: publicUserSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Avatar removed successfully.',
    data: {
      user: {
        ...updatedUser,
        walletBalance: Number(updatedUser.walletBalance ?? 0),
      },
    },
  });
};

export const changePassword: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    throw new AppError(400, 'New password must be at least 8 characters long.');
  }

  if (newPassword !== confirmPassword) {
    throw new AppError(400, 'New password and confirmation password do not match.');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new AppError(404, 'User not found.');
  }

  // If user already has a password set, require and verify currentPassword
  if (user.passwordHash) {
    if (!currentPassword) {
      throw new AppError(400, 'Current password is required.');
    }
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError(400, 'Current password is incorrect.');
    }
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  res.status(200).json({
    status: 'success',
    message: 'Password changed successfully.',
  });
};

export const updateNotifications: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { pushNotifications, shipmentUpdates, offersPromotions, newsUpdates } = req.body;

  const updateData: Record<string, boolean> = {};
  if (typeof pushNotifications === 'boolean') updateData.pushNotifications = pushNotifications;
  if (typeof shipmentUpdates === 'boolean') updateData.shipmentUpdates = shipmentUpdates;
  if (typeof offersPromotions === 'boolean') updateData.offersPromotions = offersPromotions;
  if (typeof newsUpdates === 'boolean') updateData.newsUpdates = newsUpdates;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      pushNotifications: true,
      shipmentUpdates: true,
      offersPromotions: true,
      newsUpdates: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Notification preferences updated.',
    data: { notifications: updatedUser },
  });
};

export const updatePreferences: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { theme, language, defaultPickupAddress, defaultPackageType } = req.body;

  const updateData: Record<string, string> = {};
  if (theme && (theme === 'light' || theme === 'dark')) updateData.theme = theme;
  if (language && typeof language === 'string') updateData.language = language.trim();
  if (defaultPickupAddress && typeof defaultPickupAddress === 'string') {
    updateData.defaultPickupAddress = defaultPickupAddress.trim();
  }
  if (defaultPackageType && typeof defaultPackageType === 'string') {
    updateData.defaultPackageType = defaultPackageType.trim();
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      theme: true,
      language: true,
      defaultPickupAddress: true,
      defaultPackageType: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'App preferences updated.',
    data: { preferences: updatedUser },
  });
};

export const addWalletMoney: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const amount = Number(req.body.amount);

  if (isNaN(amount) || amount <= 0) {
    throw new AppError(400, 'Please enter a valid amount greater than 0.');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      walletBalance: { increment: amount },
    },
    select: {
      walletBalance: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `₹${amount.toFixed(2)} added to wallet successfully.`,
    data: {
      walletBalance: Number(updatedUser.walletBalance),
    },
  });
};
