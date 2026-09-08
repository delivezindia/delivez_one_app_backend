import { Router } from 'express';
import {
  checkPincode,
  detectLocation,
  getActionChips,
  getCurrentLocation,
  getHero,
  getHeroImage,
  getHomeAll,
  getLocationPresets,
  getPromoBanner,
  getQuickActionImage,
  getQuickActions,
  getSupportConfig,
  submitSupportInquiry,
} from './home-content.controller.js';

// 1. Home master router: /api/v1/home
export const homeContentRouter = Router();
homeContentRouter.get('/all', getHomeAll);

// Location subroutes on /home
homeContentRouter.get('/location/current', getCurrentLocation);
homeContentRouter.get('/location/detect', detectLocation);
homeContentRouter.post('/location/detect', detectLocation);
homeContentRouter.get('/location/presets', getLocationPresets);

// Hero subroutes on /home
homeContentRouter.get('/hero', getHero);
homeContentRouter.get('/hero/image', getHeroImage);

// Quick actions subroutes on /home
homeContentRouter.get('/quick-actions', getQuickActions);
homeContentRouter.get('/quick-actions/:id/image', getQuickActionImage);

// Banner & Chips on /home
homeContentRouter.get('/banner', getPromoBanner);
homeContentRouter.get('/chips', getActionChips);

// Pincode & Support subroutes on /home
homeContentRouter.get('/pincode/check', checkPincode);
homeContentRouter.get('/pincode/:pincode', checkPincode);
homeContentRouter.get('/support/config', getSupportConfig);
homeContentRouter.post('/support/inquiry', submitSupportInquiry);

// 2. Dedicated location router: /api/v1/location
export const locationRouter = Router();
locationRouter.get('/current', getCurrentLocation);
locationRouter.get('/detect', detectLocation);
locationRouter.post('/detect', detectLocation);
locationRouter.get('/presets', getLocationPresets);

// 3. Dedicated pincode router: /api/v1/pincode
export const pincodeRouter = Router();
pincodeRouter.get('/check', checkPincode);
pincodeRouter.get('/:pincode', checkPincode);

// 4. Dedicated support router: /api/v1/support
export const supportRouter = Router();
supportRouter.get('/config', getSupportConfig);
supportRouter.post('/inquiry', submitSupportInquiry);
