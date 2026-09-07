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
  const contactName = text(data.contactName ?? data.placeName ?? data.hotelName, `${field}.contactName`, {
    min: 2,
    max: 120,
    optional: true,
  }) || 'Contact Person';

  const countryCode = text(data.countryCode ?? '+91', `${field}.countryCode`, { max: 5, optional: true }) || '+91';

  let phoneNumber = (data.phoneNumber ?? data.mobileNumber ?? data.phone ?? '9876543210').toString().trim().replace(/[s()-]/g, '');
  if (!phoneNumber) phoneNumber = '9876543210';

  const addressLine1 = text(data.addressLine1 ?? data.address ?? data.fullAddress, `${field}.addressLine1`, {
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
    label: data.label || (field.includes('dropoff') || field.includes('delivery') ? 'Delivery Location' : 'Pickup Location'),
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

export const validateCourierRequest = (body: unknown) => {
  const data = object(body, 'requestBody');

  const pickup = validateCourierAddress(data.pickup ?? {}, 'pickup');
  const dropoff = validateCourierAddress(data.dropoff ?? data.delivery ?? {}, 'dropoff');

  const pkg = object(data.package ?? {}, 'package');
  const pieceCount = number(pkg.pieceCount ?? pkg.pieces ?? 1, 'package.pieceCount', { min: 1, max: 50 })!;
  const actualWeightKg = number(pkg.totalWeightKg ?? pkg.actualWeightKg ?? 15, 'package.actualWeightKg', { min: 0.1, max: 150 })!;
  const luggageType = String(pkg.luggageType || 'SUITCASE_TROLLEY');
  const luggageSize = String(pkg.luggageSize || 'SMALL');
  const luggageDescription = pkg.description ?? pkg.luggageDescription ?? 'Luggage consignment';

  const specialHandling = pkg.specialHandling || {};
  const fragile = boolean(specialHandling.fragile ?? pkg.fragile, 'fragile', false);
  const keepDry = boolean(specialHandling.keepDry, 'keepDry', false);
  const temperatureSensitive = boolean(specialHandling.temperatureSensitive, 'temperatureSensitive', false);

  const addons = Array.isArray(data.addons) ? data.addons.map(String) : [];
  const serviceType = String(data.selectedServiceId ?? data.serviceType ?? 'HOME_TO_AIRPORT');
  const deliverySpeed = String(data.deliverySpeed ?? 'STANDARD').toUpperCase();

  const schedule = data.schedule || {};
  const pickupDate = schedule.pickupDate || data.pickupDate || '12 May 2025';
  const pickupTimeSlot = schedule.pickupTimeSlot || data.pickupTimeSlot || '10:00 - 12:00 PM';
  const deliveryDeadline = schedule.deliveryDeadline || data.deliveryDeadline || 'Before 6:00 PM';
  const exactDeliveryTime = schedule.exactDeliveryTime || data.exactDeliveryTime || null;
  const flightBasedUrgency = boolean(schedule.flightBasedUrgency ?? data.flightBasedUrgency, 'flightBasedUrgency', true);
  const flightInfo = data.flightInfo || schedule.flightInfo || null;

  const paymentMethod = String(data.paymentMethod ?? 'DELIVEZ_WALLET');
  const promoCode = data.promoCode ? String(data.promoCode).trim() : 'DELIVEZ10';

  return {
    serviceType,
    selectedServiceId: serviceType,
    isRoundTrip: boolean(data.isRoundTrip, 'isRoundTrip', false),
    pickup,
    dropoff,
    package: {
      luggageType,
      luggageSize,
      pieceCount,
      totalWeightKg: actualWeightKg,
      actualWeightKg,
      chargeableWeightKg: actualWeightKg,
      lengthCm: Number(pkg.lengthCm) || 55,
      widthCm: Number(pkg.widthCm) || 35,
      heightCm: Number(pkg.heightCm) || 25,
      parcelSize: luggageSize === 'LARGE' ? 'LARGE' : luggageSize === 'MEDIUM' ? 'MEDIUM' : 'SMALL',
      packagingType: 'STANDARD',
      contentCategory: 'CLOTHING_ACCESSORIES',
      contentDescription: luggageDescription,
      fragile,
      keepDry,
      temperatureSensitive,
      specialHandling: { fragile, keepDry, temperatureSensitive },
      declaredValue: Number(pkg.declaredValue) || 25000,
      insuranceType: 'FULL',
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
  const addr = validateCourierAddress(body, 'address');
  const raw = body && typeof body === 'object' ? (body as any) : {};
  return {
    ...addr,
    isDefault: Boolean(raw.isDefault),
  };
};
