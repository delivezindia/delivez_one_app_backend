import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { getRewardsOverview, redeemReward } from './rewards.controller.js';

export const rewardsRouter = Router();

rewardsRouter.get('/', authenticate, getRewardsOverview);
rewardsRouter.post('/redeem', authenticate, redeemReward);
