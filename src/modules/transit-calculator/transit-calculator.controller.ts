import type { Request, RequestHandler } from 'express';
import {
  TRANSIT_CALCULATOR_CONFIG,
  computeTransitCalculation,
  getCalculationById,
} from './transit-calculator.store.js';
import type { TransitCalculatorInput } from './transit-calculator.types.js';

function getBaseApiUrl(req: Request): string {
  const host = req.get('host') || 'localhost:4000';
  return `${req.protocol}://${host}/api/v1`;
}

export const getTransitConfigHandler: RequestHandler = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: TRANSIT_CALCULATOR_CONFIG,
  });
};

export const calculateTransitHandler: RequestHandler = (req, res) => {
  const body = req.body || {};
  const baseUrl = getBaseApiUrl(req);

  const input: TransitCalculatorInput = {
    from: String(body.from || TRANSIT_CALCULATOR_CONFIG.defaultValues.from),
    fromPincode: body.fromPincode ? String(body.fromPincode) : undefined,
    to: String(body.to || TRANSIT_CALCULATOR_CONFIG.defaultValues.to),
    toPincode: body.toPincode ? String(body.toPincode) : undefined,
    shipmentType: String(body.shipmentType || body.shipment_type || 'Parcel'),
    serviceType: String(body.serviceType || body.service_type || 'Surface Express'),
    weight: Number(body.weight) || 25,
    dimensions: body.dimensions || {
      length: Number(body.length) || 40,
      width: Number(body.width) || 30,
      height: Number(body.height) || 25,
    },
    noOfPackages: Number(body.noOfPackages || body.no_of_packages || body.packages) || 1,
    valueOfGoods: body.valueOfGoods || body.value_of_goods ? Number(body.valueOfGoods || body.value_of_goods) : 15000,
  };

  const result = computeTransitCalculation(input, baseUrl);

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const getOptionBreakupHandler: RequestHandler = (req, res) => {
  const rawId = typeof req.params.optionId === 'string' ? req.params.optionId : '';
  const baseUrl = getBaseApiUrl(req);
  const defaultCalc = computeTransitCalculation(TRANSIT_CALCULATOR_CONFIG.defaultValues, baseUrl);
  const option = defaultCalc.deliveryOptions.find(o => o.id === rawId) || defaultCalc.deliveryOptions[0]!;

  res.status(200).json({
    status: 'success',
    data: {
      option,
      costBreakup: option.costBreakup,
    },
  });
};

export const downloadEstimateHandler: RequestHandler = (req, res) => {
  const rawId = typeof req.params.id === 'string' ? req.params.id : '';
  const calc = (rawId && getCalculationById(rawId)) || computeTransitCalculation(TRANSIT_CALCULATOR_CONFIG.defaultValues);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="Delivez_Transit_Estimate_${calc.id}.json"`);
  res.status(200).json({
    status: 'success',
    message: 'Estimate ready for download',
    data: {
      documentType: 'TRANSIT_TIME_AND_COST_ESTIMATE',
      estimateNumber: calc.id,
      generatedAt: new Date().toISOString(),
      summary: calc.summary,
      selectedService: calc.selectedOption.name,
      costBreakup: calc.selectedOption.costBreakup,
      totalPayable: calc.selectedOption.estimatedCost,
      insuranceCoverage: calc.insuranceDetails.coverageLimit,
      disclaimer: calc.transitJourney.notice,
    },
  });
};

export const shareEstimateHandler: RequestHandler = (req, res) => {
  const body = req.body || {};
  const baseUrl = getBaseApiUrl(req);
  const rawId = typeof body.id === 'string' ? body.id : '';
  const calc = (rawId && getCalculationById(rawId)) || computeTransitCalculation(TRANSIT_CALCULATOR_CONFIG.defaultValues, baseUrl);

  res.status(200).json({
    status: 'success',
    message: 'Estimate link generated successfully',
    data: {
      shareableUrl: `${baseUrl}/transit-calculator/estimate/${calc.id}`,
      shareableText: `Check out my shipping estimate on Delivez: ${calc.summary.from} to ${calc.summary.to} for ₹${calc.selectedOption.estimatedCost} (${calc.selectedOption.deliveryTime})`,
      estimateId: calc.id,
      summary: calc.summary,
      selectedOption: calc.selectedOption,
    },
  });
};
