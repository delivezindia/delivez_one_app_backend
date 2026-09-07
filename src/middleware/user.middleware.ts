import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../lib/app-error.js';
import { authenticate } from './auth.middleware.js';

export const requireUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return next(
      new AppError({
        message: 'Authentication is required. Please log in.',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      }),
    );
  }

  // Allow USER and ADMIN accounts
  if (!['USER', 'ADMIN'].includes(req.user.role)) {
    return next(
      new AppError({
        message: 'A valid customer or administrator account is required.',
        statusCode: 403,
        code: 'FORBIDDEN',
      }),
    );
  }

  return next();
};

export const requireUserAuth = [authenticate, requireUser];

