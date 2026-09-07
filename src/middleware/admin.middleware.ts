import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/app-error.js';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(
      new AppError({
        message: 'Authentication is required.',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      }),
    );
  }

  if (req.user.role !== 'ADMIN') {
    return next(
      new AppError({
        message: 'Administrator access is required.',
        statusCode: 403,
        code: 'FORBIDDEN',
      }),
    );
  }

  return next();
};
