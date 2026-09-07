export interface AppErrorOptions {
  message: string;
  statusCode: number;
  code?: string;
  details?: unknown;
  isOperational?: boolean;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;
  readonly isOperational: boolean;

  constructor(statusCode: number, message: string, details?: unknown);
  constructor(options: AppErrorOptions);
  constructor(
    statusCodeOrOptions: number | AppErrorOptions,
    message?: string,
    details?: unknown,
  ) {
    if (typeof statusCodeOrOptions === 'number') {
      super(message ?? 'An error occurred');
      this.statusCode = statusCodeOrOptions;
      this.code = `HTTP_${statusCodeOrOptions}`;
      this.details = details;
      this.isOperational = true;
    } else {
      super(statusCodeOrOptions.message);
      this.statusCode = statusCodeOrOptions.statusCode;
      this.code = statusCodeOrOptions.code ?? `HTTP_${statusCodeOrOptions.statusCode}`;
      this.details = statusCodeOrOptions.details;
      this.isOperational = statusCodeOrOptions.isOperational ?? true;
    }

    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
