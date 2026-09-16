export interface LocationCoordinates {
  latitude: number | null;
  longitude: number | null;
}
import { getAddonsList, PROMO_CODES } from './courier-config.js';

export interface CourierQuoteRequest {
  serviceType?: string;
  selectedServiceId?: string;
  isRoundTrip?: boolean;
  selfServiceOption?: 'SELF_PICKUP' | 'SELF_DROP' | string | null;
  pickup?: {
    latitude?: number | null;
    longitude?: number | null;
    addressLine1?: string;
    city?: string;
  };
  dropoff?: {
    latitude?: number | null;
    longitude?: number | null;
    addressLine1?: string;
    city?: string;
  };
  package?: {
    luggageType?: string;
    luggageSize?: string;
    pieceCount?: number;
    totalWeightKg?: number;
    actualWeightKg?: number;
    chargeableWeightKg?: number;
    declaredValue?: number | null;
    packagingType?: string;
    parcelSize?: string;
    needsBox?: boolean;
    boxSize?: string;
    weightCapacity?: string;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    fragile?: boolean;
    secureHandling?: boolean;
    insuranceType?: string;
    specialHandling?: {
      fragile?: boolean;
      secureHandling?: boolean;
      keepDry?: boolean;
      temperatureSensitive?: boolean;
    };
  };
  addons?: string[];
  deliverySpeed?: string;
  promoCode?: string;
}

