// luggage-delivery-pricing.ts
import {
  luggageServices,
  luggageRoutes,
  luggageSizes,
  luggageAddOns,
  luggageProtections,
  airportAssistanceServices,
} from './luggage-delivery-config.js';
import type { LuggageServiceItem, LuggageRouteOption } from './luggage-delivery-config.js';

export interface LuggageItemInput {
  type?: string;
  size?: 'small' | 'medium' | 'large' | string;
  quantity?: number;
  weightKg?: number;
  isFragile?: boolean;
}

export interface CalculateLuggageQuoteInput {
  serviceId?: string;
  routeType?: 'single_trip' | 'round_trip' | 'multi_stop' | string;
  luggageItems?: LuggageItemInput[];
  selectedAddOns?: string[];
  selectedProtections?: string[];
  selectedAirportAssistance?: string[];
  deliverySpeed?: 'STANDARD' | 'EXPRESS' | 'PRECISE_TIME' | 'SCHEDULE_LATER' | number | string;
  distanceKm?: number;
}

export interface LuggagePricingBreakdown {
  serviceId: string;
  serviceTitle: string;
  routeType: string;
  routeTitle: string;
  baseFare: number;
  routeMultiplier: number;
  distanceKm: number;
  distanceFare: number;
  bagCount: number;
  bagCountFare: number;
  bagSizeSurge: number;
  weightKg: number;
  weightSurge: number;
  protectionsFare: number;
  protectionsList: Array<{ id: string; title: string; price: number }>;
  addOnsFare: number;
  addOnsList: Array<{ id: string; title: string; price: number }>;
  assistanceFare: number;
  assistanceList: Array<{ id: string; title: string; price: number }>;
  deliverySpeedFare: number;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
}

export function calculateLuggageQuote(input: CalculateLuggageQuoteInput): LuggagePricingBreakdown {
  const defaultService: LuggageServiceItem = luggageServices[0]!;
  const serviceId = input.serviceId || 'home_airport';
  const service = luggageServices.find((s) => s.id === serviceId) ?? defaultService;
  
  const defaultRoute: LuggageRouteOption = luggageRoutes[0]!;
  const routeType = input.routeType || 'single_trip';
  const route = luggageRoutes.find((r) => r.id === routeType) ?? defaultRoute;

  // 1. Base fare with route multiplier
  const baseFare = Math.round(service.baseFare * route.multiplier);

  // 2. Luggage items pricing
  const items = Array.isArray(input.luggageItems) && input.luggageItems.length > 0
    ? input.luggageItems
    : [{ type: 'SUITCASE_TROLLEY', size: 'medium', quantity: 1, weightKg: 15 }];

  let totalBags = 0;
  let totalWeight = 0;
  let bagSizeSurge = 0;

  for (const item of items) {
    const qty = Math.max(1, Number(item.quantity) || 1);
    totalBags += qty;
    const w = Number(item.weightKg) || 15;
    totalWeight += w * qty;

    const sizeOpt = luggageSizes.find((s) => s.id.toLowerCase() === (item.size || 'medium').toLowerCase());
    if (sizeOpt && sizeOpt.fee > 0) {
      bagSizeSurge += sizeOpt.fee * qty;
    }
  }

  // Extra bag count fee (First bag included in base fare, subsequent bags ₹149 each)
  const extraBags = Math.max(0, totalBags - 1);
  const bagCountFare = extraBags * 149;

  // Extra weight surge: First 15 kg included free, ₹20 per kg above 15 kg
  const billableExcessWeight = Math.max(0, totalWeight - 15);
  const weightSurge = Math.round(billableExcessWeight * 20);

  // 3. Distance fee: First 15 km included in base fare, ₹15 per km beyond
  const distanceKm = Math.max(0, Number(input.distanceKm) || 12);
  const excessDistance = Math.max(0, distanceKm - 15);
  const distanceFare = Math.round(excessDistance * 15);

  // 4. Protections fee
  const selProtections = Array.isArray(input.selectedProtections) ? input.selectedProtections : [];
  const protectionsList: Array<{ id: string; title: string; price: number }> = [];
  let protectionsFare = 0;
  for (const pid of selProtections) {
    const match = luggageProtections.find((p) => p.id === pid);
    if (match) {
      protectionsList.push({ id: match.id, title: match.title, price: match.price });
      protectionsFare += match.price;
    }
  }

  // 5. Add-ons fee
  const selAddOns = Array.isArray(input.selectedAddOns) ? input.selectedAddOns : [];
  const addOnsList: Array<{ id: string; title: string; price: number }> = [];
  let addOnsFare = 0;
  for (const aid of selAddOns) {
    const match = luggageAddOns.find((a) => a.id === aid);
    if (match) {
      addOnsList.push({ id: match.id, title: match.title, price: match.price });
      addOnsFare += match.price;
    }
  }

  // 6. Airport Assistance fee
  const selAssistance = Array.isArray(input.selectedAirportAssistance) ? input.selectedAirportAssistance : [];
  const assistanceList: Array<{ id: string; title: string; price: number }> = [];
  let assistanceFare = 0;
  for (const asid of selAssistance) {
    const match = airportAssistanceServices.find((a) => a.id === asid);
    if (match) {
      assistanceList.push({ id: match.id, title: match.title, price: match.price });
      assistanceFare += match.price;
    }
  }

  // 7. Delivery Speed fee
  let deliverySpeedFare = 0;
  const speed = String(input.deliverySpeed || 'STANDARD').toUpperCase();
  if (speed === 'EXPRESS' || speed === '1') {
    deliverySpeedFare = 99;
  } else if (speed === 'PRECISE_TIME' || speed === '2') {
    deliverySpeedFare = 149;
  } else if (speed === 'SCHEDULE_LATER' || speed === '3') {
    deliverySpeedFare = 49;
  }

  // Subtotal
  const subtotal =
    baseFare +
    distanceFare +
    bagCountFare +
    bagSizeSurge +
    weightSurge +
    protectionsFare +
    addOnsFare +
    assistanceFare +
    deliverySpeedFare;

  // 18% GST standard on courier & logistics handling
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const totalAmount = subtotal + gstAmount;

  return {
    serviceId: service.id,
    serviceTitle: service.title,
    routeType: route.id,
    routeTitle: route.title,
    baseFare,
    routeMultiplier: route.multiplier,
    distanceKm,
    distanceFare,
    bagCount: totalBags,
    bagCountFare,
    bagSizeSurge,
    weightKg: totalWeight,
    weightSurge,
    protectionsFare,
    protectionsList,
    addOnsFare,
    addOnsList,
    assistanceFare,
    assistanceList,
    deliverySpeedFare,
    subtotal,
    gstRate: 18,
    gstAmount,
    totalAmount,
    currency: 'INR',
  };
}
