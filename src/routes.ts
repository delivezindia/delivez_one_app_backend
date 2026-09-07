import { getActivePublicBroadcasts } from './modules/admin/admin-broadcast.controller.js';
import { Router } from 'express';

import { addressRouter } from './modules/addresses/address.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { universalTrackOrder } from './modules/admin/admin-management.controller.js';
import { adminServiceRouter } from './modules/admin/admin-service.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { confidentialCourierRouter } from './modules/confidential-courier/confidential-courier.routes.js';
import { confidentialDeliveryRouter } from './modules/confidential-delivery/confidential-delivery.routes.js';
import { forgotSomethingRouter } from './modules/forgot-something/forgot-something.routes.js';
import { giftDeliveryAdminRouter } from './modules/gift-delivery/gift-delivery-admin.routes.js';
import { giftDeliveryRouter } from './modules/gift-delivery/gift-delivery.routes.js';
import { personalCourierRouter } from './modules/personal-courier/personal-courier.routes.js';
import { returnPickupRouter } from './modules/return-pickup/return-pickup.routes.js';
import { serviceRouter } from './modules/services/service.routes.js';
import { systemRouter } from './modules/system/system.routes.js';

export const apiRouter = Router();

apiRouter.get('/', (_request, response) => {
  response.status(200).json({
    data: {
      name: 'delivery-api',
      version: 'v1',
    },
  });
});

apiRouter.use('/addresses', addressRouter);
apiRouter.use('/admin/gift-delivery', giftDeliveryAdminRouter);
apiRouter.use('/admin/gifts', giftDeliveryAdminRouter);
apiRouter.use('/admin/services', adminServiceRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/courier-delivery', personalCourierRouter);
apiRouter.use('/courier', personalCourierRouter);
apiRouter.use('/personal-courier', personalCourierRouter);
apiRouter.use('/luggage-delivery', confidentialCourierRouter);
apiRouter.use('/confidential-courier', confidentialCourierRouter);
apiRouter.use('/confidential-delivery', confidentialDeliveryRouter);
apiRouter.use('/vault', confidentialDeliveryRouter);
apiRouter.use('/forgot-something', forgotSomethingRouter);
apiRouter.use('/fetch', forgotSomethingRouter);
apiRouter.use('/return-pickup', returnPickupRouter);
apiRouter.use('/returns', returnPickupRouter);
apiRouter.use('/gift-delivery', giftDeliveryRouter);
apiRouter.use('/gifts', giftDeliveryRouter);
apiRouter.use('/health', systemRouter);
apiRouter.use('/services', serviceRouter);
apiRouter.get('/track/:trackingId', universalTrackOrder);
apiRouter.get('/broadcasts/active', getActivePublicBroadcasts);




