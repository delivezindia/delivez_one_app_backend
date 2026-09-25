export interface TitleSpan {
  text: string;
  isHighlighted?: boolean;
  color?: string; // 'error' | 'brandPrimary' | 'brandSecondary' | 'primaryText'
}

export interface OnboardingFeatureItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  order: number;
}

export interface OnboardingLayout {
  backgroundColor: 'brandPrimary' | 'background';
  logoAlignment: 'center' | 'left';
  hasWave: boolean;
  waveType?: 'bottom_wave' | 'yellow_wave' | 'none';
  cardType?: 'none' | 'feature_chips' | 'four_cards' | 'process_steps';
}

export interface OnboardingSlide {
  id: string;
  step: number;
  slug: string;
  title: string;
  titleSpans: TitleSpan[];
  subtitle: string;
  description?: string;
  assetImage: string;
  imageUrl?: string;
  fallbackIcon: string;
  layout: OnboardingLayout;
  ctaText: string;
  items: OnboardingFeatureItem[];
  isActive: boolean;
}

export interface OnboardingConfig {
  enabled: boolean;
  version: string;
  totalPages: number;
  allowSkip: boolean;
  loginRoute: string;
  slides: OnboardingSlide[];
}

export interface OnboardingStatus {
  deviceId: string;
  userId?: string | null;
  hasCompleted: boolean;
  hasSkipped: boolean;
  lastStepViewed: number;
  completedAt?: string | null;
  skippedAt?: string | null;
  totalTimeSpentSeconds?: number;
  appVersion?: string;
}

export interface OnboardingAnalyticsEvent {
  deviceId: string;
  userId?: string | null;
  step: number;
  slideId: string;
  action: 'VIEW' | 'NEXT' | 'SKIP' | 'COMPLETE';
  timestamp: string;
  durationMs?: number;
}

export interface OnboardingAnalyticsSummary {
  totalStarts: number;
  totalCompletions: number;
  totalSkips: number;
  completionRatePercent: number;
  dropOffByStep: Record<number, number>;
  viewsBySlideId: Record<string, number>;
}
