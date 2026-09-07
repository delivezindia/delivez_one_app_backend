import {
  listBroadcasts,
  createBroadcast,
  toggleBroadcastStatus,
  deleteBroadcast,
} from './admin-broadcast.controller.js';
﻿import { Router } from 'express';

import { requireAdmin } from '../../middleware/admin.middleware.js';
import { authRateLimit } from '../../middleware/auth-rate-limit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  adminLogin,
  getAdminProfile,
  listUsers,
  getUserDetails,
  updateUserRole,
  deleteUser,
} from './admin.controller.js';
import {
  listAdminCourierBookings,
  getAdminCourierBooking,
  updateAdminCourierBooking,
  updateAdminCourierStatus,
  recordAdminCourierPOD,
  listAdminConfidentialBookings,
  updateAdminConfidentialStatus,
  listAdminForgotBookings,
  updateAdminForgotStatus,
  listAdminReturnBookings,
  updateAdminReturnStatus,
  getUnifiedDashboardStats,
  listAllUnifiedOrders,
  universalTrackOrder,
  updateUnifiedOrderStatus,
  assignPartnerToOrder,
  autoAssignOrder,
  getPartnerScorecard,
  cancelUnifiedOrder,
  listPartners,
  createPartner,
  updatePartnerStatus,
  updatePartnerProfile,
  deletePartner,
  getPartnerDeliveries,
  getFinanceSummary,
  triggerPartnerSettlement,
  getAnalyticsSummary,
  exportOrdersCsv,
  exportUsersCsv,
} from './admin-management.controller.js';
import {
  listSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from './admin-support.controller.js';
import {
  getPlatformSettings,
  updatePlatformSettings,
} from './admin-settings.controller.js';
import { getRadarTelemetry } from './admin-radar.controller.js';
import {
  listPromos,
  createPromo,
  togglePromoStatus,
  deletePromo,
} from './admin-promos.controller.js';
import {
  getPricingMatrix,
  updateServiceRateCard,
} from './admin-pricing.controller.js';
import {
  listAuditLogs,
  exportAuditLogsCsv,
} from './admin-audit.controller.js';

export const adminRouter = Router();

// Public / Auth
adminRouter.post('/auth/login', authRateLimit, adminLogin);
adminRouter.post('/login', authRateLimit, adminLogin);

// Protected Admin Endpoints
adminRouter.use(authenticate, requireAdmin);

adminRouter.get('/auth/me', getAdminProfile);
adminRouter.get('/me', getAdminProfile);

// Customer / Users Management
adminRouter.get('/users', listUsers);
adminRouter.get('/users/:id', getUserDetails);
adminRouter.patch('/users/:id/role', updateUserRole);
adminRouter.delete('/users/:id', deleteUser);

// 1. Dashboard Stats
adminRouter.get('/stats', getUnifiedDashboardStats);

// Services Specific Admin Handlers
adminRouter.get('/courier/bookings', listAdminCourierBookings);
adminRouter.get('/courier/bookings/:id', getAdminCourierBooking);
adminRouter.patch('/courier/bookings/:id', updateAdminCourierBooking);
adminRouter.put('/courier/bookings/:id', updateAdminCourierBooking);
adminRouter.patch('/courier/bookings/:id/status', updateAdminCourierStatus);
adminRouter.post('/courier/bookings/:id/pod', recordAdminCourierPOD);

adminRouter.get('/confidential/bookings', listAdminConfidentialBookings);
adminRouter.patch('/confidential/bookings/:id/status', updateAdminConfidentialStatus);

adminRouter.get('/forgot/bookings', listAdminForgotBookings);
adminRouter.patch('/forgot/bookings/:id/status', updateAdminForgotStatus);

adminRouter.get('/return/bookings', listAdminReturnBookings);
adminRouter.patch('/return/bookings/:id/status', updateAdminReturnStatus);

// 2. Cross-Service Unified Orders & Lifecycle Actions
adminRouter.get('/orders/unified', listAllUnifiedOrders);
adminRouter.get('/track/:trackingId', universalTrackOrder);
adminRouter.patch('/orders/:serviceKey/:id/status', updateUnifiedOrderStatus);
adminRouter.patch('/orders/:serviceKey/:id/assign-partner', assignPartnerToOrder);
adminRouter.post('/orders/:serviceKey/:id/auto-assign', autoAssignOrder);
adminRouter.post('/orders/:serviceKey/:id/cancel', cancelUnifiedOrder);

// 3. Delivery Partners / Fleet Management
adminRouter.get('/partners', listPartners);
adminRouter.post('/partners', createPartner);
adminRouter.patch('/partners/:id/status', updatePartnerStatus);
adminRouter.put('/partners/:id', updatePartnerProfile);
adminRouter.delete('/partners/:id', deletePartner);
adminRouter.get('/partners/:id/deliveries', getPartnerDeliveries);
adminRouter.get('/partners/:id/scorecard', getPartnerScorecard);

// 4. Live Operations Radar & Telemetry
adminRouter.get('/radar/telemetry', getRadarTelemetry);

// 5. Promotions & Coupon Discounts
adminRouter.get('/broadcasts', listBroadcasts);
adminRouter.post('/broadcasts', createBroadcast);
adminRouter.patch('/broadcasts/:id/toggle', toggleBroadcastStatus);
adminRouter.delete('/broadcasts/:id', deleteBroadcast);

adminRouter.get('/promos', listPromos);
adminRouter.post('/promos', createPromo);
adminRouter.patch('/promos/:id/toggle', togglePromoStatus);
adminRouter.delete('/promos/:id', deletePromo);

// 6. Dynamic Pricing Matrix & Rate Cards
adminRouter.get('/pricing', getPricingMatrix);
adminRouter.put('/pricing/:serviceKey', updateServiceRateCard);

// 7. Finance & Settlements
adminRouter.get('/finance', getFinanceSummary);
adminRouter.post('/finance/settlement', triggerPartnerSettlement);

// 8. Analytics & Insights
adminRouter.get('/analytics', getAnalyticsSummary);

// 9. Helpdesk & Support Tickets Desk
adminRouter.get('/support/tickets', listSupportTickets);
adminRouter.post('/support/tickets', createSupportTicket);
adminRouter.patch('/support/tickets/:id', updateSupportTicket);
adminRouter.delete('/support/tickets/:id', deleteSupportTicket);

// 10. Platform Operational Settings
adminRouter.get('/settings', getPlatformSettings);
adminRouter.put('/settings', updatePlatformSettings);

// 11. Enterprise Audit Trail & Security
adminRouter.get('/audit-logs', listAuditLogs);
adminRouter.get('/export/audit-logs', exportAuditLogsCsv);

// 12. Data Export (CSV)
adminRouter.get('/export/orders', exportOrdersCsv);
adminRouter.get('/export/users', exportUsersCsv);
