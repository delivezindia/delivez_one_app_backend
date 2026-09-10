import { z } from 'zod';
import { AppError } from '../../lib/app-error.js';

export const validateIdempotencyKey = (key?: string | null): string => {
  if (!key || typeof key !== 'string' || key.trim().length < 8 || key.trim().length > 128) {
    throw new AppError(400, 'A valid Idempotency-Key header (8-128 chars) is required for booking operations.');
  }
  return key.trim();
};


export const RETURN_TYPE_CODES = [
  'RETURN_ITEM',
  'EXCHANGE_ITEM',
  'REPAIR_SERVICE',
  'WARRANTY_RETURN',
  'RENTAL_RETURN',
  'SEND_BACK_TO_SOMEONE',
  'OTHER_RETURN',
] as const;

export type ForgotSomethingReturnType = (typeof RETURN_TYPE_CODES)[number];

export const returnTypeSchema = z.enum(RETURN_TYPE_CODES, {
  errorMap: () => ({
    message: 'Invalid returnType. Must be one of: RETURN_ITEM, EXCHANGE_ITEM, REPAIR_SERVICE, WARRANTY_RETURN, RENTAL_RETURN, SEND_BACK_TO_SOMEONE, OTHER_RETURN',
  }),
});

export const updateReturnTypeSchema = z.object({
  returnType: returnTypeSchema,
});

const phoneRegex = /^[+]?[0-9\s-]{7,20}$/;

