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
        message: 'A Bearer access token is required. Please log in and provide Authorization: Bearer <token>.',
        statusCode: 401,
        code: 'UNAUTHORIZED',
      });
    }

    if (token.startsWith('{{') && token.endsWith('}}')) {
      throw new AppError({
        message: `Unresolved Postman variable detected: ${token}. Please run 'User Login' or 'Admin Login' first to generate a token, or select the active environment in Postman.`,
        statusCode: 401,
        code: 'UNRESOLVED_POSTMAN_VARIABLE',
      });
    }

    let payload: { sub: string };
    try {
      payload = verifyAccessToken(token);
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new AppError({
          message: 'The access token has expired. Please log in again.',
          statusCode: 401,
          code: 'TOKEN_EXPIRED',
        });
      }
      throw new AppError({
        message: `The access token is invalid (${err?.message || 'verification failed'}). Please run Login to obtain a fresh token.`,
        statusCode: 401,
        code: 'INVALID_TOKEN',
      });
    }

    if (!payload || typeof payload !== 'object' || !payload.sub) {
      throw new AppError({
        message: 'The access token payload is malformed.',
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
        message: 'The user associated with this token no longer exists. Please register or log in with another account.',
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
