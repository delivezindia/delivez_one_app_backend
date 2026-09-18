import type { CanonicalServiceType } from './vault-courier.validation.js';

export interface PricingCalculationResult {
  basePrice: number;
  additionalCharges: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    serviceBaseFare: number;
    securityLevelCharge: number;
    packagingCharge: number;
    protectionCharges: number;
    stopsCharge: number;
    highValueCharge: number;
    gstRate: number;
    gstAmount: number;
  };
}

const SERVICE_BASE_PRICES: Record<CanonicalServiceType, number> = {
  'Vault Secure': 499,
  'Vault Priority': 799,
  'Vault Direct': 999,
  'Vault Precise': 899,
  'Vault Hand Carry': 2499,
  'Vault Return': 699,
  'Vault Exchange': 849,
  'Vault Critical': 2999,
  'Vault MultiPoint': 599,
};

const SECURITY_LEVEL_CHARGES: Record<string, number> = {
  'Standard Security': 0,
  'Enhanced Security': 200,
  'Maximum Security': 500,
  STANDARD_SECURITY: 0,
  ENHANCED_SECURITY: 200,
  MAXIMUM_SECURITY: 500,
};

const PACKAGING_CHARGES: Record<string, number> = {
  'Standard Box': 50,
  'Padded Envelope': 40,
  'Tamper Proof Pouch': 75,
  'Bubble Wrap': 50,
  'Heavy Duty Crate': 300,
  'Document Sleeve': 30,
  'My Own Package': 0,
  STANDARD_BOX: 50,
  PADDED_ENVELOPE: 40,
  TAMPER_PROOF_POUCH: 75,
  HEAVY_DUTY_CRATE: 300,
  DOCUMENT_SLEEVE: 30,
  MY_OWN_PACKAGE: 0,
};

export function calculateAuthoritativePrice(payload: any): PricingCalculationResult {
  const serviceType: CanonicalServiceType =
    payload.service_type || payload.serviceType || 'Vault Secure';
  const serviceBaseFare = SERVICE_BASE_PRICES[serviceType] ?? 499;

  // 1. Security Level Charge
  const step5 = payload.step_5_security_level || payload.security || {};
  const secLevel =
    step5.selected_security_level ||
    step5.securityLevel ||
    payload.securityLevel ||
    'Standard Security';
  const securityLevelCharge = SECURITY_LEVEL_CHARGES[secLevel] ?? 0;

  // 2. Packaging & Protections Charge
  const step4 = payload.step_4_packaging_options || payload.packaging || {};
  const pkgType =
    step4.selected_package ||
    step4.packagingType ||
    payload.packaging ||
    'Standard Box';
  const packagingCharge = PACKAGING_CHARGES[pkgType] ?? 50;

  let protectionCharges = 0;
  const addons = step4.add_on_protection || {};
  if (addons.extra_bubble_wrap) protectionCharges += 40;
  if (addons.corner_guard) protectionCharges += 30;
  if (addons.waterproof_cover) protectionCharges += 50;
  if (addons.fragile_sticker) protectionCharges += 20;
  if (addons.seal_and_security_tape) protectionCharges += 60;

  if (Array.isArray(step4.addonProtections)) {
    if (step4.addonProtections.includes('EXTRA_BUBBLE_WRAP')) protectionCharges += 40;
    if (step4.addonProtections.includes('CORNER_GUARD')) protectionCharges += 30;
    if (step4.addonProtections.includes('WATERPROOF_COVER')) protectionCharges += 50;
    if (step4.addonProtections.includes('FRAGILE_STICKER')) protectionCharges += 20;
    if (step4.addonProtections.includes('SECURITY_TAPE')) protectionCharges += 60;
  }

  // 3. MultiPoint Stops Charge
  let stopsCharge = 0;
  if (serviceType === 'Vault MultiPoint') {
    const step2 = payload.step_2_recipient_and_delivery || {};
    const setups = step2.service_specific_setup || {};
    const multiPoint = setups['Vault MultiPoint'] || payload.multipointDetails || {};
    const stops = multiPoint.delivery_points || multiPoint.stops || [];
    if (stops.length > 2) {
      stopsCharge = (stops.length - 2) * 150;
    }
  }

  // 4. High Value Declared Insurance Charge
  let highValueCharge = 0;
  const step3 = payload.step_3_item_type_and_information || payload.item || {};
  const itemInfo = step3.item_information || step3;
  const declaredVal = Number(itemInfo.declared_value || itemInfo.declaredValue || payload.declaredValue || 0);
  if (declaredVal > 50000) {
    highValueCharge = Math.round((declaredVal - 50000) * 0.005);
  }

  const basePrice = serviceBaseFare;
  const additionalCharges =
    securityLevelCharge +
    packagingCharge +
    protectionCharges +
    stopsCharge +
    highValueCharge;

  const subtotal = basePrice + additionalCharges;
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;

  return {
    basePrice,
    additionalCharges,
    taxAmount: gstAmount,
    totalAmount,
    currency: 'INR',
    breakdown: {
      serviceBaseFare,
      securityLevelCharge,
      packagingCharge,
      protectionCharges,
      stopsCharge,
      highValueCharge,
      gstRate: 18,
      gstAmount,
    },
  };
}
