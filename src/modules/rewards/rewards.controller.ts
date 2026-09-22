import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { getRewardsForUser, deductPointsForUser } from './rewards.store.js';

export const getRewardsOverview: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  const data = getRewardsForUser(userId);
  res.status(200).json({
    status: 'success',
    data,
  });
};

export const redeemReward: RequestHandler = (req, res) => {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required to redeem rewards.');
  }

  const { rewardId } = req.body;
  if (!rewardId) {
    throw new AppError(400, 'Reward ID is required.');
  }

  const currentRewards = getRewardsForUser(userId);
  const reward = currentRewards.redeemRewards.find((r) => r.id === rewardId);
  if (!reward) {
    throw new AppError(404, 'Selected reward option not found.');
  }

  if (currentRewards.pointsBalance < reward.pointsCost) {
    throw new AppError(400, `Insufficient Delivez Points. Required: ${reward.pointsCost}, Available: ${currentRewards.pointsBalance}.`);
  }

  const newBalance = deductPointsForUser(userId, reward.pointsCost);

  res.status(200).json({
    status: 'success',
    message: `Successfully redeemed ${reward.title}! ${reward.pointsCost} points deducted.`,
    data: {
      redeemedReward: reward,
      newPointsBalance: newBalance,
      couponCode: `RDM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    },
  });
};
