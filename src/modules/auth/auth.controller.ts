import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';

import { env } from '../../config/env.js';
import { AppError } from '../../lib/app-error.js';
import { createAccessToken, verifyAccessToken } from '../../lib/jwt.js';
import {
  createOtpChallengeId,
  createOtpCode,
  hashOtpCode,
  OTP_MAX_ATTEMPTS,
  otpCodeMatches,
} from '../../lib/otp.js';
import { prisma } from '../../lib/prisma.js';
import { type PublicUser, publicUserSelect } from '../../lib/public-user.js';
import {
  validateOtpLogin,
  validateOtpResend,
  validateOtpVerification,
  validateRegistration,
} from './auth.validation.js';

const createAuthResponse = (user: PublicUser, rememberMe = false) => {
  const { token, expiresIn } = createAccessToken(user.id, rememberMe);

  return {
    user,
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn,
  };
};

const maskMobileNumber = (mobileNumber: string): string => {
  const visibleDigits = mobileNumber.slice(-4);
  return `${'*'.repeat(Math.max(0, mobileNumber.length - 4))}${visibleDigits}`;
};

const createOtpChallenge = async (
  user: PublicUser,
  purpose: string,
  rememberMe = false,
) => {
  const challengeId = createOtpChallengeId();
  const otp = createOtpCode();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.OTP_EXPIRES_IN_MINUTES * 60 * 1000);

  await prisma.$transaction([
    prisma.authOtp.updateMany({
      where: { userId: user.id, consumedAt: null },
      data: { consumedAt: now },
    }),
    prisma.authOtp.create({
      data: {
        id: challengeId,
        userId: user.id,
        purpose,
        codeHash: hashOtpCode(challengeId, otp),
        rememberMe,
        expiresAt,
      },
    }),
  ]);

  return {
    otpRequired: true,
    challengeId,
    expiresAt,
    destination: `${user.countryCode} ${maskMobileNumber(user.mobileNumber)}`,
    ...(env.NODE_ENV === 'production'
      ? {}
      : { developmentOtp: otp, developmentOnly: true }),
  };
};

export const register: RequestHandler = async (req, res) => {
  const data = validateRegistration(req.body);

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { countryCode: data.countryCode, mobileNumber: data.mobileNumber },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
    select: {
      email: true,
      countryCode: true,
      mobileNumber: true,
    },
  });

  if (existingUser) {
    const isSamePhone =
      existingUser.countryCode === data.countryCode &&
      existingUser.mobileNumber === data.mobileNumber;

    throw new AppError(
      409,
      isSamePhone
        ? 'An account with this mobile number already exists.'
        : 'An account with this email address already exists.',
    );
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      countryCode: data.countryCode,
      mobileNumber: data.mobileNumber,
      email: data.email,
      passwordHash,
      termsAcceptedAt: new Date(),
    },
    select: publicUserSelect,
  });
  const challenge = await createOtpChallenge(user, 'REGISTER');

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Verify the OTP to continue.',
    data: challenge,
  });
};

