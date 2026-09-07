import 'dotenv/config';

import { z } from 'zod';

const booleanFromString = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65_535).default(4000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  JSON_BODY_LIMIT: z.string().default('1mb'),
  TRUST_PROXY: booleanFromString,
  SHUTDOWN_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must contain at least 32 characters')
    .default('development-jwt-secret-with-at-least-32-characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REMEMBER_ME_EXPIRES_IN: z.string().default('30d'),
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().int().min(1).max(30).default(5),
  PUBLIC_API_BASE_URL: z.string().default(''),
  ADMIN_FULL_NAME: z.string().default('System Admin'),
  ADMIN_COUNTRY_CODE: z.string().default('+91'),
  ADMIN_MOBILE_NUMBER: z.string().default('9999999999'),
  ADMIN_EMAIL: z.string().default('admin@delevez.com'),
  ADMIN_PASSWORD: z.string().default('Admin@123456'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
