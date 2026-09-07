import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';

export interface ServicePricingRateCard {
  serviceKey: string;
  serviceName: string;
  baseFare: number;
  baseKmIncluded: number;
  perKmRate: number;
  weightSurchargePerKg: number;
  nightSurcharge: number;
  specialAddons: Record<string, number>;
  minimumCharge: number;
  taxPercentage: number;
  updatedAt: string;
}

let rateCardsStore: Record<string, ServicePricingRateCard> = {
  'personal-courier': {
    serviceKey: 'personal-courier',
    serviceName: 'Personal Courier',
    baseFare: 49,
    baseKmIncluded: 3,
    perKmRate: 14,
    weightSurchargePerKg: 25,
    nightSurcharge: 30,
    specialAddons: { expressPriority: 49, insuranceCover: 39 },
    minimumCharge: 49,
    taxPercentage: 18,
    updatedAt: new Date().toISOString(),
  },
  'confidential-courier': {
    serviceKey: 'confidential-courier',
    serviceName: 'Confidential Courier & Luggage',
    baseFare: 199,
    baseKmIncluded: 5,
    perKmRate: 28,
    weightSurchargePerKg: 40,
    nightSurcharge: 80,
    specialAddons: { biometricHandover: 149, armoredEscort: 299, tamperVaultSeal: 49 },
    minimumCharge: 199,
    taxPercentage: 18,
    updatedAt: new Date().toISOString(),
  },
  'forgot-something': {
    serviceKey: 'forgot-something',
    serviceName: 'Forgot Something Retrieval',
    baseFare: 79,
    baseKmIncluded: 3,
    perKmRate: 16,
    weightSurchargePerKg: 20,
    nightSurcharge: 40,
    specialAddons: { urgentRush45Min: 69, waitTimePer15Min: 35 },
    minimumCharge: 79,
    taxPercentage: 18,
    updatedAt: new Date().toISOString(),
  },
  'return-pickup': {
    serviceKey: 'return-pickup',
    serviceName: 'Return & Exchange Pickup',
    baseFare: 59,
    baseKmIncluded: 4,
    perKmRate: 12,
    weightSurchargePerKg: 15,
    nightSurcharge: 25,
    specialAddons: { rmaVerificationCheck: 39, tamperProofPolybag: 20 },
    minimumCharge: 59,
    taxPercentage: 18,
    updatedAt: new Date().toISOString(),
  },
  'gift-delivery': {
    serviceKey: 'gift-delivery',
    serviceName: 'Gift & Surprise Delivery',
    baseFare: 49,
    baseKmIncluded: 5,
    perKmRate: 15,
    weightSurchargePerKg: 20,
    nightSurcharge: 60,
    specialAddons: { midnightDelivery: 199, luxuryWrap: 49, handwrittenCard: 79, videoReaction: 79 },
    minimumCharge: 49,
    taxPercentage: 18,
    updatedAt: new Date().toISOString(),
  },
};

export const getPricingMatrix: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      rateCards: rateCardsStore,
      servicesList: Object.values(rateCardsStore).map(r => ({ key: r.serviceKey, name: r.serviceName })),
    },
  });
};

export const updateServiceRateCard: RequestHandler = (req, res) => {
  const serviceKey = String(req.params.serviceKey || '').toLowerCase();
  const existing = rateCardsStore[serviceKey];
  if (!existing) {
    throw new AppError(404, `Rate card for '${serviceKey}' not found.`);
  }

  const {
    baseFare,
    baseKmIncluded,
    perKmRate,
    weightSurchargePerKg,
    nightSurcharge,
    specialAddons,
    minimumCharge,
    taxPercentage,
  } = req.body;

  rateCardsStore[serviceKey] = {
    ...existing,
    ...(typeof baseFare === 'number' ? { baseFare } : {}),
    ...(typeof baseKmIncluded === 'number' ? { baseKmIncluded } : {}),
    ...(typeof perKmRate === 'number' ? { perKmRate } : {}),
    ...(typeof weightSurchargePerKg === 'number' ? { weightSurchargePerKg } : {}),
    ...(typeof nightSurcharge === 'number' ? { nightSurcharge } : {}),
    ...(typeof minimumCharge === 'number' ? { minimumCharge } : {}),
    ...(typeof taxPercentage === 'number' ? { taxPercentage } : {}),
    ...(specialAddons && typeof specialAddons === 'object' ? { specialAddons: { ...existing.specialAddons, ...specialAddons } } : {}),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    status: 'success',
    message: `Rate card for ${existing.serviceName} updated successfully.`,
    data: { rateCard: rateCardsStore[serviceKey] },
  });
};
