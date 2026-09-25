import type {
  OnboardingConfig,
  OnboardingSlide,
  OnboardingStatus,
  OnboardingAnalyticsEvent,
  OnboardingAnalyticsSummary,
} from './onboarding.types.js';

export const DEFAULT_ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    step: 1,
    slug: 'network-delivered',
    title: 'One Network.\nEvery Promise.\nDelivered.',
    titleSpans: [
      { text: 'One Network.\n', isHighlighted: false },
      { text: 'Every Promise.\n', isHighlighted: false },
      { text: 'Delivered.', isHighlighted: true, color: 'error' },
    ],
    subtitle: 'Fast, secure and reliable\ndeliveries across India.',
    description: 'Fast, secure and reliable deliveries across India.',
    assetImage: 'assets/images/img.png',
    imageUrl: 'http://localhost:4000/public/onboarding/img.png',
    fallbackIcon: 'local_shipping',
    layout: {
      backgroundColor: 'brandPrimary',
      logoAlignment: 'center',
      hasWave: true,
      waveType: 'bottom_wave',
      cardType: 'none',
    },
    ctaText: 'Get Started',
    items: [],
    isActive: true,
  },
  {
    id: 'slide-2',
    step: 2,
    slug: 'secure-confidential',
    title: 'Secure.\nConfidential.\nDelivered.',
    titleSpans: [
      { text: 'Secure.\n', isHighlighted: false },
      { text: 'Confidential.\n', isHighlighted: true, color: 'error' },
      { text: 'Delivered.', isHighlighted: false },
    ],
    subtitle: 'Your privacy is our priority.\nWe ensure safe and confidential delivery of your important shipments.',
    description: 'Your privacy is our priority. We ensure safe and confidential delivery of your important shipments.',
    assetImage: 'assets/images/img1.png',
    imageUrl: 'http://localhost:4000/public/onboarding/img1.png',
    fallbackIcon: 'verified_user',
    layout: {
      backgroundColor: 'background',
      logoAlignment: 'left',
      hasWave: true,
      waveType: 'yellow_wave',
      cardType: 'feature_chips',
    },
    ctaText: 'Next',
    items: [
      {
        id: 'feat-2-1',
        title: 'Safe &\nConfidential',
        icon: 'shield_outlined',
        order: 1,
      },
      {
        id: 'feat-2-2',
        title: 'Hassle-free\nReturns',
        icon: 'inventory_2_outlined',
        order: 2,
      },
      {
        id: 'feat-2-3',
        title: 'Real-time\nTracking',
        icon: 'location_on_outlined',
        order: 3,
      },
      {
        id: 'feat-2-4',
        title: '24/7\nSupport',
        icon: 'headset_mic_outlined',
        order: 4,
      },
    ],
    isActive: true,
  },
  {
    id: 'slide-3',
    step: 3,
    slug: 'personal-courier',
    title: 'Personal\nCourier\nSolutions Just for You',
    titleSpans: [
      { text: 'Personal\n', isHighlighted: false },
      { text: 'Courier\n', isHighlighted: true, color: 'error' },
      { text: 'Solutions\nJust for You', isHighlighted: false },
    ],
    subtitle: 'Send documents, parcels or\npersonal items safely to\nyour loved ones, anytime,\nanywhere.',
    description: 'Send documents, parcels or personal items safely to your loved ones, anytime, anywhere.',
    assetImage: 'assets/images/img2.png',
    imageUrl: 'http://localhost:4000/public/onboarding/img2.png',
    fallbackIcon: 'person',
    layout: {
      backgroundColor: 'background',
      logoAlignment: 'left',
      hasWave: false,
      waveType: 'none',
      cardType: 'four_cards',
    },
    ctaText: 'Next',
    items: [
      {
        id: 'feat-3-1',
        title: 'Safe & Secure',
        subtitle: 'Your items are in\nsafe hands.',
        icon: 'shield_outlined',
        order: 1,
      },
      {
        id: 'feat-3-2',
        title: 'Fast Delivery',
        subtitle: 'Quick & timely\ndeliveries.',
        icon: 'alarm',
        order: 2,
      },
      {
        id: 'feat-3-3',
        title: 'Real-time Tracking',
        subtitle: 'Track your shipment\nevery step of the way.',
        icon: 'location_on_outlined',
        order: 3,
      },
      {
        id: 'feat-3-4',
        title: 'Care & Trust',
        subtitle: 'Handled with care\nyou can trust.',
        icon: 'inventory_2_outlined',
        order: 4,
      },
    ],
    isActive: true,
  },
  {
    id: 'slide-4',
    step: 4,
    slug: 'pickup-delivery',
    title: "From Pickup\nTo Delivery,\nWe've Got You\nCovered",
    titleSpans: [
      { text: "From Pickup\nTo Delivery,\nWe've Got You\n", isHighlighted: false },
      { text: 'Covered', isHighlighted: true, color: 'error' },
    ],
    subtitle: 'We pick up, handle and deliver\nyour items safely to your\ndestination. Simple, fast\nand reliable.',
    description: 'We pick up, handle and deliver your items safely to your destination. Simple, fast and reliable.',
    assetImage: 'assets/images/img3.png',
    imageUrl: 'http://localhost:4000/public/onboarding/img3.png',
    fallbackIcon: 'local_shipping',
    layout: {
      backgroundColor: 'background',
      logoAlignment: 'left',
      hasWave: false,
      waveType: 'none',
      cardType: 'process_steps',
    },
    ctaText: 'Next',
    items: [
      {
        id: 'step-4-1',
        title: 'Pickup',
        subtitle: 'We collect\nfrom you',
        icon: 'door_front_door_outlined',
        order: 1,
      },
      {
        id: 'step-4-2',
        title: 'Process',
        subtitle: 'Carefully\nhandled',
        icon: 'home_work_outlined',
        order: 2,
      },
      {
        id: 'step-4-3',
        title: 'In Transit',
        subtitle: 'Across our\nnetwork',
        icon: 'local_shipping_outlined',
        order: 3,
      },
      {
        id: 'step-4-4',
        title: 'On the Way',
        subtitle: 'Real-time\ntracking',
        icon: 'location_on_outlined',
        order: 4,
      },
      {
        id: 'step-4-5',
        title: 'Delivered',
        subtitle: 'Safe & on\ntime',
        icon: 'mark_as_unread_outlined',
        order: 5,
      },
    ],
    isActive: true,
  },
  {
    id: 'slide-5',
    step: 5,
    slug: 'forgot-something',
    title: 'Forgot\nSomething?',
    titleSpans: [
      { text: 'Forgot\n', isHighlighted: false },
      { text: 'Something?', isHighlighted: true, color: 'error' },
    ],
    subtitle: 'We pick it up and deliver it\nto you. Instant retrieval,\nwhen you need it most.',
    description: 'We pick it up and deliver it to you. Instant retrieval, when you need it most.',
    assetImage: 'assets/images/img4.png',
    imageUrl: 'http://localhost:4000/public/onboarding/img4.png',
    fallbackIcon: 'key',
    layout: {
      backgroundColor: 'background',
      logoAlignment: 'left',
      hasWave: false,
      waveType: 'none',
      cardType: 'four_cards',
    },
    ctaText: 'Next',
    items: [
      {
        id: 'feat-5-1',
        title: 'Instant Pickup',
        subtitle: 'We collect it\nquickly.',
        icon: 'shopping_bag_outlined',
        order: 1,
      },
      {
        id: 'feat-5-2',
        title: 'Secure Handling',
        subtitle: 'Your items are\nin safe hands.',
        icon: 'location_on_outlined',
        order: 2,
      },
      {
        id: 'feat-5-3',
        title: 'Quick Delivery',
        subtitle: 'Fast retrieval,\non time.',
        icon: 'alarm',
        order: 3,
      },
      {
        id: 'feat-5-4',
        title: 'Total Reliability',
        subtitle: 'Dependable\nevery time.',
        icon: 'shield_outlined',
        order: 4,
      },
    ],
    isActive: true,
  },
];

