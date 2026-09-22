import fs from 'node:fs';
import path from 'node:path';
import type { UserRewardsOverview } from './rewards.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'rewards-store.json');

const DEFAULT_REWARDS: UserRewardsOverview = {
  pointsBalance: 2450,
  membershipTier: 'Delivez Member',
  tagline: 'Keep shipping to earn more points!',
  quickActions: [
    {
      id: 'my-rewards',
      title: 'My Rewards',
      subtitle: 'View & Redeem',
      icon: 'gift',
      action: 'view_rewards',
    },
    {
      id: 'active-offers',
      title: 'Active Offers',
      subtitle: 'Save on Shipping',
      icon: 'tag',
      action: 'view_offers',
    },
    {
      id: 'earn-points',
      title: 'Earn Points',
      subtitle: 'How it works',
      icon: 'star',
      action: 'how_it_works',
    },
    {
      id: 'history',
      title: 'History',
      subtitle: 'Past Offers',
      icon: 'history',
      action: 'view_history',
    },
  ],
  featuredOffers: [
    {
      id: 'offer-delivez20',
      code: 'DELIVEZ20',
      badge: 'Flat 20% OFF',
      title: 'Flat 20% OFF',
      description: 'on Domestic Shipments',
      validTill: '30 Sep 2026',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      bgColor: '#b91c1c',
    },
    {
      id: 'offer-ship100',
      code: 'SHIP100',
      badge: 'Get ₹100 OFF',
      title: 'Get ₹100 OFF',
      description: 'on your next 3 shipments',
      validTill: '15 Sep 2026',
      discountType: 'FLAT',
      discountValue: 100,
      bgColor: '#ea580c',
    },
  ],
  waysToEarn: [
    {
      id: 'earn-ship',
      title: 'Ship a Package',
      pointsText: '+10 Points',
      pointsValue: 10,
      icon: 'box',
    },
    {
      id: 'earn-refer',
      title: 'Refer a Friend',
      pointsText: '+250 Points',
      pointsValue: 250,
      icon: 'users',
    },
    {
      id: 'earn-wallet',
      title: 'Use Delivez Money',
      pointsText: '+50 Points',
      pointsValue: 50,
      icon: 'wallet',
    },
  ],
  redeemRewards: [
    {
      id: 'redeem-coupons',
      title: 'Discount Coupons',
      description: 'Use points for shipping discounts',
      pointsCost: 500,
      icon: 'tag',
    },
    {
      id: 'redeem-pickup',
      title: 'Free Pickup',
      description: 'Redeem points for free pickup',
      pointsCost: 300,
      icon: 'gift',
    },
  ],
};

let userPointsCache: Record<string, number> = {};

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.userPoints) {
        userPointsCache = parsed.userPoints;
      }
    }
  } catch (err) {
    console.error('Failed to init rewards store:', err);
  }
}

function saveStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify({ userPoints: userPointsCache }, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save rewards store:', err);
  }
}

initStorage();

export function getRewardsForUser(userId?: string): UserRewardsOverview {
  const points = userId && userPointsCache[userId] !== undefined ? userPointsCache[userId] : DEFAULT_REWARDS.pointsBalance;
  return {
    ...DEFAULT_REWARDS,
    pointsBalance: points,
  };
}

export function deductPointsForUser(userId: string, pointsToDeduct: number): number {
  const current = userPointsCache[userId] !== undefined ? userPointsCache[userId] : DEFAULT_REWARDS.pointsBalance;
  const updated = Math.max(0, current - pointsToDeduct);
  userPointsCache[userId] = updated;
  saveStorage();
  return updated;
}

export function addPointsForUser(userId: string, pointsToAdd: number): number {
  const current = userPointsCache[userId] !== undefined ? userPointsCache[userId] : DEFAULT_REWARDS.pointsBalance;
  const updated = current + pointsToAdd;
  userPointsCache[userId] = updated;
  saveStorage();
  return updated;
}
