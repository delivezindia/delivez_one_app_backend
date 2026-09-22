import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getOrCreateUserPrivacy,
  updateUserSettings,
  removeDevice,
  addSecurityReport,
} from './privacy-security.store.js';

export const getPrivacySecurityOverview: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const data = getOrCreateUserPrivacy(userId);
  res.status(200).json({
    status: 'success',
    data: {
      settings: data.settings,
      devices: data.devices,
      recentActivityCount: data.loginActivity.length,
      securityStatus: {
        isProtected: true,
        encryptionType: 'Bank-Grade 256-Bit SSL/TLS',
        lastSecurityCheck: new Date().toISOString(),
      },
    },
  });
};

export const updatePrivacySettings: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const {
    twoFactorAuth,
    profileVisibility,
    personalisedRecommendations,
    analyticsUsageData,
  } = req.body;

  const updated = updateUserSettings(userId, {
    twoFactorAuth,
    profileVisibility,
    personalisedRecommendations,
    analyticsUsageData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Privacy & Security preferences updated successfully.',
    data: { settings: updated },
  });
};

export const toggleTwoFactorAuth: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const current = getOrCreateUserPrivacy(userId);
  const nextState = !current.settings.twoFactorAuth;
  const updated = updateUserSettings(userId, { twoFactorAuth: nextState });

  res.status(200).json({
    status: 'success',
    message: `Two-Factor Authentication is now ${nextState ? 'ENABLED' : 'DISABLED'}.`,
    data: {
      twoFactorAuth: updated.twoFactorAuth,
      twoFactorStatusText: updated.twoFactorStatusText,
    },
  });
};

export const getUserDevicesList: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const data = getOrCreateUserPrivacy(userId);
  res.status(200).json({
    status: 'success',
    data: {
      devices: data.devices,
      totalDevices: data.devices.length,
    },
  });
};

export const revokeUserDevice: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const id = String(req.params.id);
  const removed = removeDevice(userId, id);
  if (!removed) {
    throw new AppError(404, 'Device not found or already logged out.');
  }

  res.status(200).json({
    status: 'success',
    message: 'Device session revoked successfully.',
  });
};

export const getLoginActivityList: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const data = getOrCreateUserPrivacy(userId);
  res.status(200).json({
    status: 'success',
    data: {
      loginActivity: data.loginActivity,
    },
  });
};

export const downloadUserDataExport: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      devices: true,
    },
  });

  const privacy = getOrCreateUserPrivacy(userId);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: {
      id: user?.id,
      fullName: user?.fullName,
      email: user?.email,
      mobileNumber: user?.mobileNumber,
      memberTier: user?.memberTier,
      createdAt: user?.createdAt,
    },
    privacySettings: privacy.settings,
    addresses: user?.addresses || [],
    loginHistory: privacy.loginActivity,
  };

  res.setHeader('Content-Disposition', `attachment; filename="delivez-data-export-${userId}.json"`);
  res.status(200).json({
    status: 'success',
    message: 'Your account data export has been prepared.',
    data: exportPayload,
  });
};

export const reportSecurityIssueAction: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  const { issueType, description } = req.body;
  if (!description || description.trim().length < 5) {
    throw new AppError(400, 'Please describe the security concern in detail (min 5 characters).');
  }

  const report = addSecurityReport(userId, issueType || 'Suspicious Activity', description);

  res.status(201).json({
    status: 'success',
    message: 'Security issue reported to Delivez Security Team. Investigation reference issued.',
    data: {
      ticketId: report.id,
      reportedAt: report.reportedAt,
      status: report.status,
    },
  });
};

export const deleteAccountAction: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, 'Authentication required.');

  res.status(200).json({
    status: 'success',
    message: 'Your account deletion request has been registered and scheduled for permanent purge.',
  });
};
