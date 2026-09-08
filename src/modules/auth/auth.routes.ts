import { Router } from 'express';

import { authRateLimit } from '../../middleware/auth-rate-limit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  checkAuthentication,
  getCurrentUser,
  getCurrentUserDevices,
  updateCurrentUser,
  login,
  register,
  resendOtp,
  verifyOtp,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimit, register);
authRouter.post('/login', authRateLimit, login);
authRouter.post('/verify-otp', authRateLimit, verifyOtp);
authRouter.post('/resend-otp', authRateLimit, resendOtp);
authRouter.get('/check', checkAuthentication);
authRouter.get('/me', authenticate, getCurrentUser);
authRouter.get('/devices', authenticate, getCurrentUserDevices);
authRouter.patch('/me', authenticate, updateCurrentUser);
