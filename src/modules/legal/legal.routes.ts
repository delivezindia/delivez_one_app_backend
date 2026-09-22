import { Router } from 'express';
import { optionalAuthenticate } from '../../middleware/auth.middleware.js';
import {
  getTermsAndConditions,
  agreeToTermsAndConditions,
  getPrivacyPolicy,
  acknowledgePrivacyPolicy,
} from './legal.controller.js';

export const legalRouter = Router();

legalRouter.get('/terms', getTermsAndConditions);
legalRouter.post('/terms/agree', optionalAuthenticate, agreeToTermsAndConditions);
legalRouter.get('/privacy', getPrivacyPolicy);
legalRouter.post('/privacy/acknowledge', optionalAuthenticate, acknowledgePrivacyPolicy);
