import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireUser } from '../../middleware/user.middleware.js';
import {
  getCurrentUserRecentOrders,
  getCurrentUserLatestActiveOrder,
} from './user-orders.controller.js';

export const userOrdersRouter = Router();

// All user order routes require authentication
userOrdersRouter.use(authenticate, requireUser);

// Recent orders list & active order endpoints
userOrdersRouter.get('/recent', getCurrentUserRecentOrders);
userOrdersRouter.get('/recent/active', getCurrentUserLatestActiveOrder);
userOrdersRouter.get('/active', getCurrentUserLatestActiveOrder);
userOrdersRouter.get('/my-recent', getCurrentUserRecentOrders);
userOrdersRouter.get('/', getCurrentUserRecentOrders);
