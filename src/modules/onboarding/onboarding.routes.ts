import { Router } from 'express';
import {
  getOnboardingConfigHandler,
  getSlideHandler,
  getOnboardingStatusHandler,
  completeOnboardingHandler,
  skipOnboardingHandler,
  trackOnboardingStepHandler,
  adminGetOnboardingHandler,
  adminUpdateSlideHandler,
  adminResetOnboardingHandler,
} from './onboarding.controller.js';

export const onboardingRouter = Router();

// Public Mobile APIs
onboardingRouter.get('/', getOnboardingConfigHandler);
onboardingRouter.get('/slides', getOnboardingConfigHandler);
onboardingRouter.get('/config', getOnboardingConfigHandler);
onboardingRouter.get('/slides/:idOrStep', getSlideHandler);
onboardingRouter.get('/status', getOnboardingStatusHandler);
onboardingRouter.post('/complete', completeOnboardingHandler);
onboardingRouter.post('/skip', skipOnboardingHandler);
onboardingRouter.post('/track-step', trackOnboardingStepHandler);

// Admin APIs
export const adminOnboardingRouter = Router();
adminOnboardingRouter.get('/', adminGetOnboardingHandler);
adminOnboardingRouter.put('/slides/:id', adminUpdateSlideHandler);
adminOnboardingRouter.post('/reset', adminResetOnboardingHandler);
