import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://postgres:1234@localhost:5432/delivery_app_backend?schema=public';
process.env.LOG_LEVEL = 'silent';
process.env.RATE_LIMIT_MAX = '1000';
process.env.JWT_SECRET ??=
  'development-jwt-secret-with-at-least-32-characters';
