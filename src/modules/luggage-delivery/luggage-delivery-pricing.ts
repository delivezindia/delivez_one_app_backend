// luggage-delivery-pricing.ts
import {
  luggageServices,
  luggageRoutes,
  luggageSizes,
  luggageAddOns,
  luggageProtections,
  airportAssistanceServices,
  findCoupon,
} from './luggage-delivery-config.js';
import type { LuggageServiceItem, LuggageRouteOption } from './luggage-delivery-config.js';

export interface MasterLuggageItemInput {
  item_id?: number | string;
  luggage_type?: string;
  luggage_type_label?: string;
  size?: 'small' | 'medium' | 'large' | string;
  size_label?: string;
  size_description?: string;
  quantity?: number;
  total_weight_kg?: number;
  weight_unit?: string;
  description?: string;
  special_handling?: {
    fragile?: boolean;
    keep_dry?: boolean;
    temperature_sensitive?: boolean;
  };
  // Legacy fields
  type?: string;
  weightKg?: number;
  isFragile?: boolean;
}

export interface MasterPricingTax {
  tax_type: string;
  tax_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_tax: number;
}

export interface MasterPricingDiscount {
  coupon_code: string | null;
  discount_type: string | null;
  discount_amount: number;
}

export interface MasterPricingContract {
  currency: string;
  distance_km: number;
  base_fare: number;
  distance_fee: number;
  luggage_handling_fee: number;
  airport_handling_fee: number;
  hotel_handling_fee: number;
  delivery_speed_fee: number;
  luggage_protection_fee: number;
  airport_assistance_fee: number;
  add_on_fee: number;
  subtotal: number;
  tax: MasterPricingTax;
  discount: MasterPricingDiscount;
  total_amount: number;
}

export interface CalculateLuggageMasterQuoteInput {
  service_type?: string;
  serviceType?: string;
  serviceId?: string;
  service?: {
    service_id?: string;
  };
  routeType?: string;
  route?: {
    route_type?: string;
    is_multi_stop?: boolean;
    stops?: any[];
  };
  luggage?: {
    total_pieces?: number;
    total_weight_kg?: number;
    items?: MasterLuggageItemInput[];
  };
  luggageItems?: MasterLuggageItemInput[];
  luggage_items?: MasterLuggageItemInput[];
  add_ons?: {
    selected_items?: Array<{ id?: number | string; code?: string; title?: string; quantity?: number }>;
  } | any[];
  selectedAddOns?: Array<string | { id?: number | string; code?: string; quantity?: number }>;
  luggage_protection?: {
    enabled?: boolean;
    selected_items?: any[];
  } | any[];
  protections?: any[];
  selectedProtections?: any[];
  airport_assistance?: {
    enabled?: boolean;
    selected_services?: any[];
  } | any[];
  airportAssistance?: any[];
  selectedAirportAssistance?: any[];
  schedule?: {
    delivery_speed?: {
      type?: string;
      label?: string;
      additional_fee?: number;
    } | string;
  };
  deliverySpeed?: string | number;
  promo?: {
    coupon_code?: string;
    apply_coupon?: boolean;
  };
  couponCode?: string;
  coupon_code?: string;
  applied_coupon?: {
    code?: string;
    discount_type?: string;
    discount_value?: number;
    discount_amount?: number;
  };
  distance_km?: number;
  distanceKm?: number;
  [key: string]: any;
}

export interface MasterQuoteResult {
  quote_id: string;
  pricing: MasterPricingContract;
  expires_at: string;
  // Backward compatibility fields
  subtotal: number;
  totalAmount: number;
  gstAmount: number;
  currency: string;
}

