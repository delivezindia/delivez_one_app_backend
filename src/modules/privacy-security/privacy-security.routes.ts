import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getPrivacySecurityOverview,
  updatePrivacySettings,
  toggleTwoFactorAuth,
  getUserDevicesList,
  revokeUserDevice,
  getLoginActivityList,
  downloadUserDataExport,
  reportSecurityIssueAction,
  deleteAccountAction,
} from './privacy-security.controller.js';

export const privacySecurityRouter = Router();

privacySecurityRouter.use(authenticate);

privacySecurityRouter.get('/', getPrivacySecurityOverview);
privacySecurityRouter.patch('/settings', updatePrivacySettings);
privacySecurityRouter.post('/toggle-2fa', toggleTwoFactorAuth);
privacySecurityRouter.get('/devices', getUserDevicesList);
privacySecurityRouter.delete('/devices/:id', revokeUserDevice);
privacySecurityRouter.get('/login-activity', getLoginActivityList);
privacySecurityRouter.get('/download-data', downloadUserDataExport);
privacySecurityRouter.post('/report-issue', reportSecurityIssueAction);
privacySecurityRouter.delete('/delete-account', deleteAccountAction);
