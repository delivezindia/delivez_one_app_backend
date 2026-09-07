import type { GiftDeliverySpeed } from '@prisma/client';
import { GIFT_DELIVERY_CONFIG } from './gift-delivery-config.js';

export interface GiftDeliveryQuoteInput {
  productId?: string;
  productPrice?: number;
  productQuantity?: number;
  deliveryType?: GiftDeliverySpeed;
  selectedAddons?: Array<{ id: string; price?: number; title?: string }>;
  hasHandwrittenCard?: boolean;
  isAnonymousSender?: boolean;
  hasPhotoProof?: boolean;
  hasVideoReaction?: boolean;
  hasPremiumWrap?: boolean;
  hasPremiumSetup?: boolean;
  couponCode?: string;
}

export interface GiftDeliveryFareBreakdownItem {
  key: string;
  label: string;
  amount: number;
}

export interface GiftDeliveryQuoteResult {
  currency: string;
  itemTotal: number;
  deliveryCharge: number;
  packagingCharge: number;
  addonsTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  deliveryTypeName: string;
  couponApplied?: string | null;
  breakdown: GiftDeliveryFareBreakdownItem[];
}

const DELIVERY_SPEED_RATES: Record<GiftDeliverySpeed, { name: string; charge: number }> = {
  STANDARD: { name: 'Standard Delivery', charge: 49 },
  EXPRESS: { name: 'Express Delivery', charge: 99 },
  PRECISE_TIME: { name: 'Precise Time Delivery', charge: 149 },
  MIDNIGHT: { name: 'Midnight Delivery', charge: 199 },
};