export function calculateLuggageMasterQuote(input: CalculateLuggageMasterQuoteInput): MasterQuoteResult {
  // 1. Resolve Service
  const serviceId =
    input.service?.service_id ||
    input.service_type ||
    input.serviceType ||
    input.serviceId ||
    'home_airport';
  const service = luggageServices.find((s) => s.id === serviceId) ?? luggageServices[0]!;

  // 2. Resolve Route & Multiplier
  let routeType = input.route?.route_type || input.routeType || 'single_trip';
  if (input.route?.is_multi_stop || serviceId === 'multi_stop') {
    routeType = 'multi_stop';
  }
  const route = luggageRoutes.find((r) => r.id === routeType) ?? luggageRoutes[0]!;

  // Base fare
  const base_fare = Math.round(service.baseFare * (route.multiplier || 1));

  // 3. Resolve Luggage Items & Surges
  const rawItems = input.luggage?.items || input.luggageItems || [];
  const items = Array.isArray(rawItems) && rawItems.length > 0
    ? rawItems
    : [{ luggage_type: 'suitcase', size: 'large', quantity: 1, total_weight_kg: 15 }];

  let totalBags = 0;
  let totalWeight = 0;
  let bagSizeSurge = 0;

  for (const item of items) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    totalBags += qty;
    const w = Number(item.total_weight_kg ?? item.weightKg ?? 15);
    totalWeight += w * qty;

    const sizeKey = (item.size || 'medium').toLowerCase();
    const sizeOpt = luggageSizes.find((s) => s.id.toLowerCase() === sizeKey);
    if (sizeOpt && sizeOpt.fee > 0) {
      bagSizeSurge += sizeOpt.fee * qty;
    }
  }

  // Luggage handling fee:
  // - First bag included in base fare, ₹149 per subsequent bag
  // - First 15 kg included in base fare, ₹20 per kg above 15 kg
  // - Bag size surges
  const extraBags = Math.max(0, totalBags - 1);
  const bagCountFare = extraBags * 149;
  const excessWeight = Math.max(0, totalWeight - 15);
  const weightSurge = Math.round(excessWeight * 20);
  const luggage_handling_fee = bagCountFare + bagSizeSurge + weightSurge;

  // 4. Distance Fee: First 15 km included in base fare, ₹15 per km beyond
  const distance_km = Math.max(0, Number(input.distance_km ?? input.distanceKm ?? 18.4));
  const excessDistance = Math.max(0, distance_km - 15);
  const distance_fee = Math.round(excessDistance * 15);

  // 5. Handling Fees (Airport & Hotel)
  let airport_handling_fee = 0;
  let hotel_handling_fee = 0;
  const isAirport = serviceId.includes('airport');
  const isHotel = serviceId.includes('hotel');
  if (isAirport) airport_handling_fee = 50;
  if (isHotel) hotel_handling_fee = 50;

  // 6. Delivery Speed Fee
  let delivery_speed_fee = 0;
  const speedObj = input.schedule?.delivery_speed;
  const speedType = (typeof speedObj === 'object' && speedObj !== null ? (speedObj as any).type : (speedObj || input.deliverySpeed || 'standard')).toString().toLowerCase();

  if (speedType === 'express' || speedType === '1') {
    delivery_speed_fee = 99;
  } else if (speedType === 'precise_time' || speedType === '2') {
    delivery_speed_fee = 149;
  } else if (speedType === 'schedule_later' || speedType === '3') {
    delivery_speed_fee = 49;
  }

  // 7. Add-ons Fee
  let add_on_fee = 0;
  const rawAddons = (input.add_ons as any)?.selected_items || (Array.isArray(input.add_ons) ? input.add_ons : []) || input.selectedAddOns || [];
  if (Array.isArray(rawAddons)) {
    for (const addon of rawAddons) {
      const codeOrId = typeof addon === 'string' ? addon : (addon.code || String(addon.id || ''));
      const qty = typeof addon === 'object' && addon.quantity ? Number(addon.quantity) : 1;
      const match = luggageAddOns.find(
        (a) => a.code === codeOrId || String(a.id) === codeOrId
      );
      if (match) {
        add_on_fee += match.price * qty;
      }
    }
  }

  // 8. Luggage Protection Fee
  let luggage_protection_fee = 0;
  const isProtEnabled = (input.luggage_protection as any)?.enabled !== false;
  const rawProtections = (input.luggage_protection as any)?.selected_items || (Array.isArray(input.luggage_protection) ? input.luggage_protection : []) || (Array.isArray(input.protections) ? input.protections : []) || input.selectedProtections || [];
  if (isProtEnabled && Array.isArray(rawProtections)) {
    for (const prot of rawProtections) {
      const id = typeof prot === 'string' ? prot : (prot.id || prot.code);
      const match = luggageProtections.find((p) => p.id === id);
      if (match) {
        luggage_protection_fee += match.price;
      }
    }
  }

  // 9. Airport Assistance Fee
  let airport_assistance_fee = 0;
  const isAssistEnabled = (input.airport_assistance as any)?.enabled !== false;
  const rawAssistance = (input.airport_assistance as any)?.selected_services || (Array.isArray(input.airport_assistance) ? input.airport_assistance : []) || (Array.isArray(input.airportAssistance) ? input.airportAssistance : []) || input.selectedAirportAssistance || [];
  if (isAssistEnabled && Array.isArray(rawAssistance)) {
    for (const assist of rawAssistance) {
      const id = typeof assist === 'string' ? assist : (assist.id || assist.code);
      const match = airportAssistanceServices.find((a) => a.id === id);
      if (match) {
        airport_assistance_fee += match.price;
      }
    }
  }

  // 10. Subtotal
  const subtotal =
    base_fare +
    distance_fee +
    luggage_handling_fee +
    airport_handling_fee +
    hotel_handling_fee +
    delivery_speed_fee +
    luggage_protection_fee +
    airport_assistance_fee +
    add_on_fee;

  // 11. Discount (Coupon Engine)
  const couponCode = input.applied_coupon?.code || input.promo?.coupon_code || input.coupon_code || input.couponCode || null;
  const applyCoupon = input.promo?.apply_coupon !== false;
  let discount_amount = 0;
  let discount_type: string | null = null;
  let appliedCode: string | null = null;

  if (couponCode && applyCoupon) {
    const coupon = findCoupon(couponCode);
    if (coupon && subtotal >= coupon.minSubtotal) {
      appliedCode = coupon.code;
      discount_type = coupon.discountType;
      if (coupon.discountType === 'percentage') {
        const rawDiscount = (subtotal * coupon.discountValue) / 100;
        discount_amount = Math.min(coupon.maxDiscount, Math.round(rawDiscount * 100) / 100);
      } else {
        discount_amount = Math.min(coupon.maxDiscount, coupon.discountValue);
      }
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount_amount);

  // 12. 18% GST (CGST 9% + SGST 9%)
  const cgst_rate = 9;
  const sgst_rate = 9;
  const igst_rate = 0;
  const cgst_amount = Math.round(discountedSubtotal * 0.09 * 100) / 100;
  const sgst_amount = Math.round(discountedSubtotal * 0.09 * 100) / 100;
  const igst_amount = 0;
  const total_tax = Math.round((cgst_amount + sgst_amount) * 100) / 100;

  // 13. Total Amount
  const total_amount = Math.round((discountedSubtotal + total_tax) * 100) / 100;

  // Generate Quote ID and 30-min Expiration
  const now = new Date();
  const quote_id = 'QUOTE-LG-' + now.getTime().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
  const expires_at = new Date(now.getTime() + 30 * 60 * 1000).toISOString();

  const pricing: MasterPricingContract = {
    currency: 'INR',
    distance_km,
    base_fare,
    distance_fee,
    luggage_handling_fee,
    airport_handling_fee,
    hotel_handling_fee,
    delivery_speed_fee,
    luggage_protection_fee,
    airport_assistance_fee,
    add_on_fee,
    subtotal,
    tax: {
      tax_type: 'GST',
      tax_rate: 18,
      cgst_rate,
      sgst_rate,
      igst_rate,
      cgst_amount,
      sgst_amount,
      igst_amount,
      total_tax,
    },
    discount: {
      coupon_code: appliedCode,
      discount_type,
      discount_amount,
    },
    total_amount,
  };

  return {
    quote_id,
    pricing,
    expires_at,
    subtotal,
    totalAmount: total_amount,
    gstAmount: total_tax,
    currency: 'INR',
  };
}

// Backward compatibility wrapper
export const calculateLuggageQuote = (input: any) => {
  return calculateLuggageMasterQuote(input);
};