export const login: RequestHandler = async (req, res) => {
  const hasPassword = Boolean(req.body?.password);

  if (hasPassword) {
    const rawIdentifier =
      req.body.email ?? req.body.identifier ?? req.body.username ?? req.body.mobileNumber ?? req.body.phone ?? '';
    const rawPassword = typeof req.body.password === 'string' ? req.body.password : '';

    if (!rawPassword) {
      throw new AppError(400, 'Password is required.');
    }

    const strIdentifier = String(rawIdentifier).trim();
    if (!strIdentifier) {
      throw new AppError(400, 'Please provide an email or mobile number to log in.');
    }

    const whereOrConditions: any[] = [];
    if (strIdentifier.includes('@')) {
      whereOrConditions.push({
        email: { equals: strIdentifier.toLowerCase(), mode: 'insensitive' as const },
      });
    } else {
      const cleanNumber = strIdentifier.replace(/\D/g, '');
      const countryCode = req.body.countryCode ? String(req.body.countryCode).trim() : '+91';
      whereOrConditions.push({
        countryCode,
        mobileNumber: cleanNumber,
      });
      whereOrConditions.push({
        mobileNumber: cleanNumber,
      });
    }

    const account = await prisma.user.findFirst({
      where: {
        OR: whereOrConditions,
      },
    });

    const passwordMatches = account
      ? await bcrypt.compare(rawPassword, account.passwordHash)
      : false;

    if (!account || !passwordMatches) {
      throw new AppError(401, 'Invalid login credentials or password.');
    }

    const user = await prisma.user.update({
      where: { id: account.id },
      data: { lastLoginAt: new Date() },
      select: publicUserSelect,
    });
    const { token, expiresIn } = createAccessToken(user.id, req.body.rememberMe === true);

    res.status(200).json({
      status: 'success',
      message: 'Login successful.',
      data: {
        user,
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn,
      },
    });
    return;
  }

  const data = validateOtpLogin(req.body);
  const user = await prisma.user.findUnique({
    where: {
      countryCode_mobileNumber: {
        countryCode: data.countryCode,
        mobileNumber: data.mobileNumber,
      },
    },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError(
      404,
      'No user account was found with this mobile number. Please sign up first.',
    );
  }

  const challenge = await createOtpChallenge(user, 'LOGIN', data.rememberMe);

  res.status(200).json({
    status: 'success',
    message: 'OTP generated successfully. Verify it to continue.',
    data: challenge,
  });
};

export const verifyOtp: RequestHandler = async (req, res) => {
  const data = validateOtpVerification(req.body);
  const challenge = await prisma.authOtp.findUnique({
    where: { id: data.challengeId },
    select: {
      id: true,
      userId: true,
      purpose: true,
      codeHash: true,
      rememberMe: true,
      attempts: true,
      expiresAt: true,
      consumedAt: true,
    },
  });

  if (!challenge || challenge.consumedAt) {
    throw new AppError(400, 'This OTP challenge is invalid or has already been used.');
  }

  const now = new Date();
  if (challenge.expiresAt <= now) {
    await prisma.authOtp.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: { consumedAt: now },
    });
    throw new AppError(
      400,
      'The OTP has expired. Please log in again to generate a new OTP.',
    );
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError(400, 'Too many incorrect OTP attempts. Please log in again.');
  }

  if (!otpCodeMatches(challenge.id, data.otp, challenge.codeHash)) {
    const attempts = challenge.attempts + 1;
    const attemptsRemaining = Math.max(0, OTP_MAX_ATTEMPTS - attempts);
    await prisma.authOtp.updateMany({
      where: { id: challenge.id, consumedAt: null },
      data: {
        attempts: { increment: 1 },
        ...(attemptsRemaining === 0 ? { consumedAt: now } : {}),
      },
    });
    throw new AppError(
      400,
      attemptsRemaining > 0
        ? `Invalid OTP. ${attemptsRemaining} attempts remaining.`
        : 'Too many incorrect OTP attempts. Please log in again.',
    );
  }

  const user = await prisma.$transaction(async (transaction) => {
    const consumed = await transaction.authOtp.updateMany({
      where: {
        id: challenge.id,
        codeHash: challenge.codeHash,
        consumedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: OTP_MAX_ATTEMPTS },
      },
      data: { consumedAt: now },
    });

    if (consumed.count !== 1) return null;

    return transaction.user.update({
      where: { id: challenge.userId },
      data: {
        mobileVerifiedAt: now,
        ...(challenge.purpose === 'LOGIN' ? { lastLoginAt: now } : {}),
      },
      select: publicUserSelect,
    });
  });

  if (!user || user.role !== 'USER') {
    throw new AppError(400, 'This OTP challenge is no longer valid.');
  }

  res.status(200).json({
    status: 'success',
    message: 'OTP verified successfully.',
    data: createAuthResponse(user, challenge.rememberMe),
  });
};

export const resendOtp: RequestHandler = async (req, res) => {
  const data = validateOtpResend(req.body);
  const previousChallenge = await prisma.authOtp.findUnique({
    where: { id: data.challengeId },
    select: {
      purpose: true,
      rememberMe: true,
      consumedAt: true,
      user: { select: publicUserSelect },
    },
  });

  if (!previousChallenge || previousChallenge.consumedAt) {
    throw new AppError(
      400,
      'This OTP challenge is invalid or has already been used.',
    );
  }

  if (previousChallenge.user.role !== 'USER') {
    throw new AppError(400, 'This OTP challenge cannot be resent.');
  }

  const challenge = await createOtpChallenge(
    previousChallenge.user,
    previousChallenge.purpose,
    previousChallenge.rememberMe,
  );

  res.status(200).json({
    status: 'success',
    message: 'A new OTP was generated successfully.',
    data: challenge,
  });
};

export const getCurrentUser: RequestHandler = (req, res) => {
  if (!req.user || !['USER', 'ADMIN'].includes(req.user.role)) {
    throw new AppError(403, 'A valid user account is required.');
  }

  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
};

export const checkAuthentication: RequestHandler = async (req, res) => {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    res.status(200).json({
      status: 'success',
      data: { isLoggedIn: false, user: null },
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    if (typeof payload !== 'object' || !payload.sub) {
      res.status(200).json({
        status: 'success',
        data: { isLoggedIn: false, user: null },
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect,
    });

    const isLoggedIn = user?.role === 'USER';

    res.status(200).json({
      status: 'success',
      data: { isLoggedIn, user: isLoggedIn ? user : null },
    });
  } catch (error: any) {
    if (
      ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(
        error?.name,
      )
    ) {
      res.status(200).json({
        status: 'success',
        data: { isLoggedIn: false, user: null },
      });
      return;
    }

    throw error;
  }
};

export const updateCurrentUser: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw new AppError(401, 'Please log in to continue.');
  }

  const userId = req.user.id;
  const { fullName, email } = req.body;

  const updateData: { fullName?: string; email?: string } = {};
  if (typeof fullName === 'string' && fullName.trim()) {
    updateData.fullName = fullName.trim();
  }
  if (typeof email === 'string' && email.trim()) {
    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findFirst({
      where: { email: cleanEmail, id: { not: userId } },
    });
    if (existing) {
      throw new AppError(409, 'This email address is already registered to another account.');
    }
    updateData.email = cleanEmail;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: publicUserSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully.',
    data: { user: updatedUser },
  });
};
