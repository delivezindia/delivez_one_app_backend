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
  adminUploadBannerImage,
  adminDeleteBannerImage,
  getPromoBanner,
  getActionChips,
  adminUpdateChips,
  adminUpdateHero,
  adminUpdateLocationConfig,
  adminUpdatePincode,
  adminUpdateQuickAction,
  adminUpdateSupportConfig,
  adminUploadHeroImage,
  adminUploadQuickActionImage,
  adminListPromptExamples,
  adminCreatePromptExample,
  adminUpdatePromptExample,
  adminUploadPromptExampleImage,
  adminDeletePromptExampleImage,
  adminDeletePromptExample,
} from './home-content.controller.js';

export const homeContentAdminRouter = Router();

homeContentAdminRouter.use(authenticate, requireAdmin);

// Hero Management
homeContentAdminRouter.get('/hero', adminGetHero);
homeContentAdminRouter.put('/hero', uploadServiceImage, adminUpdateHero);
homeContentAdminRouter.patch('/hero', adminUpdateHero);
homeContentAdminRouter.post('/hero/image', uploadServiceImage, adminUploadHeroImage);
homeContentAdminRouter.delete('/hero/image', adminDeleteHeroImage);

// Quick Actions Management (Ship Now, Track Shipment, Find Pincode, Help & Support)
homeContentAdminRouter.get('/quick-actions', adminListQuickActions);
homeContentAdminRouter.post('/quick-actions', uploadServiceImage, adminCreateQuickAction);
homeContentAdminRouter.put('/quick-actions/:id', uploadServiceImage, adminUpdateQuickAction);
homeContentAdminRouter.patch('/quick-actions/:id', uploadServiceImage, adminUpdateQuickAction);
homeContentAdminRouter.post('/quick-actions/:id/image', uploadServiceImage, adminUploadQuickActionImage);
homeContentAdminRouter.delete('/quick-actions/:id/image', adminDeleteQuickActionImage);
homeContentAdminRouter.delete('/quick-actions/:id', adminDeleteQuickAction);


// Prompt Examples Management (Try These Examples Modal - both plural and singular)
homeContentAdminRouter.get('/prompt-examples', adminListPromptExamples);
homeContentAdminRouter.get('/prompt-example', adminListPromptExamples);
homeContentAdminRouter.post('/prompt-examples', uploadServiceImage, adminCreatePromptExample);
homeContentAdminRouter.post('/prompt-example', uploadServiceImage, adminCreatePromptExample);
homeContentAdminRouter.put('/prompt-examples/:id', uploadServiceImage, adminUpdatePromptExample);
homeContentAdminRouter.put('/prompt-example/:id', uploadServiceImage, adminUpdatePromptExample);
homeContentAdminRouter.patch('/prompt-examples/:id', uploadServiceImage, adminUpdatePromptExample);
homeContentAdminRouter.patch('/prompt-example/:id', uploadServiceImage, adminUpdatePromptExample);
homeContentAdminRouter.post('/prompt-examples/:id/image', uploadServiceImage, adminUploadPromptExampleImage);
homeContentAdminRouter.post('/prompt-example/:id/image', uploadServiceImage, adminUploadPromptExampleImage);
homeContentAdminRouter.delete('/prompt-examples/:id/image', adminDeletePromptExampleImage);
homeContentAdminRouter.delete('/prompt-example/:id/image', adminDeletePromptExampleImage);
homeContentAdminRouter.delete('/prompt-examples/:id', adminDeletePromptExample);
homeContentAdminRouter.delete('/prompt-example/:id', adminDeletePromptExample);

// Banner & Chips
homeContentAdminRouter.get('/banner', getPromoBanner);
homeContentAdminRouter.put('/banner', uploadServiceImage, adminUpdateBanner);
homeContentAdminRouter.patch('/banner', uploadServiceImage, adminUpdateBanner);
homeContentAdminRouter.post('/banner/image', uploadServiceImage, adminUploadBannerImage);
homeContentAdminRouter.delete('/banner/image', adminDeleteBannerImage);
homeContentAdminRouter.get('/chips', getActionChips);
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
