import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { uploadServiceImage } from '../../middleware/service-image.middleware.js';
import {
  adminAddPincode,
  adminCreateQuickAction,
  adminDeleteHeroImage,
  adminDeletePincode,
  adminDeleteQuickAction,
  adminDeleteQuickActionImage,
  adminGetHero,
  adminGetSupportConfig,
  adminListPincodes,
  adminListQuickActions,
  adminUpdateBanner,
  adminUpdateChips,
  adminUpdateHero,
  adminUpdateLocationConfig,
  adminUpdatePincode,
  adminUpdateQuickAction,
  adminUpdateSupportConfig,
  adminUploadHeroImage,
  adminUploadQuickActionImage,
} from './home-content.controller.js';

export const homeContentAdminRouter = Router();

homeContentAdminRouter.use(authenticate, requireAdmin);

// Hero Management
homeContentAdminRouter.get('/hero', adminGetHero);
homeContentAdminRouter.put('/hero', adminUpdateHero);
homeContentAdminRouter.patch('/hero', adminUpdateHero);
homeContentAdminRouter.post('/hero/image', uploadServiceImage, adminUploadHeroImage);
homeContentAdminRouter.delete('/hero/image', adminDeleteHeroImage);

// Quick Actions Management (Ship Now, Track Shipment, Find Pincode, Help & Support)
homeContentAdminRouter.get('/quick-actions', adminListQuickActions);
homeContentAdminRouter.post('/quick-actions', adminCreateQuickAction);
homeContentAdminRouter.put('/quick-actions/:id', adminUpdateQuickAction);
homeContentAdminRouter.patch('/quick-actions/:id', adminUpdateQuickAction);
homeContentAdminRouter.post('/quick-actions/:id/image', uploadServiceImage, adminUploadQuickActionImage);
homeContentAdminRouter.delete('/quick-actions/:id/image', adminDeleteQuickActionImage);
homeContentAdminRouter.delete('/quick-actions/:id', adminDeleteQuickAction);

// Banner & Chips
homeContentAdminRouter.put('/banner', adminUpdateBanner);
homeContentAdminRouter.patch('/banner', adminUpdateBanner);
homeContentAdminRouter.put('/chips', adminUpdateChips);
homeContentAdminRouter.patch('/chips', adminUpdateChips);

// Location Config
homeContentAdminRouter.put('/location', adminUpdateLocationConfig);
homeContentAdminRouter.patch('/location', adminUpdateLocationConfig);

// Pincodes Management
homeContentAdminRouter.get('/pincodes', adminListPincodes);
homeContentAdminRouter.post('/pincodes', adminAddPincode);
homeContentAdminRouter.put('/pincodes/:pincode', adminUpdatePincode);
homeContentAdminRouter.patch('/pincodes/:pincode', adminUpdatePincode);
homeContentAdminRouter.delete('/pincodes/:pincode', adminDeletePincode);

// Support Config
homeContentAdminRouter.get('/support', adminGetSupportConfig);
homeContentAdminRouter.put('/support', adminUpdateSupportConfig);
homeContentAdminRouter.patch('/support', adminUpdateSupportConfig);