let slidesState: OnboardingSlide[] = JSON.parse(JSON.stringify(DEFAULT_ONBOARDING_SLIDES));
let onboardingConfig: Omit<OnboardingConfig, 'slides'> = {
  enabled: true,
  version: '1.0.0',
  totalPages: 5,
  allowSkip: true,
  loginRoute: '/auth/login',
};

const deviceStatuses = new Map<string, OnboardingStatus>();
const analyticsEvents: OnboardingAnalyticsEvent[] = [];

export function getOnboardingConfig(): OnboardingConfig {
  const activeSlides = slidesState
    .filter((s) => s.isActive)
    .sort((a, b) => a.step - b.step);

  return {
    ...onboardingConfig,
    totalPages: activeSlides.length,
    slides: activeSlides,
  };
}

export function getSlideByIdOrStep(identifier: string | number): OnboardingSlide | undefined {
  if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
    const stepNum = Number(identifier);
    return slidesState.find((s) => s.step === stepNum && s.isActive);
  }
  return slidesState.find((s) => (s.id === identifier || s.slug === identifier) && s.isActive);
}

export function getOnboardingStatus(deviceId: string, userId?: string | null): OnboardingStatus {
  const existing = deviceStatuses.get(deviceId);
  if (existing) {
    if (userId && !existing.userId) {
      existing.userId = userId;
    }
    return existing;
  }

  const initialStatus: OnboardingStatus = {
    deviceId,
    userId: userId || null,
    hasCompleted: false,
    hasSkipped: false,
    lastStepViewed: 0,
    completedAt: null,
    skippedAt: null,
    totalTimeSpentSeconds: 0,
    appVersion: onboardingConfig.version,
  };
  deviceStatuses.set(deviceId, initialStatus);
  return initialStatus;
}

