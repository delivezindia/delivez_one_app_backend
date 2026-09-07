import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../lib/app-error.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { publicUserSelect } from '../lib/public-user.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.get('authorization') || '';
    const [scheme, token] = authorization.trim().split(/\s+/);

    if (
      !scheme ||
      scheme.toLowerCase() !== 'bearer' ||
      !token ||
      token === 'null' ||
      token === 'undefined'
    ) {
      throw new AppError({
        message: 'A Bearer access token is required.',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    }

    let payload: { sub: string };
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError({
          message: 'The access token has expired.',
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
        });
      }
      throw new AppError({
        message: 'The access token is invalid.',
        statusCode: 401,
        code: 'INVALID_TOKEN',
      });
    }

    if (!payload || typeof payload !== 'object' || !payload.sub) {
      throw new AppError({
        message: 'The access token is invalid.',
        statusCode: 401,
        code: 'INVALID_TOKEN',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect,
    });

    if (!user) {
      throw new AppError({
        message: 'The access token is no longer valid.',
        statusCode: 401,
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
