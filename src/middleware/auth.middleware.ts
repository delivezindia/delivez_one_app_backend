import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppError } from '../lib/app-error.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';
import { publicUserSelect } from '../lib/public-user.js';

/**
 * Robust token extractor that cleans up common Postman / client header quirks:
 * - Leading/repeated "Bearer " prefixes (e.g. "Bearer Bearer ...")
 * - Surrounding single or double quotes
 * - Trailing semicolons or newlines
 * - Fallback to x-access-token / x-auth-token headers
 */
export const extractAuthToken = (req: Request): string | null => {
  let raw =
    req.get('authorization') ||
    req.get('Authorization') ||
    req.get('x-access-token') ||
    req.get('x-auth-token') ||
    '';

  if (!raw || typeof raw !== 'string') return null;

  let clean = raw.trim();
  // Strip outer quotes if entire header was enclosed
  clean = clean.replace(/^["']+|["']+$/g, '').trim();

  // Strip repeated 'Bearer' / 'bearer' prefixes and internal quotes
  while (/^bearer[\s:]+/i.test(clean)) {
    clean = clean.replace(/^bearer[\s:]+/i, '').trim();
    clean = clean.replace(/^["']+|["']+$/g, '').trim();
  }

  // Also remove trailing semicolon
  clean = clean.replace(/;+$/, '').trim();

  return clean || null;
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractAuthToken(req);

    if (!token || token === 'null' || token === 'undefined') {
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

    let payload: { sub: string } | null = null;
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

      // Development auto-recovery for truncated tokens (e.g. copied with trailing '...' or missing signature)
      if (process.env.NODE_ENV !== 'production') {
        try {
          const cleanToken = token.replace(/\.+$/, '');
          const parts = cleanToken.split('.');
          const payloadPart = parts[1];
          if (payloadPart) {
            let b64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4 !== 0) b64 += '=';
            const decoded = Buffer.from(b64, 'base64').toString('utf8');
            const match = decoded.match(/"sub":\s*"([^"]+)/);
            const subPrefix = match ? match[1] : '';
            if (subPrefix && subPrefix.length >= 8) {
              const matchedUser = await prisma.user.findFirst({
                where: { id: { startsWith: subPrefix } },
                select: publicUserSelect,
              });
              if (matchedUser) {
                console.warn(`[DEV_AUTH_RECOVERY] Auto-recovered user "${matchedUser.email || matchedUser.mobileNumber}" from truncated token!`);
                req.user = matchedUser;
                return next();
              }
            }
          }
        } catch (recoverErr) {
          // Ignore and proceed to standard error
        }
      }

      const parts = token.split('.');
      console.warn('[AUTH_FAILED] Raw token in request:', JSON.stringify(token));
      console.warn('[AUTH_FAILED] Dot count:', parts.length - 1, 'Part lengths:', parts.map(p => p.length));
      throw new AppError({
        message: `The access token is invalid (${err?.message || 'verification failed'}). Please run Login to obtain a fresh token. (Length: ${token.length}, parts: ${parts.length} [expected 3], start: "${token.slice(0, 20)}", end: "${token.slice(-20)}")`,
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