// Distance approximation between coordinates (Haversine formula)
export const haversineDistance = (
  coords1: { latitude?: number | null; longitude?: number | null },
  coords2: { latitude?: number | null; longitude?: number | null },
): number | null => {
  if (
    coords1.latitude == null ||
    coords1.longitude == null ||
    coords2.latitude == null ||
    coords2.longitude == null
  ) {
    return null;
  }

  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coords2.latitude - coords1.latitude);
  const dLon = toRad(coords2.longitude - coords1.longitude);
  const lat1 = toRad(coords1.latitude);
  const lat2 = toRad(coords2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

export const calculateCourierQuote = (request: CourierQuoteRequest) => {
  const parcel = (request.package || {}) as any;
  const rootReq = request as any;
  const rawService = request.selectedServiceId || request.serviceType || request.deliverySpeed || 'BIKE_PRIORITY';
  const serviceUpper = String(rawService).toUpperCase().replace(/[\s-]+/g, '_');

  const isPersonalCourier =
    serviceUpper.includes('BIKE') ||
    serviceUpper.includes('SAME_DAY') ||
    serviceUpper.includes('DRONE') ||
    serviceUpper.includes('HYBRID') ||
    serviceUpper.includes('NEXT_DAY') ||
    serviceUpper.includes('SURFACE') ||
    serviceUpper.includes('STANDARD') ||
    Boolean(parcel.parcelSize || parcel.lengthCm || parcel.packagingType);

  // Check if route involves airport
  const isAirport =
    serviceUpper.includes('AIRPORT') ||
    (request.pickup?.addressLine1 && /airport|terminal|del/i.test(request.pickup.addressLine1)) ||
    (request.dropoff?.addressLine1 && /airport|terminal|del/i.test(request.dropoff.addressLine1));

  // Distance estimation
  let distanceKm = 12;
  if (request.pickup && request.dropoff && request.pickup.latitude && request.dropoff.latitude) {
    const calc = haversineDistance(request.pickup, request.dropoff);
    if (calc !== null && calc > 0) distanceKm = calc;
  }

  const pieceCount = Number(parcel.pieceCount ?? rootReq.pieceCount) || 1;
  const actualWeightKg = Number(parcel.actualWeightKg ?? parcel.totalWeightKg ?? rootReq.actualWeightKg ?? rootReq.totalWeightKg) || 2.5;
  const lengthCm = Number(parcel.lengthCm ?? rootReq.lengthCm) || 30;
  const widthCm = Number(parcel.widthCm ?? rootReq.widthCm) || 20;
  const heightCm = Number(parcel.heightCm ?? rootReq.heightCm) || 10;
  const volumetricWeightKg = Math.round(((lengthCm * widthCm * heightCm) / 5000) * 100) / 100;
  const chargeableWeightKg = Math.max(actualWeightKg, volumetricWeightKg, Number(parcel.chargeableWeightKg ?? rootReq.chargeableWeightKg) || 0);

  if (isPersonalCourier && !isAirport && !serviceUpper.includes('HOTEL') && !serviceUpper.includes('AIRPORT')) {
    // 1. Personal Courier Service Speeds
    let baseSpeedPrice = 120; // Bike Priority
    if (serviceUpper.includes('DRONE') || serviceUpper.includes('HYBRID')) {
      baseSpeedPrice = 200;
    } else if (serviceUpper.includes('SAME_DAY')) {
      baseSpeedPrice = 150;
    } else if (serviceUpper.includes('NEXT_DAY')) {
      baseSpeedPrice = 100;
    } else if (serviceUpper.includes('SURFACE') || serviceUpper.includes('STANDARD')) {
      baseSpeedPrice = 100;
    }

    // 2. Packaging Box Fee
    let boxFee = 0;
    const needsBox = parcel.needsBox !== false;
    if (needsBox) {
      const combinedCap = `${parcel.weightCapacity || ''} ${parcel.boxSize || ''} ${rootReq.weightCapacity || ''} ${rootReq.boxSize || ''}`;
      boxFee = combinedCap.includes('25') ? 60 : combinedCap.includes('15') ? 45 : 30;
    }

    // 3. Packaging Type Fee
    let packagingTypeFee = 0;
    const pkgType = String(parcel.packagingType ?? rootReq.packagingType ?? 'STANDARD').toUpperCase();
    if (pkgType.includes('WOOD')) {
      packagingTypeFee = 149;
    } else if (pkgType.includes('EXTRA') || pkgType.includes('SECURE')) {
      packagingTypeFee = 49;
    }

    // 4. Special Handling Fees
    const isFragile = Boolean(
      parcel.fragile ||
      parcel.isFragile ||
      parcel.specialHandling?.fragile ||
      rootReq.fragile ||
      rootReq.isFragile ||
      (Array.isArray(rootReq.specialHandling) && (rootReq.specialHandling.includes('FRAGILE') || rootReq.specialHandling.includes('fragile'))) ||
      (Array.isArray(parcel.specialHandling) && (parcel.specialHandling.includes('FRAGILE') || parcel.specialHandling.includes('fragile')))
    );
    const isSecure = Boolean(
      parcel.secureHandling ||
      parcel.isSecure ||
      parcel.specialHandling?.secureHandling ||
      rootReq.secureHandling ||
      rootReq.isSecure ||
      (Array.isArray(rootReq.specialHandling) && (rootReq.specialHandling.includes('EXTRA_SECURITY') || rootReq.specialHandling.includes('secure') || rootReq.specialHandling.includes('secureHandling'))) ||
      (Array.isArray(parcel.specialHandling) && (parcel.specialHandling.includes('EXTRA_SECURITY') || parcel.specialHandling.includes('secure') || parcel.specialHandling.includes('secureHandling')))
    );
    const handlingFee = (isFragile ? 25 : 0) + (isSecure ? 35 : 0);

    // 5. Insurance Fee
    let insuranceFee = 0;
    const insType = String(parcel.insuranceType ?? rootReq.insuranceType ?? 'FULL').toUpperCase();
    const declaredValue = Number(parcel.declaredValue ?? rootReq.declaredValue) || 25000;
    if (insType.includes('NONE')) {
      insuranceFee = 0;
    } else if (insType.includes('BASIC')) {
      insuranceFee = 49;
    } else {
      insuranceFee = Math.round(declaredValue * 0.0075);
    }

    // 6. Self-Service Saver
    let selfServiceDiscount = 0;
    const selfOpt = String(request.selfServiceOption || '').toUpperCase();
    if (selfOpt.includes('PICKUP')) {
      selfServiceDiscount = 50;
    } else if (selfOpt.includes('DROP')) {
      selfServiceDiscount = 40;
    }

    // Distance & Weight surcharge
    const weightSurcharge = chargeableWeightKg > 5 ? Math.round((chargeableWeightKg - 5) * 20) : 0;
    const distanceSurcharge = distanceKm > 15 ? Math.round((distanceKm - 15) * 10) : 0;

    const subtotal = Math.max(
      40,
      baseSpeedPrice +
        boxFee +
        packagingTypeFee +
        handlingFee +
        insuranceFee +
        weightSurcharge +
        distanceSurcharge -
        selfServiceDiscount,
    );

    // Promo code
    let discountAmount = 0;
    const promoUpper = (request.promoCode || 'DELIVEZ10').toUpperCase().trim();
    if (promoUpper && PROMO_CODES[promoUpper]) {
      const promo = PROMO_CODES[promoUpper];
      const rawDiscount = (subtotal * promo.discountPercent) / 100;
      discountAmount = Math.min(rawDiscount, promo.maxDiscount);
      discountAmount = Math.round(discountAmount * 100) / 100;
    }

    const gstAmount = Math.round((subtotal - discountAmount) * 0.18 * 100) / 100;
    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + gstAmount) * 100) / 100);

    return {
      pricingVersion: 'v2.0.0',
      currency: 'INR',
      distanceKm,
      pieceCount,
      totalWeightKg: actualWeightKg,
      chargeableWeightKg,
      baseFare: baseSpeedPrice,
      distanceFee: distanceSurcharge,
      luggageHandlingFee: handlingFee,
      airportHandlingFee: 0,
      addonsFee: boxFee + packagingTypeFee,
      deliverySpeedFee: baseSpeedPrice,
      gstAmount,
      discountAmount,
      totalAmount,
      insurancePremium: insuranceFee,
      breakdown: {
        baseCharge: baseSpeedPrice,
        serviceSpeedCharge: baseSpeedPrice,
        distanceCharge: distanceSurcharge,
        weightCharge: weightSurcharge,
        handlingFee,
        packagingCharge: boxFee + packagingTypeFee,
        packagingUpgradeFee: packagingTypeFee,
        boxFee,
        insurancePremium: insuranceFee,
        taxAmount: gstAmount,
        discountAmount,
        totalAmount,
        selfServiceDiscount: selfServiceDiscount > 0 ? -selfServiceDiscount : 0,
      },
    };
  }

  // --- Fallback to Luggage / Airport Courier Quote (matching Screen 26 APK) ---
  let baseFare = 1200;
  if (request.isRoundTrip) baseFare *= 1.8;

  const distanceFee = Math.max(360, Math.round(distanceKm * 20));
  const luggageHandlingFee = pieceCount > 1 ? (pieceCount - 1) * 160 : 160;
  const airportHandlingFee = isAirport ? 150 : 0;

  const addonsMap = new Map<string, number>(getAddonsList().map((a: any) => [String(a.id), Number(a.price) || 0]));
  let addonsFee = 0;
  if (Array.isArray(request.addons) && request.addons.length > 0) {
    for (const addId of request.addons) {
      addonsFee += (addonsMap.get(addId) as number) || 0;
    }
  } else {
    addonsFee = 250;
  }

  let deliverySpeedFee = 100;
  if (request.deliverySpeed === 'CRITICAL_FLIGHT_RUSH') deliverySpeedFee = 350;
  else if (request.deliverySpeed === 'FAST_TRACK') deliverySpeedFee = 200;
  else if (request.deliverySpeed === 'SAME_DAY') deliverySpeedFee = 150;

  const subtotal =
    baseFare +
    distanceFee +
    luggageHandlingFee +
    airportHandlingFee +
    addonsFee +
    deliverySpeedFee;

  const gstAmount = Math.round(subtotal * 0.18 * 100) / 100;

  let discountAmount = 0;
  const promoUpper = (request.promoCode || 'DELIVEZ10').toUpperCase().trim();
  if (promoUpper && PROMO_CODES[promoUpper]) {
    const promo = PROMO_CODES[promoUpper];
    const rawDiscount = (subtotal * promo.discountPercent) / 100;
    discountAmount = Math.min(rawDiscount, promo.maxDiscount);
    discountAmount = Math.round(discountAmount * 100) / 100;
  }

  const totalAmount = Math.max(0, Math.round((subtotal + gstAmount - discountAmount) * 100) / 100);

  return {
    pricingVersion: 'v1.0.0',
    currency: 'INR',
    distanceKm,
    pieceCount,
    totalWeightKg: actualWeightKg,
    chargeableWeightKg,
    baseFare,
    distanceFee,
    luggageHandlingFee,
    airportHandlingFee,
    addonsFee,
    deliverySpeedFee,
    gstAmount,
    discountAmount,
    totalAmount,
    insurancePremium: 0,
    breakdown: {
      baseFare,
      distanceFee,
      luggageHandlingFee,
      airportHandlingFee,
      addonsFee,
      deliverySpeedFee,
      taxAmount: gstAmount,
      discountAmount,
      totalAmount,
      insurancePremium: 0,
      baseCharge: baseFare,
      distanceCharge: distanceFee,
      weightCharge: luggageHandlingFee,
      packagingCharge: addonsFee,
    },
  };
};
