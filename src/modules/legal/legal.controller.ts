import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from './legal.store.js';

export const getTermsAndConditions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: TERMS_AND_CONDITIONS,
  });
};

export const agreeToTermsAndConditions: RequestHandler = async (req, res) => {
  const userId = (req as any).user?.id;
  const now = new Date();

  if (userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { termsAcceptedAt: now },
      });
    } catch (err) {
      console.error('Failed to update termsAcceptedAt on user:', err);
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Terms & Conditions accepted successfully.',
    data: {
      acceptedAt: now.toISOString(),
      termsVersion: TERMS_AND_CONDITIONS.lastUpdated,
    },
  });
};

export const getPrivacyPolicy: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: PRIVACY_POLICY,
  });
};

export const acknowledgePrivacyPolicy: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  res.status(200).json({
    status: 'success',
    message: 'Privacy Policy acknowledgment recorded.',
    data: {
      acknowledgedAt: new Date().toISOString(),
      userId: userId || 'anonymous',
    },
  });
};
