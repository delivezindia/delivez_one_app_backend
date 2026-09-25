import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import {
  getOnboardingConfig,
  getSlideByIdOrStep,
  getOnboardingStatus,
  completeOnboarding,
  skipOnboarding,
  trackStep,
  updateSlide,
  resetToDefaults,
  getAnalyticsSummary,
} from './onboarding.store.js';

function extractString(val: unknown): string | undefined {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
}

export const getOnboardingConfigHandler: RequestHandler = (req, res) => {
  const deviceId = extractString(req.query.deviceId) || extractString(req.headers['x-device-id']);
  const userId = (req as any).user?.id;
  const config = getOnboardingConfig();

  let userStatus = null;
  if (deviceId) {
    userStatus = getOnboardingStatus(deviceId, userId);
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...config,
      ...(userStatus ? { userStatus } : {}),
    },
  });
};

export const getSlideHandler: RequestHandler = (req, res) => {
  const key = extractString(req.params.idOrStep);
  if (!key) {
    throw new AppError(400, 'Slide ID or step is required.');
  }

  const slide = getSlideByIdOrStep(key);
  if (!slide) {
    throw new AppError(404, `Onboarding slide '${key}' not found.`);
  }

  res.status(200).json({
    status: 'success',
    data: { slide },
  });
};

export const getOnboardingStatusHandler: RequestHandler = (req, res) => {
  const deviceId = extractString(req.query.deviceId) || extractString(req.headers['x-device-id']);
  if (!deviceId) {
    throw new AppError(400, 'deviceId query parameter or X-Device-Id header is required.');
  }

  const userId = (req as any).user?.id;
  const status = getOnboardingStatus(deviceId, userId);

  res.status(200).json({
    status: 'success',
    data: { status },
  });
};

export const completeOnboardingHandler: RequestHandler = (req, res) => {
  const deviceId = extractString(req.body.deviceId) || extractString(req.headers['x-device-id']);
  if (!deviceId) {
    throw new AppError(400, 'deviceId is required.');
  }

  const userId = (req as any).user?.id;
  const { totalTimeSpentSeconds, appVersion } = req.body;

  const status = completeOnboarding({
    deviceId,
    userId,
    totalTimeSpentSeconds: typeof totalTimeSpentSeconds === 'number' ? totalTimeSpentSeconds : undefined,
    appVersion: typeof appVersion === 'string' ? appVersion : undefined,
  });

  res.status(200).json({
    status: 'success',
    message: 'Onboarding completed successfully.',
    data: { status },
  });
};

export const skipOnboardingHandler: RequestHandler = (req, res) => {
  const deviceId = extractString(req.body.deviceId) || extractString(req.headers['x-device-id']);
  if (!deviceId) {
    throw new AppError(400, 'deviceId is required.');
  }

  const userId = (req as any).user?.id;
  const { skippedAtStep, appVersion } = req.body;

  const status = skipOnboarding({
    deviceId,
    userId,
    skippedAtStep: typeof skippedAtStep === 'number' ? skippedAtStep : undefined,
    appVersion: typeof appVersion === 'string' ? appVersion : undefined,
  });

  res.status(200).json({
    status: 'success',
    message: 'Onboarding skipped.',
    data: { status },
  });
};

export const trackOnboardingStepHandler: RequestHandler = (req, res) => {
  const deviceId = extractString(req.body.deviceId) || extractString(req.headers['x-device-id']);
  if (!deviceId) {
    throw new AppError(400, 'deviceId is required.');
  }

  const step = Number(req.body.step);
  if (!step || isNaN(step) || step < 1) {
    throw new AppError(400, 'Valid step number is required (1 to 5).');
  }

  const userId = (req as any).user?.id;
  const { slideId, durationMs } = req.body;

  trackStep({
    deviceId,
    userId,
    step,
    slideId: typeof slideId === 'string' ? slideId : undefined,
    durationMs: typeof durationMs === 'number' ? durationMs : undefined,
  });

  res.status(200).json({
    status: 'success',
    data: { recorded: true, step },
  });
};

// Admin handlers
export const adminGetOnboardingHandler: RequestHandler = (_req, res) => {
  const config = getOnboardingConfig();
  const analytics = getAnalyticsSummary();

  res.status(200).json({
    status: 'success',
    data: {
      config,
      analytics,
    },
  });
};

export const adminUpdateSlideHandler: RequestHandler = (req, res) => {
  const id = extractString(req.params.id);
  if (!id) {
    throw new AppError(400, 'Slide ID is required.');
  }

  const updated = updateSlide(id, req.body);
  if (!updated) {
    throw new AppError(404, `Slide '${id}' not found to update.`);
  }

  res.status(200).json({
    status: 'success',
    message: `Slide '${id}' updated successfully.`,
    data: { slide: updated },
  });
};

export const adminResetOnboardingHandler: RequestHandler = (_req, res) => {
  resetToDefaults();
  const config = getOnboardingConfig();

  res.status(200).json({
    status: 'success',
    message: 'Onboarding slides reset to factory defaults.',
    data: config,
  });
};
