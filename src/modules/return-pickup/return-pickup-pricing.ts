import type { ReturnDeliveryService } from '@prisma/client';

export interface ReturnPickupQuoteInput {
  deliveryService?: ReturnDeliveryService;
  shipmentProtection?: boolean;
  itemQuantity?: number;
  declaredValue?: number;
  approxWeightKg?: number;
  couponCode?: string;
}

export interface ReturnPickupFareBreakdownItem {
  key: string;
  label: string;
  amount: number;
}

export interface ReturnPickupQuoteResult {
  currency: string;
  basePickupCharge: number;
  distanceCharge: number;
  handlingCharge: number;
  deliveryServiceCharge: number;
  protectionCharge: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  deliveryServiceName: string;
  couponApplied?: string | null;
  breakdown: ReturnPickupFareBreakdownItem[];
}

const SERVICE_RATES: Record<ReturnDeliveryService, { name: string; charge: number }> = {
  STANDARD: { name: 'Standard Delivery', charge: 89 },
  EXPRESS: { name: 'Express Delivery', charge: 149 },
  PRECISE_TIME: { name: 'Precise Time Delivery', charge: 199 },
  APPOINTMENT_BASED: { name: 'Appointment Based Delivery', charge: 99 },
};

export function calculateReturnPickupQuote(input: ReturnPickupQuoteInput): ReturnPickupQuoteResult {
  const serviceKey: ReturnDeliveryService = input.deliveryService || 'STANDARD';
  const serviceInfo = SERVICE_RATES[serviceKey] || SERVICE_RATES.STANDARD;

  const basePickupCharge = 49.0;
  const distanceCharge = 20.0;

  // Extra quantity handling charge if > 1 item (₹5 per additional item)
  const quantity = Math.max(1, input.itemQuantity || 1);
  const extraItemCharge = (quantity - 1) * 5.0;
  const handlingCharge = 10.0 + extraItemCharge;

  const deliveryServiceCharge = serviceInfo.charge;
  const protectionCharge = input.shipmentProtection !== false ? 19.0 : 0.0;

  const rawSubtotal =
    basePickupCharge + distanceCharge + handlingCharge + deliveryServiceCharge + protectionCharge;

  // Coupon handling
  let discountAmount = 0.0;
  let couponApplied: string | null = null;
  const normalizedCoupon = input.couponCode?.trim().toUpperCase();

  if (normalizedCoupon === 'DELIVEZ10') {
    discountAmount = Math.min(50, Math.round(rawSubtotal * 0.1 * 100) / 100);
    couponApplied = 'DELIVEZ10 (10% OFF)';
  } else if (normalizedCoupon === 'SAVE20') {
    discountAmount = Math.min(80, Math.round(rawSubtotal * 0.2 * 100) / 100);
    couponApplied = 'SAVE20 (20% OFF)';
  } else if (normalizedCoupon === 'FIRSTRETURN') {
    discountAmount = Math.min(rawSubtotal, 40.0);
    couponApplied = 'FIRSTRETURN (₹40 OFF)';
  } else if (normalizedCoupon === 'FREESHIP') {
    discountAmount = Math.min(rawSubtotal, 19.0);
    couponApplied = 'FREESHIP (Protection Discount)';
  }

  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  // GST 18% (9% CGST + 9% SGST)
  const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const breakdown: ReturnPickupFareBreakdownItem[] = [
    { key: 'BASE_PICKUP', label: 'Base Pickup Charge', amount: basePickupCharge },
    { key: 'DISTANCE', label: 'Distance Charge', amount: distanceCharge },
    { key: 'HANDLING', label: 'Item Handling Fee', amount: handlingCharge },
    { key: 'DELIVERY_SERVICE', label: serviceInfo.name, amount: deliveryServiceCharge },
  ];

  if (protectionCharge > 0) {
    breakdown.push({
      key: 'PROTECTION',
      label: 'Shipment Protection Cover',
      amount: protectionCharge,
    });
  }

  if (discountAmount > 0) {
    breakdown.push({
      key: 'DISCOUNT',
      label: `Coupon Discount (${normalizedCoupon})`,
      amount: -discountAmount,
    });
  }

  breakdown.push({ key: 'TAX', label: 'GST (18%)', amount: taxAmount });

  return {
    currency: 'INR',
    basePickupCharge,
    distanceCharge,
    handlingCharge,
    deliveryServiceCharge,
    protectionCharge,
    discountAmount,
    taxAmount,
    totalAmount,
    deliveryServiceName: serviceInfo.name,
    couponApplied,
    breakdown,
  };
}
