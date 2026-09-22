import { Router } from 'express';
import {
  getAboutDelivez,
  getCompanyOverview,
  getOurJourney,
  getNetworkOverview,
  getNetworkHubs,
} from './company-network.controller.js';

export const companyRouter = Router();
companyRouter.get('/about', getAboutDelivez);
companyRouter.get('/overview', getCompanyOverview);
companyRouter.get('/journey', getOurJourney);

export const networkRouter = Router();
networkRouter.get('/overview', getNetworkOverview);
networkRouter.get('/hubs', getNetworkHubs);