export const pickupAddressSchema = z.object({
  flatBuilding: z.string().trim().min(1, 'Pickup Flat/Building is required').max(200),
  street: z.string().trim().min(1, 'Pickup Street is required').max(200),
  area: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().min(1, 'Pickup City is required').max(100),
  state: z.string().trim().max(100).optional().default('Karnataka'),
  postalCode: z.string().trim().min(4, 'Valid pincode required').max(12),
  contactName: z.string().trim().min(2, 'Pickup contact person name is required').max(100),
  phoneNumber: z.string().trim().regex(phoneRegex, 'Valid 10-digit pickup phone number is required'),
  landmark: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const dropoffAddressSchema = z.object({
  addressType: z.string().trim().max(50).optional().default('Home'),
  addressLine1: z.string().trim().min(1, 'Delivery address is required').max(200),
  addressLine2: z.string().trim().max(200).optional().nullable(),
  area: z.string().trim().max(100).optional().default(''),
  city: z.string().trim().min(1, 'Delivery city is required').max(100),
  state: z.string().trim().max(100).optional().default('Karnataka'),
  postalCode: z.string().trim().max(12).optional().default('560001'),
  recipientName: z.string().trim().min(2, 'Recipient name is required').max(100),
  phoneNumber: z.string().trim().regex(phoneRegex, 'Valid recipient phone number is required'),
  landmark: z.string().trim().max(200).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const forgotSomethingBookingSchema = z.object({
  returnType: returnTypeSchema.optional().nullable().default('RETURN_ITEM'),
  itemCategory: z.enum([
    'KEYS',
    'LAPTOP',
    'PHONE',
    'DOCUMENTS',
    'BAG',
    'CHARGER',
    'WALLET',
    'GLASSES',
    'CLOTHING',
    'HEADPHONES',
    'BOOK_DIARY',
    'OTHER',
  ]),
  itemName: z.string().trim().min(2, 'Item name must be at least 2 characters').max(120),
  itemDescription: z.string().trim().max(500).optional().default(''),
  itemBrandColor: z.string().trim().max(100).optional().default(''),
  itemQuantity: z.coerce.number().int().min(1).max(50).default(1),
  declaredValue: z.coerce.number().min(0).max(10000000).optional().nullable(),
  itemTags: z.array(z.string().trim()).optional().default([]),
  itemPhotoUrl: z.string().optional().nullable(),
  itemPhotoData: z.string().optional().nullable(),

  locationType: z.enum([
    'HOME',
    'OFFICE',
    'HOTEL',
    'RESTAURANT',
    'VEHICLE',
    'SOMEONES_PLACE',
    'OTHER',
  ]),
  handoverType: z.enum([
    'RECEPTION',
    'SECURITY_GUARD',
    'COLLEAGUE_STAFF',
    'LOST_AND_FOUND',
    'SOMEONE_ELSE',
    'CUSTOM_CONTACT',
  ]),
  handoverCustomName: z.string().trim().max(100).optional().nullable(),
  handoverCustomPhone: z.string().trim().max(20).optional().nullable(),

  pickup: pickupAddressSchema,
  dropoff: dropoffAddressSchema,

  speed: z.enum(['INSTANT', 'EXPRESS', 'SAME_DAY', 'PRECISE_TIME']).default('INSTANT'),
  scheduledDate: z.string().trim().optional().nullable(),
  scheduledTimeSlot: z.string().trim().optional().nullable(),

  pickupOtpRequired: z.boolean().default(true),
  deliveryOtpRequired: z.boolean().default(true),
  photoAtPickup: z.boolean().default(false),
  photoAtDelivery: z.boolean().default(true),
  tamperProofPackaging: z.boolean().default(true),
  receiverSignature: z.boolean().default(false),
  callBeforeArrival: z.boolean().default(false),

  paymentMethod: z.enum(['WALLET', 'UPI', 'CARD', 'NET_BANKING', 'PAY_ON_DELIVERY']).default('PAY_ON_DELIVERY'),
});

export type ForgotSomethingBookingInput = z.infer<typeof forgotSomethingBookingSchema>;

export const normalizeForgotSomethingInput = (raw: any): any => {
  if (!raw || typeof raw !== 'object') return raw;
  const clone = { ...raw };

  // Normalize pickup address fields
  if (clone.pickup && typeof clone.pickup === 'object') {
    const p = { ...clone.pickup };
    if (!p.flatBuilding && p.addressLine1) {
      p.flatBuilding = p.addressLine1;
    } else if (!p.flatBuilding && p.address) {
      p.flatBuilding = p.address;
    }
    if (!p.street) {
      p.street = p.addressLine2 || p.area || p.flatBuilding || 'Main Road';
    }
    if (!p.contactName && p.recipientName) {
      p.contactName = p.recipientName;
    }
    if (!p.phoneNumber && (p.phone || p.contactPhone)) {
      p.phoneNumber = p.phone || p.contactPhone;
    }
    clone.pickup = p;
  }

  // Normalize dropoff address fields
  if (clone.dropoff && typeof clone.dropoff === 'object') {
    const d = { ...clone.dropoff };
    if (!d.recipientName && (d.contactName || d.name)) {
      d.recipientName = d.contactName || d.name;
    }
    if (!d.phoneNumber && (d.phone || d.contactPhone)) {
      d.phoneNumber = d.phone || d.contactPhone;
    }
    if (!d.addressLine1 && d.address) {
      d.addressLine1 = d.address;
    }
    clone.dropoff = d;
  }

  // Normalize handoverType
  if (!clone.handoverType) {
    if (clone.handoverPerson) {
      const hp = String(clone.handoverPerson).toUpperCase();
      if (hp.includes('RECEPTION')) clone.handoverType = 'RECEPTION';
      else if (hp.includes('SECURITY') || hp.includes('GUARD')) clone.handoverType = 'SECURITY_GUARD';
      else if (hp.includes('LOST') || hp.includes('FOUND')) clone.handoverType = 'LOST_AND_FOUND';
      else if (hp.includes('COLLEAGUE') || hp.includes('STAFF')) clone.handoverType = 'COLLEAGUE_STAFF';
      else clone.handoverType = 'SOMEONE_ELSE';
      clone.handoverCustomName = clone.handoverCustomName || clone.handoverPerson;
    } else {
      clone.handoverType = 'RECEPTION';
    }
  } else {
    const ht = String(clone.handoverType).toUpperCase();
    const validHts = ['RECEPTION', 'SECURITY_GUARD', 'COLLEAGUE_STAFF', 'LOST_AND_FOUND', 'SOMEONE_ELSE', 'CUSTOM_CONTACT'];
    if (validHts.includes(ht)) {
      clone.handoverType = ht;
    } else {
      clone.handoverType = 'RECEPTION';
    }
  }

  if (clone.handoverPhone && !clone.handoverCustomPhone) {
    clone.handoverCustomPhone = clone.handoverPhone;
  }

  return clone;
};

export const validateForgotSomethingRequest = (body: unknown): ForgotSomethingBookingInput => {
  const normalized = normalizeForgotSomethingInput(body);
  const result = forgotSomethingBookingSchema.safeParse(normalized);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new AppError(400, `Validation failed: ${issues}`);
  }
  return result.data;
};

