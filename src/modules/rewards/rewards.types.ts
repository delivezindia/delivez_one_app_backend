export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  action: string;
}

export interface FeaturedOfferItem {
  id: string;
  code: string;
  badge: string;
  title: string;
  description: string;
  validTill: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  bgColor: string;
}

export interface WayToEarnItem {
  id: string;
  title: string;
  pointsText: string;
  pointsValue: number;
  icon: string;
}

export interface RedeemRewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
}

export interface UserRewardsOverview {
  pointsBalance: number;
  membershipTier: string;
  tagline: string;
  quickActions: QuickActionItem[];
  featuredOffers: FeaturedOfferItem[];
  waysToEarn: WayToEarnItem[];
  redeemRewards: RedeemRewardItem[];
}
