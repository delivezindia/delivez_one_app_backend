import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';

import { env } from '../config/env.js';

export const OTP_MAX_ATTEMPTS = 5;

export const createOtpCode = (): string => String(randomInt(100_000, 1_000_000));

export const createOtpChallengeId = (): string => randomUUID();

export const hashOtpCode = (challengeId: string, code: string): string =>
  createHmac('sha256', env.JWT_SECRET)
    .update(`${challengeId}:${code}`)
    .digest('hex');

export const otpCodeMatches = (
  challengeId: string,
  code: string,
  expectedHash: string,
): boolean => {
  const actualHash = hashOtpCode(challengeId, code);
  const actual = Buffer.from(actualHash, 'hex');
  const expected = Buffer.from(expectedHash, 'hex');

  return actual.length === expected.length && timingSafeEqual(actual, expected);
};
