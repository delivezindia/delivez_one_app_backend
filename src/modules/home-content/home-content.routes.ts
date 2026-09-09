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
  getPromoBannerImage,
  getQuickActionImage,
  getQuickActions,
  getPromptExamples,
  getPromptExampleImage,
  getPromptExampleById,
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


// Prompt Examples (Both plural /prompt-examples and singular /prompt-example)
homeContentRouter.get('/prompt-examples', getPromptExamples);
homeContentRouter.get('/prompt-example', getPromptExamples);
homeContentRouter.get('/prompt-examples/:id/image', getPromptExampleImage);
homeContentRouter.get('/prompt-example/:id/image', getPromptExampleImage);
homeContentRouter.get('/prompt-examples/:id', getPromptExampleById);
homeContentRouter.get('/prompt-example/:id', getPromptExampleById);

// Quick actions subroutes on /home
homeContentRouter.get('/quick-actions', getQuickActions);
homeContentRouter.get('/quick-actions/:id/image', getQuickActionImage);

// Banner & Chips on /home
homeContentRouter.get('/banner', getPromoBanner);
homeContentRouter.get('/banner/image', getPromoBannerImage);
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

// 5. Dedicated prompt examples router: /api/v1/prompt-examples and /api/v1/prompt-example
export const promptExamplesRouter = Router();
promptExamplesRouter.get('/', getPromptExamples);
promptExamplesRouter.get('/:id/image', getPromptExampleImage);
promptExamplesRouter.get('/:id', getPromptExampleById);
