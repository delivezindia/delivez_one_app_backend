import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { uploadServiceImage } from '../../middleware/service-image.middleware.js';
import {
  getGiftMetrics,
  listAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus,
  cancelAdminOrder,
  listAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  listAdminProducts,
  getAdminProduct,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  listAdminCards,
  createAdminCard,
  updateAdminCard,
  deleteAdminCard,
  listAdminLocations,
  createAdminLocation,
  updateAdminLocation,
  deleteAdminLocation,
  getAdminConfig,
  updateAdminConfig,
  listAdminSlots,
  createAdminSlot,
  updateAdminSlot,
  deleteAdminSlot,
} from './gift-delivery-admin.controller.js';

export const giftDeliveryAdminRouter = Router();

// Protect all admin endpoints
giftDeliveryAdminRouter.use(authenticate, requireAdmin);

// 1. Dashboard & Metrics
giftDeliveryAdminRouter.get('/metrics', getGiftMetrics);

// 2. Orders Management
giftDeliveryAdminRouter.get('/orders', listAdminOrders);
giftDeliveryAdminRouter.get('/orders/:id', getAdminOrderDetails);
giftDeliveryAdminRouter.patch('/orders/:id/status', updateAdminOrderStatus);
giftDeliveryAdminRouter.post('/orders/:id/cancel', cancelAdminOrder);

// 3. Categories Management
giftDeliveryAdminRouter.get('/categories', listAdminCategories);
giftDeliveryAdminRouter.post('/categories', uploadServiceImage, createAdminCategory);
giftDeliveryAdminRouter.patch('/categories/:id', uploadServiceImage, updateAdminCategory);
giftDeliveryAdminRouter.delete('/categories/:id', deleteAdminCategory);

// 4. Products Management
giftDeliveryAdminRouter.get('/products', listAdminProducts);
giftDeliveryAdminRouter.get('/products/:id', getAdminProduct);
giftDeliveryAdminRouter.post('/products', uploadServiceImage, createAdminProduct);
giftDeliveryAdminRouter.patch('/products/:id', uploadServiceImage, updateAdminProduct);
giftDeliveryAdminRouter.delete('/products/:id', deleteAdminProduct);

// 5. Gift Cards Management
giftDeliveryAdminRouter.get('/cards', listAdminCards);
giftDeliveryAdminRouter.post('/cards', uploadServiceImage, createAdminCard);
giftDeliveryAdminRouter.patch('/cards/:id', uploadServiceImage, updateAdminCard);
giftDeliveryAdminRouter.delete('/cards/:id', deleteAdminCard);

// 6. Locations Management
giftDeliveryAdminRouter.get('/locations', listAdminLocations);
giftDeliveryAdminRouter.post('/locations', createAdminLocation);
giftDeliveryAdminRouter.patch('/locations/:id', updateAdminLocation);
giftDeliveryAdminRouter.delete('/locations/:id', deleteAdminLocation);

// 7. Slots & Global Configuration
giftDeliveryAdminRouter.get('/config', getAdminConfig);
giftDeliveryAdminRouter.put('/config', updateAdminConfig);
giftDeliveryAdminRouter.get('/slots', listAdminSlots);
giftDeliveryAdminRouter.post('/slots', createAdminSlot);
giftDeliveryAdminRouter.patch('/slots/:id', updateAdminSlot);
giftDeliveryAdminRouter.delete('/slots/:id', deleteAdminSlot);
