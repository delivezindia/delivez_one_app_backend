import rateLimit from 'express-rate-limit';

export const courierMutationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler(_req, res) {
    res.status(429).json({
      status: 'error',
      message: 'Too many courier requests. Please try again later.',
    });
  },
});