export function completeOnboarding(params: {
  deviceId: string;
  userId?: string | null;
  totalTimeSpentSeconds?: number;
  appVersion?: string;
}): OnboardingStatus {
  const current = getOnboardingStatus(params.deviceId, params.userId);
  const updated: OnboardingStatus = {
    ...current,
    hasCompleted: true,
    hasSkipped: false,
    lastStepViewed: slidesState.length,
    completedAt: new Date().toISOString(),
    totalTimeSpentSeconds: params.totalTimeSpentSeconds ?? current.totalTimeSpentSeconds ?? 0,
    appVersion: params.appVersion ?? current.appVersion ?? onboardingConfig.version,
  };
  deviceStatuses.set(params.deviceId, updated);

  const lastSlide = slidesState[slidesState.length - 1];
  analyticsEvents.push({
    deviceId: params.deviceId,
    userId: params.userId || null,
    step: slidesState.length,
    slideId: lastSlide ? lastSlide.id : 'slide-5',
    action: 'COMPLETE',
    timestamp: new Date().toISOString(),
    durationMs: (params.totalTimeSpentSeconds ?? 0) * 1000,
  });

  return updated;
}

export function skipOnboarding(params: {
  deviceId: string;
  userId?: string | null;
  skippedAtStep?: number;
  appVersion?: string;
}): OnboardingStatus {
  const current = getOnboardingStatus(params.deviceId, params.userId);
  const step = params.skippedAtStep ?? current.lastStepViewed ?? 1;
  const updated: OnboardingStatus = {
    ...current,
    hasCompleted: false,
    hasSkipped: true,
    lastStepViewed: step,
    skippedAt: new Date().toISOString(),
    appVersion: params.appVersion ?? current.appVersion ?? onboardingConfig.version,
  };
  deviceStatuses.set(params.deviceId, updated);

  const matched = slidesState.find((s) => s.step === step);
  analyticsEvents.push({
    deviceId: params.deviceId,
    userId: params.userId || null,
    step,
    slideId: matched ? matched.id : `slide-${step}`,
    action: 'SKIP',
    timestamp: new Date().toISOString(),
  });

  return updated;
}

export function trackStep(params: {
  deviceId: string;
  userId?: string | null;
  step: number;
  slideId?: string;
  durationMs?: number;
}): void {
  const status = getOnboardingStatus(params.deviceId, params.userId);
  status.lastStepViewed = Math.max(status.lastStepViewed, params.step);
  deviceStatuses.set(params.deviceId, status);

  const matchedSlide = slidesState.find((s) => s.step === params.step);
  analyticsEvents.push({
    deviceId: params.deviceId,
    userId: params.userId || null,
    step: params.step,
    slideId: params.slideId || (matchedSlide ? matchedSlide.id : `slide-${params.step}`),
    action: 'VIEW',
    timestamp: new Date().toISOString(),
    durationMs: params.durationMs,
  });
}

export function updateSlide(slideId: string, updates: Partial<OnboardingSlide>): OnboardingSlide | null {
  const index = slidesState.findIndex((s) => s.id === slideId || s.slug === slideId);
  if (index === -1) return null;

  const existing = slidesState[index];
  if (!existing) return null;

  const updated: OnboardingSlide = {
    ...existing,
    ...updates,
    id: existing.id,
    step: updates.step !== undefined ? updates.step : existing.step,
  };
  slidesState[index] = updated;
  return updated;
}

export function resetToDefaults(): void {
  slidesState = JSON.parse(JSON.stringify(DEFAULT_ONBOARDING_SLIDES));
}

export function getAnalyticsSummary(): OnboardingAnalyticsSummary {
  const totalStarts = new Set(analyticsEvents.map((e) => e.deviceId)).size;
  const totalCompletions = Array.from(deviceStatuses.values()).filter((s) => s.hasCompleted).length;
  const totalSkips = Array.from(deviceStatuses.values()).filter((s) => s.hasSkipped).length;

  const dropOffByStep: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const viewsBySlideId: Record<string, number> = {};

  for (const event of analyticsEvents) {
    if (event.action === 'VIEW') {
      dropOffByStep[event.step] = (dropOffByStep[event.step] || 0) + 1;
      viewsBySlideId[event.slideId] = (viewsBySlideId[event.slideId] || 0) + 1;
    }
  }

  const completionRatePercent = totalStarts > 0 ? Math.round((totalCompletions / totalStarts) * 100) : 100;

  return {
    totalStarts,
    totalCompletions,
    totalSkips,
    completionRatePercent,
    dropOffByStep,
    viewsBySlideId,
  };
}