export function calculateGiftDeliveryQuote(input: GiftDeliveryQuoteInput): GiftDeliveryQuoteResult {
  // Determine product price
  let unitPrice = 699.0;
  if (input.productPrice && input.productPrice > 0) {
    unitPrice = Number(input.productPrice);
  } else if (input.productId) {
    const product = GIFT_DELIVERY_CONFIG.products.find((p) => p.id === input.productId);
    if (product) {
      unitPrice = product.price;
    }
  }

  const quantity = Math.max(1, input.productQuantity || 1);
  const itemTotal = Math.round(unitPrice * quantity * 100) / 100;

  // Delivery charge
  const deliverySpeedKey: GiftDeliverySpeed = input.deliveryType || 'STANDARD';
  const speedInfo = DELIVERY_SPEED_RATES[deliverySpeedKey] || DELIVERY_SPEED_RATES.STANDARD;
  const deliveryCharge = speedInfo.charge;

  // Packaging charge (₹20 standard)
  const packagingCharge = GIFT_DELIVERY_CONFIG.packagingCharge || 20.0;

  // Add-ons calculation
  let addonsTotal = 0.0;
  const addonItems: GiftDeliveryFareBreakdownItem[] = [];

  if (input.selectedAddons && Array.isArray(input.selectedAddons)) {
    for (const addon of input.selectedAddons) {
      const price = Number(addon.price) || 0;
      if (price > 0) {
        addonsTotal += price;
        addonItems.push({
          key: `ADDON_${addon.id}`,
          label: addon.title || `Add-on (${addon.id})`,
          amount: price,
        });
      }
    }
  }

  const hasHandwritten = Boolean(input.hasHandwrittenCard || (input as any).isHandwrittenCard);
  const hasAnonymous = Boolean(input.isAnonymousSender || (input as any).hasAnonymousSender);
  const hasPhoto = Boolean(input.hasPhotoProof || (input as any).isPhotoProof);
  const hasVideo = Boolean(input.hasVideoReaction || (input as any).isVideoReaction);
  const hasWrap = Boolean(input.hasPremiumWrap || (input as any).isPremiumWrap);
  const hasSetup = Boolean(input.hasPremiumSetup || (input as any).isPremiumSetup);

  if (hasHandwritten && !addonItems.some((a) => a.key.includes('HANDWRITTEN'))) {
    addonsTotal += 79.0;
    addonItems.push({ key: 'PREMIUM_HANDWRITTEN', label: 'Handwritten Message Card', amount: 79.0 });
  }
  if (hasAnonymous && !addonItems.some((a) => a.key.includes('ANONYMOUS'))) {
    addonsTotal += 49.0;
    addonItems.push({ key: 'PREMIUM_ANONYMOUS', label: 'Anonymous Sender Service', amount: 49.0 });
  }
  if (hasPhoto && !addonItems.some((a) => a.key.includes('PHOTO'))) {
    addonsTotal += 39.0;
    addonItems.push({ key: 'PREMIUM_PHOTO_PROOF', label: 'Photo Proof of Delivery', amount: 39.0 });
  }
  if (hasVideo && !addonItems.some((a) => a.key.includes('VIDEO'))) {
    addonsTotal += 79.0;
    addonItems.push({ key: 'PREMIUM_VIDEO_REACTION', label: 'Video Reaction Recording', amount: 79.0 });
  }
  if (hasWrap && !addonItems.some((a) => a.key.includes('WRAP'))) {
    addonsTotal += 49.0;
    addonItems.push({ key: 'PREMIUM_WRAP', label: 'Premium Gift Wrapping', amount: 49.0 });
  }
  if (hasSetup && !addonItems.some((a) => a.key.includes('SETUP'))) {
    addonsTotal += 299.0;
    addonItems.push({ key: 'PREMIUM_SETUP_LUXURY', label: 'Luxury Premium Setup Experience', amount: 299.0 });
  }

  const rawSubtotal = itemTotal + deliveryCharge + packagingCharge + addonsTotal;

  // Coupon handling
  let discountAmount = 0.0;
  let couponApplied: string | null = null;
  const normalizedCoupon = input.couponCode?.trim().toUpperCase();

  if (normalizedCoupon === 'GIFTLOVE') {
    discountAmount = Math.min(60.0, Math.round(rawSubtotal * 0.1 * 100) / 100);
    couponApplied = 'GIFTLOVE (10% OFF)';
  } else if (normalizedCoupon === 'DELIVEZ10') {
    discountAmount = Math.min(50.0, Math.round(rawSubtotal * 0.1 * 100) / 100);
    couponApplied = 'DELIVEZ10 (10% OFF)';
  } else if (normalizedCoupon === 'FIRSTGIFT') {
    discountAmount = Math.min(rawSubtotal, 40.0);
    couponApplied = 'FIRSTGIFT (₹40 OFF)';
  } else if (normalizedCoupon === 'SWEET100') {
    if (rawSubtotal >= 999.0) {
      discountAmount = 100.0;
      couponApplied = 'SWEET100 (₹100 OFF)';
    }
  }

  const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
  // GST 18% (9% CGST + 9% SGST on delivery, packaging & services; items already taxed or service component)
  // For standard delivery app invoicing: 18% GST on services subtotal or standard tax proportion:
  const taxAmount = Math.round((deliveryCharge + packagingCharge + addonsTotal) * 0.18 * 100) / 100;
  const totalAmount = Math.round((rawSubtotal - discountAmount + taxAmount) * 100) / 100;

  const breakdown: GiftDeliveryFareBreakdownItem[] = [
    { key: 'ITEM_TOTAL', label: 'Item Total', amount: itemTotal },
    { key: 'DELIVERY_CHARGE', label: speedInfo.name, amount: deliveryCharge },
    { key: 'PACKAGING_CHARGE', label: 'Packaging Charges', amount: packagingCharge },
    ...addonItems,
  ];

  if (discountAmount > 0) {
    breakdown.push({
      key: 'COUPON_DISCOUNT',
      label: `Discount (${normalizedCoupon})`,
      amount: -discountAmount,
    });
  }

  breakdown.push({ key: 'TAX_GST', label: 'Taxes (GST)', amount: taxAmount });

  return {
    currency: 'INR',
    itemTotal,
    deliveryCharge,
    packagingCharge,
    addonsTotal,
    discountAmount,
    taxAmount,
    totalAmount,
    deliveryTypeName: speedInfo.name,
    couponApplied,
    breakdown,
  };
}
