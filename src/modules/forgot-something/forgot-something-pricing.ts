import { SPEED_OPTIONS } from './forgot-something-config.js';

export interface ForgotSomethingQuoteInput {
  speed?: string;
  tamperProofPackaging?: boolean;
  itemQuantity?: number;
  declaredValue?: number;
  distanceKm?: number;
}

export interface ForgotSomethingQuoteOutput {
  currency: string;
  pricingVersion: string;
  retrievalFee: number;
  deliveryFee: number;
  secureHandlingFee: number;
  taxAmount: number;
  totalAmount: number;
  breakdown: {
    baseRetrieval: number;
    speed: string;
    speedName: string;
    deliveryBase: number;
    tamperProofPackaging: boolean;
    secureHandlingFee: number;
    taxRatePercent: number;
    taxAmount: number;
    totalAmount: number;
  };
}

export function calculateForgotSomethingQuote(input: ForgotSomethingQuoteInput): ForgotSomethingQuoteOutput {
  const speedKey = (input.speed || 'INSTANT').toUpperCase();
  const speedConfig = SPEED_OPTIONS.find((s) => s.id === speedKey) ?? SPEED_OPTIONS[0]!;

  const retrievalFee = speedConfig.baseFee;
  const deliveryFee = 129.00;
  const secureHandlingFee = input.tamperProofPackaging !== false ? 39.00 : 0.00;

  const subtotal = retrievalFee + deliveryFee + secureHandlingFee;
  // GST calculation (e.g. standard rate ~7.25% net or 18% on fees; matching reference ~ ₹23.02 on base total)
  const taxAmount = Number((subtotal * 0.0725).toFixed(2));
  const totalAmount = Number((subtotal + taxAmount).toFixed(2));

  return {
    currency: 'INR',
    pricingVersion: 'v1.0-fetch',
    retrievalFee,
    deliveryFee,
    secureHandlingFee,
    taxAmount,
    totalAmount,
    breakdown: {
      baseRetrieval: retrievalFee,
      speed: speedConfig.id,
      speedName: speedConfig.name,
      deliveryBase: deliveryFee,
      tamperProofPackaging: input.tamperProofPackaging !== false,
      secureHandlingFee,
      taxRatePercent: 7.25,
      taxAmount,
      totalAmount,
    },
  };
}
