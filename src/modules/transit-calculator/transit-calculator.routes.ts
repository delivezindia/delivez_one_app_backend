import { Router } from 'express';
import {
  getTransitConfigHandler,
  calculateTransitHandler,
  getOptionBreakupHandler,
  downloadEstimateHandler,
  shareEstimateHandler,
} from './transit-calculator.controller.js';

export const transitCalculatorRouter = Router();

transitCalculatorRouter.get('/config', getTransitConfigHandler);
transitCalculatorRouter.post('/calculate', calculateTransitHandler);
transitCalculatorRouter.get('/breakup/:optionId', getOptionBreakupHandler);
transitCalculatorRouter.get('/download/:id', downloadEstimateHandler);
transitCalculatorRouter.post('/download', downloadEstimateHandler);
transitCalculatorRouter.post('/share', shareEstimateHandler);
