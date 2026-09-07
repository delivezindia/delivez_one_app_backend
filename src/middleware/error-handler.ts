import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { env } from '../config/env.js';
import { AppError } from '../lib/app-error.js';
import { logger } from '../lib/logger.js';

interface ErrorResponse {
  status: 'error';
  message: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
  details?: unknown;
  debug?: string;
}

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof ZodError) {
    appError = new AppError({
      message: 'The request contains invalid data',
      statusCode: 422,
      code: 'VALIDATION_ERROR',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })),
    });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    appError = new AppError({
      message: 'A record with that value already exists.',
      statusCode: 409,
      code: 'RESOURCE_CONFLICT',
      details: error.meta,
    });
  } else if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    appError = new AppError({
      message: 'The requested record was not found.',
      statusCode: 404,
      code: 'RESOURCE_NOT_FOUND',
    });
  } else if (error instanceof SyntaxError && 'body' in error) {
    appError = new AppError({
      message: 'The request body contains invalid JSON',
      statusCode: 400,
      code: 'INVALID_JSON',
    });
  } else {
    appError = new AppError({
      message: error instanceof Error ? error.message : 'Internal server error.',
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      isOperational: false,
    });
  }

  const logContext = {
    err: error,
    requestId: request.id,
    code: appError.code,
    statusCode: appError.statusCode,
  };

  if (appError.statusCode >= 500) {
    logger.error(logContext, appError.message);
  } else {
    logger.warn(logContext, appError.message);
  }

  const body: ErrorResponse = {
    status: 'error',
    message: appError.statusCode === 500 && env.NODE_ENV === 'production' ? 'Internal server error.' : appError.message,
    error: {
      code: appError.code,
      message: appError.message,
    },
  };

  if (appError.details !== undefined) {
    body.details = appError.details;
    body.error!.details = appError.details;
  }

  if (env.NODE_ENV === 'development') {
    body.debug = error instanceof Error ? error.message : undefined;
    body.error!.stack = error instanceof Error ? error.stack : undefined;
  }

  response.status(appError.statusCode).json(body);
};
