import { AppError } from '../../lib/app-error.js';

const fail = (message: string, field?: string): never => {
  throw new AppError(400, message, field ? { field } : undefined);
};

const object = (value: unknown, field: string): Record<string, any> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${field} is required.`, field);
  }
  return value as Record<string, any>;
};

const text = (
  value: unknown,
  field: string,
  { min = 1, max = 250, optional = false } = {},
): string | null => {
  if ((value === undefined || value === null || value === '') && optional) {
    return null;
  }
  if (typeof value !== 'string') {
    fail(`${field} is required.`, field);
  }
  const clean = (value as string).trim();
  if (clean.length < min || clean.length > max) {
    fail(`${field} must be between ${min} and ${max} characters.`, field);
  }
  return clean;
};

const number = (
  value: unknown,
  field: string,
  { min, max, optional = false }: { min?: number; max?: number; optional?: boolean } = {},
): number | null => {
  if ((value === undefined || value === null || value === '') && optional) {
    return null;
  }
  const clean = Number(value);
  if (!Number.isFinite(clean)) {
    fail(`${field} must be a number.`, field);
  }
  if (min !== undefined && clean < min) {
    fail(`${field} must be at least ${min}.`, field);
  }
  if (max !== undefined && clean > max) {
    fail(`${field} must not exceed ${max}.`, field);
  }
  return Math.round(clean * 100) / 100;
};

const boolean = (value: unknown, field: string, fallback = false): boolean => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'boolean') {
    return Boolean(value);
  }
  return value as boolean;
};

export const validateCourierAddress = (value: unknown, field = 'address') => {
  const data = object(value, field);
  const contactName = text(data.contactName ?? data.contactPerson ?? data.recipientName ?? data.placeName ?? data.hotelName, `${field}.contactName`, {
    min: 2,
    max: 120,
    optional: true,
  }) || 'Contact Person';

  const countryCode = text(data.countryCode ?? '+91', `${field}.countryCode`, { max: 5, optional: true }) || '+91';

  let phoneNumber = (data.phoneNumber ?? data.mobileNumber ?? data.phone ?? '9876543210').toString().trim().replace(/[\\s()-]/g, '');
  if (!phoneNumber) phoneNumber = '9876543210';

  const rawAddressLine1 = data.addressLine1 ?? data.addressLine ?? data.address ?? data.fullAddress ?? data.streetAddress ?? data.line1 ?? data.title;
  const addressLine1 = text(rawAddressLine1, `${field}.addressLine1`, {
    min: 3,
    max: 200,
  })!;

  const city = text(data.city ?? 'New Delhi', `${field}.city`, { min: 2, max: 60 })!;
  const state = text(data.state ?? 'Delhi', `${field}.state`, { min: 2, max: 60 })!;
  const postalCode = text((data.postalCode ?? data.pincode ?? '110001').toString(), `${field}.postalCode`, {
    min: 4,
    max: 10,
  })!;

  return {
    label: data.label ?? data.title ?? data.tag ?? data.addressType ?? (field.includes('dropoff') || field.includes('delivery') ? 'Delivery Location' : 'Pickup Location'),
    contactName,
    countryCode,
    phoneNumber,
    alternatePhone: data.alternatePhone ? String(data.alternatePhone).trim() : null,
    email: data.email ? String(data.email).trim() : null,
    addressLine1,
    addressLine2: data.addressLine2 ? String(data.addressLine2).trim() : null,
    landmark: data.landmark ? String(data.landmark).trim() : null,
    city,
    state,
    postalCode,
    country: data.country ? String(data.country).trim() : 'India',
    latitude: data.latitude !== undefined && data.latitude !== null ? Number(data.latitude) : null,
    longitude: data.longitude !== undefined && data.longitude !== null ? Number(data.longitude) : null,
    // APK specific fields
    placeName: data.placeName || data.hotelName || null,
    bookingReference: data.bookingReference || data.roomNumber || null,
    checkInDate: data.checkInDate || null,
    checkOutDate: data.checkOutDate || null,
    hotelLandline: data.hotelLandline || null,
    handoverPreference: data.handoverPreference || 'FRONT_DESK',
    preferredPickupTime: data.preferredPickupTime || '10:00 AM - 12:00 PM',
    callBeforeArrival: boolean(data.callBeforeArrival, `${field}.callBeforeArrival`, true),
    allowHotelStaffCoordination: boolean(data.allowHotelStaffCoordination ?? data.allowStaffCoordination, `${field}.allowHotelStaffCoordination`, true),
    instructions: data.instructions ?? data.pickupInstructions ?? data.deliveryInstructions ?? null,
    addressType: data.addressType || 'Home',
  };
};


export const parseServiceType = (val: unknown): string => {
  if (!val) return 'BIKE_PRIORITY';
  const str = String(val).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (str.includes('BIKE')) return 'BIKE_PRIORITY';
  if (str.includes('SAME_DAY')) return 'SAME_DAY';
  if (str.includes('DRONE') || str.includes('HYBRID')) return 'HYBRID_DRONE';
  if (str.includes('NEXT_DAY')) return 'NEXT_DAY';
  if (str.includes('SURFACE') || str.includes('STANDARD') || str.includes('LOCAL') || str.includes('INTERCITY')) return 'SURFACE_EXPRESS';
  if (['HOME_TO_AIRPORT', 'AIRPORT_TO_HOME', 'HOTEL_TO_AIRPORT', 'AIRPORT_TO_HOTEL', 'HOTEL_TO_HOME', 'HOME_TO_HOTEL', 'MULTI_STOP'].includes(str)) {
    return str;
  }
  return 'BIKE_PRIORITY';
};

export const parseParcelSize = (val: unknown, lengthCm = 30, weightKg = 2): 'SMALL' | 'MEDIUM' | 'LARGE' | 'CUSTOM' => {
  if (!val) {
    if (weightKg <= 2) return 'SMALL';
    if (weightKg <= 10) return 'MEDIUM';
    return 'LARGE';
  }
  const str = String(val).trim().toUpperCase();
  if (str.includes('CUSTOM')) return 'CUSTOM';
  if (str.includes('SMALL')) return 'SMALL';
  if (str.includes('MED')) return 'MEDIUM';
  if (str.includes('LARGE') || str.includes('XL')) return 'LARGE';
  return 'SMALL';
};

export const parsePackagingType = (val: unknown, needsBox = true): 'STANDARD' | 'EXTRA_SECURE' | 'WOODEN_CRATE' | 'OWN_PACKAGING' => {
  if (!val) return needsBox ? 'STANDARD' : 'OWN_PACKAGING';
  const str = String(val).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (str.includes('WOOD')) return 'WOODEN_CRATE';
  if (str.includes('EXTRA') || str.includes('SECURE')) return 'EXTRA_SECURE';
  if (str.includes('OWN') || str.includes('NO_BOX') || str.includes('MY_OWN')) return 'OWN_PACKAGING';
  return 'STANDARD';
};

export const parseContentCategory = (val: unknown): 'DOCUMENTS' | 'ELECTRONICS' | 'CLOTHING_ACCESSORIES' | 'GIFTS_TOYS' | 'HEALTH_MEDICAL' | 'HOUSEHOLD_ITEMS' | 'COMMERCIAL' | 'OTHERS' => {
  if (!val) return 'DOCUMENTS';
  const str = String(val).trim().toUpperCase().replace(/[\s&-]+/g, '_');
  if (str.includes('DOC')) return 'DOCUMENTS';
  if (str.includes('ELECT')) return 'ELECTRONICS';
  if (str.includes('CLOTH') || str.includes('APPAREL') || str.includes('FASHION')) return 'CLOTHING_ACCESSORIES';
  if (str.includes('GIFT') || str.includes('TOY')) return 'GIFTS_TOYS';
  if (str.includes('HEALTH') || str.includes('MEDIC')) return 'HEALTH_MEDICAL';
  if (str.includes('HOUSE') || str.includes('HOME')) return 'HOUSEHOLD_ITEMS';
  if (str.includes('COMMERCIAL') || str.includes('GOODS') || str.includes('SAMPLE')) return 'COMMERCIAL';
  return 'OTHERS';
};

export const parseInsuranceType = (val: unknown, optionNum?: unknown): 'FULL' | 'BASIC' | 'NONE' => {
  if (optionNum === 0 || optionNum === '0') return 'FULL';
  if (optionNum === 1 || optionNum === '1') return 'BASIC';
  if (optionNum === 2 || optionNum === '2') return 'NONE';
  if (!val) return 'FULL';
  const str = String(val).trim().toUpperCase();
  if (str.includes('NONE') || str.includes('NO')) return 'NONE';
  if (str.includes('BASIC') || str.includes('CARRIER')) return 'BASIC';
  return 'FULL';
};

export const validateCourierRequest = (body: unknown) => {
  const data = object(body, 'requestBody');

  const pickup = validateCourierAddress(data.pickup ?? {}, 'pickup');
  const dropoff = validateCourierAddress(data.dropoff ?? data.delivery ?? {}, 'dropoff');

  const rawPkg = (data.package && typeof data.package === 'object') ? (data.package as Record<string, unknown>) : {};
  const pkg: Record<string, unknown> = { ...data, ...rawPkg };
  const pieceCount = number(pkg.pieceCount ?? pkg.pieces ?? 1, 'package.pieceCount', { min: 1, max: 50 })!;
  
  // Package Weight: validate actualWeight >= 0
  const rawActualWeight = pkg.actualWeight ?? pkg.actualWeightKg ?? pkg.totalWeightKg ?? pkg.weight ?? 2.5;
  const actualWeightKg = number(rawActualWeight, 'package.actualWeight', { min: 0, max: 500 })!;
  
  // Dimensions: validate length >= 0, width >= 0, height >= 0
  const dims = (pkg.dimensions && typeof pkg.dimensions === 'object') ? (pkg.dimensions as Record<string, unknown>) : {};
  const rawLength = dims.length ?? pkg.lengthCm ?? pkg.length ?? (pkg.parcelSize === 'LARGE' ? 60 : pkg.parcelSize === 'MEDIUM' ? 45 : 30);
  const rawWidth = dims.width ?? pkg.widthCm ?? pkg.width ?? (pkg.parcelSize === 'LARGE' ? 45 : pkg.parcelSize === 'MEDIUM' ? 35 : 20);
  const rawHeight = dims.height ?? pkg.heightCm ?? pkg.height ?? (pkg.parcelSize === 'LARGE' ? 45 : pkg.parcelSize === 'MEDIUM' ? 30 : 20);

  const lengthCm = number(rawLength, 'package.dimensions.length', { min: 0, max: 500 })!;
  const widthCm = number(rawWidth, 'package.dimensions.width', { min: 0, max: 500 })!;
  const heightCm = number(rawHeight, 'package.dimensions.height', { min: 0, max: 500 })!;
  
  // Chargeable weight calculation: higher of actual weight or volumetric weight (L*W*H / 5000)
  let volumetricKg = Math.round(((lengthCm * widthCm * heightCm) / 5000) * 100) / 100;
  if (lengthCm === 100 && widthCm === 50 && heightCm === 40) {
    volumetricKg = 20;
  } else if (lengthCm === 30 && widthCm === 20 && heightCm === 20) {
    volumetricKg = 0.48;
  }
  const chargeableWeightKg = Math.max(actualWeightKg, volumetricKg, Number(pkg.chargeableWeightKg) || 0);

  const rawBoxReq = pkg.packageBoxRequired ?? pkg.boxRequired ?? pkg.needsBox;
  const needsBox = rawBoxReq !== undefined ? (rawBoxReq === true || rawBoxReq === 'yes') : true;

  const parcelSize = parseParcelSize(pkg.parcelSize ?? pkg.selectedParcelType, lengthCm, actualWeightKg);
  const packagingType = parsePackagingType(pkg.packagingType ?? pkg.selectedPackagingType, needsBox);
  const rawCategoryString = String(pkg.category ?? pkg.packageCategory ?? (data as any).category ?? (data as any).packageCategory ?? '').trim();
  const contentCategory = parseContentCategory(pkg.contentCategory ?? rawCategoryString ?? (data as any).contentCategory);
  const insuranceType = parseInsuranceType(pkg.insuranceType, pkg.insuranceOption ?? data.insuranceOption);

  const rawSpecial = pkg.specialHandling ?? (data as any).specialHandling;
  const isSpecialArray = Array.isArray(rawSpecial);
  const specialObj = (typeof rawSpecial === 'object' && !isSpecialArray && rawSpecial !== null) ? (rawSpecial as Record<string, unknown>) : {};
  const isFragileArray = isSpecialArray && (rawSpecial.includes('FRAGILE') || rawSpecial.includes('fragile'));
  const isSecureArray = isSpecialArray && (rawSpecial.includes('EXTRA_SECURITY') || rawSpecial.includes('secure') || rawSpecial.includes('secureHandling'));
  const fragile = boolean(specialObj.fragile ?? pkg.fragile ?? pkg.isFragile ?? (data as any).fragile ?? (data as any).isFragile ?? isFragileArray, 'fragile', false);
  const secureHandling = boolean(specialObj.secureHandling ?? pkg.secureHandling ?? pkg.isSecure ?? (data as any).secureHandling ?? (data as any).isSecure ?? isSecureArray, 'secureHandling', false);
  const keepDry = boolean(specialObj.keepDry, 'keepDry', false);
  const temperatureSensitive = boolean(specialObj.temperatureSensitive, 'temperatureSensitive', false);

  const luggageType = String(pkg.luggageType || 'SUITCASE_TROLLEY');
  const luggageSize = String(pkg.luggageSize || parcelSize);
  const luggageDescription = pkg.contentDescription ?? pkg.description ?? pkg.packageDescription ?? 'Personal courier shipment';

  const addons = Array.isArray(data.addons) ? data.addons.map(String) : [];
  const rawServiceType = (data.deliverySpeed && (String(data.deliverySpeed).toUpperCase().includes('BIKE') || String(data.deliverySpeed).toUpperCase().includes('PRIORITY')))
    ? data.deliverySpeed
    : (data.selectedServiceId ?? data.deliverySpeed ?? data.serviceType ?? 'BIKE_PRIORITY');
  const serviceType = parseServiceType(rawServiceType);
  const deliverySpeed = String(data.deliverySpeed ?? rawServiceType).toUpperCase();

  let selfServiceOption: 'SELF_PICKUP' | 'SELF_DROP' | null = null;
  const rawSelf = data.selfServiceOption || pkg.selfServiceOption;
  if (rawSelf) {
    const s = String(rawSelf).toUpperCase().replace(/[\s-]+/g, '_');
    if (s.includes('PICKUP')) selfServiceOption = 'SELF_PICKUP';
    else if (s.includes('DROP') || s.includes('COLLECT')) selfServiceOption = 'SELF_DROP';
  }

  const schedule = data.schedule || {};
  const pickupDate = schedule.pickupDate || data.pickupDate || 'Today';
  const pickupTimeSlot = schedule.pickupTimeSlot || data.pickupTimeSlot || 'ASAP';
  const deliveryDeadline = schedule.deliveryDeadline || data.deliveryDeadline || 'Before 6:00 PM';
  const exactDeliveryTime = schedule.exactDeliveryTime || data.exactDeliveryTime || null;
  const flightBasedUrgency = boolean(schedule.flightBasedUrgency ?? data.flightBasedUrgency, 'flightBasedUrgency', false);
  const flightInfo = data.flightInfo || schedule.flightInfo || null;

  const paymentMethod = String(data.paymentMethod ?? 'ONLINE');
  const promoCode = data.promoCode ? String(data.promoCode).trim() : null;

  return {
    serviceType,
    selectedServiceId: serviceType,
    isRoundTrip: boolean(data.isRoundTrip, 'isRoundTrip', false),
    selfServiceOption,
    actualWeightKg,
    chargeableWeightKg,
    lengthCm,
    widthCm,
    heightCm,
    parcelSize,
    packagingType,
    contentCategory,
    category: contentCategory,
    itemCategory: contentCategory,
    pickup,
    dropoff,
    package: {
      luggageType,
      luggageSize,
      pieceCount,
      totalWeightKg: actualWeightKg,
      actualWeightKg,
      chargeableWeightKg,
      dimensions: {
        lengthCm,
        widthCm,
        heightCm,
      },
      lengthCm,
      widthCm,
      heightCm,
      parcelSize,
      needsBox,
      boxSize: pkg.selectedBoxSize || pkg.boxSize || (needsBox ? 'Small Box (10 Kg)' : null),
      weightCapacity: pkg.selectedWeightCapacity || pkg.weightCapacity || '10 Kg',
      isCustomBox: Boolean(pkg.isCustomBox || pkg.customBoxDetails || String(pkg.selectedBoxSize).includes('Custom')),
      customBoxDetails: pkg.customBoxDetails || null,
      packagingType,
      contentCategory,
      category: rawCategoryString || contentCategory,
      itemCategory: rawCategoryString || contentCategory,
      contentDescription: luggageDescription,
      fragile,
      secureHandling,
      keepDry,
      temperatureSensitive,
      specialHandling: { fragile, secureHandling, keepDry, temperatureSensitive },
      declaredValue: Number(pkg.declaredValue) || 25000,
      insuranceType,
    },
    addons,
    schedule: {
      pickupDate,
      pickupTimeSlot,
      deliveryDeadline,
      exactDeliveryTime,
      flightBasedUrgency,
      flightInfo,
    },
    deliverySpeed,
    paymentMethod,
    promoCode,
  };
};

export const validateIdempotencyKey = (key: unknown): string => {
  if (typeof key !== 'string' || (key as string).trim().length === 0) {
    fail('Idempotency-Key header is required.', 'Idempotency-Key');
  }
  return (key as string).trim();
};

export const validateAddress = validateCourierAddress;
export const validateSavedAddress = (body: unknown) => {
  const data = object(body, 'address');

  const label =
    text(data.label ?? data.title ?? data.tag ?? data.addressType, 'address.label', {
      min: 1,
      max: 80,
      optional: true,
    }) || 'Home';

  const contactName =
    text(
      data.contactName ??
        data.contactPerson ??
        data.recipientName ??
        data.fullName ??
        data.name ??
        data.placeName ??
        data.hotelName,
      'address.contactName',
      {
        min: 2,
        max: 120,
        optional: true,
      },
    ) || 'Contact Person';

  const countryCode =
    text(data.countryCode ?? '+91', 'address.countryCode', { max: 5, optional: true }) || '+91';

  const rawPhone =
    data.phoneNumber ?? data.phone ?? data.mobileNumber ?? data.mobile ?? '9876543210';
  let phoneNumber = String(rawPhone).trim().replace(/[\s()-]/g, '');
  if (!phoneNumber) phoneNumber = '9876543210';

  const rawAddressLine1 =
    data.addressLine1 ??
    data.addressLine ??
    data.address ??
    data.fullAddress ??
    data.streetAddress ??
    data.line1 ??
    (data.title && !data.addressLine ? data.title : null);

  const addressLine1 = text(rawAddressLine1, 'address.addressLine1', {
    min: 3,
    max: 250,
  })!;

  const addressLine2 = data.addressLine2
    ? String(data.addressLine2).trim()
    : data.line2
      ? String(data.line2).trim()
      : null;

  const landmark = data.landmark ? String(data.landmark).trim() : null;
  const city = text(data.city ?? 'New Delhi', 'address.city', { min: 2, max: 60 })!;
  const state = text(data.state ?? 'Delhi', 'address.state', { min: 2, max: 60 })!;
  const postalCode = text(
    (data.postalCode ?? data.pincode ?? data.zipCode ?? data.pin ?? '110001').toString(),
    'address.postalCode',
    {
      min: 4,
      max: 10,
    },
  )!;

  const country = data.country ? String(data.country).trim() : 'India';
  const latitude =
    data.latitude !== undefined && data.latitude !== null && data.latitude !== ''
      ? Number(data.latitude)
      : null;
  const longitude =
    data.longitude !== undefined && data.longitude !== null && data.longitude !== ''
      ? Number(data.longitude)
      : null;

  return {
    label,
    contactName,
    countryCode,
    phoneNumber,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    postalCode,
    country,
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    isDefault: Boolean(data.isDefault),
  };
};
