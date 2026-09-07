import type { PublicUser } from '../lib/public-user.js';

declare global {
  namespace Express {
    interface Request {
      user?: PublicUser;
      validated?: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

export {};
