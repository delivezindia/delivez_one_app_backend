import { AppError } from '../../lib/app-error.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

const normalizeCountryCode = (value: unknown = '+91'): string => {
  const normalized = String(value).replace(/[\s()-]/g, '');
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
};

const normalizeMobileNumber = (value: unknown): string =>
  String(value ?? '').replace(/\D/g, '');

const normalizeEmail = (value: unknown): string =>
  String(value ?? '').trim().toLowerCase();

const validatePhone = (countryCode: string, mobileNumber: string): void => {
  if (!/^\+\d{1,4}$/.test(countryCode)) {
    throw new AppError(400, 'countryCode must look like +91.');
  }

  if (!/^\d{7,15}$/.test(mobileNumber)) {
    throw new AppError(400, 'mobileNumber must contain 7 to 15 digits.');
  }
};

export const validateRegistration = (body: Record<string, any> = {}) => {
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const countryCode = normalizeCountryCode(body.countryCode);
  const mobileNumber = normalizeMobileNumber(body.mobileNumber);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword =
    typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (fullName.length < 2 || fullName.length > 100) {
    throw new AppError(400, 'fullName must contain 2 to 100 characters.');
  }

  validatePhone(countryCode, mobileNumber);

  if (email && !EMAIL_PATTERN.test(email)) {
    throw new AppError(400, 'email must be valid when provided.');
  }

  if (!PASSWORD_PATTERN.test(password)) {
    throw new AppError(
      400,
      'password must be 8 to 72 characters and include uppercase, lowercase, and a number.',
    );
  }

  if (password !== confirmPassword) {
    throw new AppError(400, 'password and confirmPassword do not match.');
  }

  if (body.acceptedTerms !== true) {
    throw new AppError(400, 'acceptedTerms must be true.');
  }

  return {
    fullName,
    countryCode,
    mobileNumber,
    email: email || null,
    password,
  };
};

export const validateLogin = (body: Record<string, any> = {}) => {
  const countryCode = normalizeCountryCode(body.countryCode);
  const mobileNumber = normalizeMobileNumber(body.mobileNumber);
  const password = typeof body.password === 'string' ? body.password : '';

  validatePhone(countryCode, mobileNumber);

  if (!password) {
    throw new AppError(400, 'password is required.');
  }

  if (body.rememberMe !== undefined && typeof body.rememberMe !== 'boolean') {
    throw new AppError(400, 'rememberMe must be true or false.');
  }

  return {
    countryCode,
    mobileNumber,
    password,
    rememberMe: body.rememberMe === true,
  };
};

export const validateAdminLogin = (body: Record<string, any> = {}) => {
  const rawIdentifier =
    body.email ?? body.identifier ?? body.username ?? body.mobileNumber ?? body.phone ?? '';
  const rawPassword = typeof body.password === 'string' ? body.password : '';

  if (!rawPassword) {
    throw new AppError(400, 'password is required.');
  }

  if (body.rememberMe !== undefined && typeof body.rememberMe !== 'boolean') {
    throw new AppError(400, 'rememberMe must be true or false.');
  }

  const strIdentifier = String(rawIdentifier).trim();
  if (!strIdentifier) {
    throw new AppError(
      400,
      'Please provide an email or mobile number to log in as administrator.',
    );
  }

  let email: string | null = null;
  let countryCode: string = body.countryCode ? normalizeCountryCode(body.countryCode) : '+91';
  let mobileNumber: string | null = null;

  if (strIdentifier.includes('@')) {
    email = normalizeEmail(strIdentifier);
    if (!EMAIL_PATTERN.test(email)) {
      throw new AppError(400, 'email must be a valid email address.');
    }
  } else {
    mobileNumber = normalizeMobileNumber(strIdentifier);
    if (strIdentifier.startsWith('+')) {
      const match = strIdentifier.match(/^(\+\d{1,4})(\d{7,15})$/);
      if (match) {
        countryCode = match[1] ?? '+91';
        mobileNumber = match[2] ?? '';
      }
    }
    if (!mobileNumber || mobileNumber.length < 7 || mobileNumber.length > 15) {
      throw new AppError(
        400,
        'mobileNumber must contain 7 to 15 digits or a valid email address.',
      );
    }
  }

  return {
    email,
    countryCode,
    mobileNumber,
    password: rawPassword,
    rememberMe: body.rememberMe === true,
  };
};

export const validateOtpLogin = (body: Record<string, any> = {}) => {
  const countryCode = normalizeCountryCode(body.countryCode);
  const mobileNumber = normalizeMobileNumber(body.mobileNumber);

  validatePhone(countryCode, mobileNumber);

  if (body.rememberMe !== undefined && typeof body.rememberMe !== 'boolean') {
    throw new AppError(400, 'rememberMe must be true or false.');
  }

  return {
    countryCode,
    mobileNumber,
    rememberMe: body.rememberMe === true,
  };
};

export const validateOtpVerification = (body: Record<string, any> = {}) => {
  const challengeId =
    typeof body.challengeId === 'string' ? body.challengeId.trim() : '';
  const otp = String(body.otp ?? '').trim();

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      challengeId,
    )
  ) {
    throw new AppError(400, 'challengeId must be a valid OTP challenge ID.');
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new AppError(400, 'otp must contain exactly 6 digits.');
  }

  return { challengeId, otp };
};

export const validateOtpResend = (body: Record<string, any> = {}) => {
  const challengeId =
    typeof body.challengeId === 'string' ? body.challengeId.trim() : '';

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      challengeId,
    )
  ) {
    throw new AppError(400, 'challengeId must be a valid OTP challenge ID.');
  }

  return { challengeId };
};
