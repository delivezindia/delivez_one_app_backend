import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export const validate =
  (schema: ZodType<unknown>): RequestHandler =>
  (request, _response, next) => {
    const result = schema.safeParse({
      body: request.body as unknown,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    request.validated = result.data as Express.Request['validated'];
    next();
  };
