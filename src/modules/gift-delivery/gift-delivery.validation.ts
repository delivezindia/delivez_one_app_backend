import { z } from 'zod';
import { AppError } from '../../lib/app-error.js';

const GiftDeliverySpeedEnum = z.enum([
  'STANDARD',
  'EXPRESS',
  'PRECISE_TIME',
  'MIDNIGHT',
]);

const GiftPaymentMethodEnum = z.enum([
  'UPI',
  'CARD',
  'WALLET',
  'NET_BANKING',
]);

const coerceNumber = (fallback: number, min?: number, max?: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return fallback;
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
  }, z.number().min(min ?? Number.MIN_SAFE_INTEGER).max(max ?? Number.MAX_SAFE_INTEGER));

const coerceOptionalNumber = (min?: number, max?: number) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return null;
    const num = Number(val);
    return Number.isNaN(num) ? null : num;
  }, z.number().min(min ?? 0).max(max ?? 10000000).nullable().optional());

const coerceBoolean = (fallback = false) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === '') return fallback;
    if (typeof val === 'boolean') return val;
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    return Boolean(val);
  }, z.boolean());

const coerceArrayOrJson = () =>
  z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return [val];
      }
    }
    return val;
  }, z.any().optional().nullable());

export const createGiftDeliverySchema = z.object({
  // Gift & Product
  categoryId: z.string().trim().min(1, 'Gift category is required.').default('CAKES'),
  categoryName: z.string().trim().min(1).default('Cakes'),
  productId: z.string().trim().min(1, 'Gift product is required.').default('cake-choc-truffle'),
  productName: z.string().trim().min(1, 'Product name is required.').max(120),
  productDescription: z.string().trim().max(250).optional().nullable(),
  productImage: z.string().trim().optional().nullable(),
  productPrice: coerceNumber(699, 1, 500000),
  productQuantity: coerceNumber(1, 1, 50),
  productWeight: z.string().trim().max(50).optional().nullable(),
  productServes: z.string().trim().max(50).optional().nullable(),
  selectedOccasion: z.string().trim().max(60).optional().nullable(),

  // Recipient & Address
  deliverTo: z.string().trim().max(50).default('Someone Else'),
  recipientName: z.string().trim().min(2, 'Recipient full name is required.').max(80),
  recipientPhone: z.string().trim().min(8, 'Recipient phone number is required.').max(20),
  recipientCountryCode: z.string().trim().max(10).default('+91'),
  deliveryAddress: z.string().trim().min(3, 'Delivery address is required.').max(250),
  deliveryLandmark: z.string().trim().max(120).optional().nullable(),
  deliveryPostalCode: z.string().trim().min(3, 'Delivery pincode is required.').max(12),
  deliveryCity: z.string().trim().min(2, 'Delivery city is required.').max(60),
  deliveryState: z.string().trim().max(60).default('Karnataka'),
  deliveryLatitude: coerceOptionalNumber(-90, 90),
  deliveryLongitude: coerceOptionalNumber(-180, 180),
  deliveryInstructions: z.string().trim().max(120, 'Delivery instructions cannot exceed 120 characters.').optional().nullable(),

  // Message & Card
  giftMessage: z.string().trim().max(200, 'Gift message cannot exceed 200 characters.').optional().nullable(),
  greetingCardId: z.string().trim().max(60).optional().nullable(),
  greetingCardName: z.string().trim().max(80).optional().nullable(),

  // Scheduling & Speed
  deliveryType: GiftDeliverySpeedEnum.default('STANDARD'),
  scheduledDate: z.string().trim().min(1, 'Delivery date is required.').max(40),
  scheduledTimeSlot: z.string().trim().min(1, 'Delivery time slot is required.').max(60).default('9:00 AM - 12:00 PM (Morning)'),
  isMidnightDelivery: coerceBoolean(false),

  // Premium Setup & Addons
  selectedAddons: coerceArrayOrJson(),
  hasHandwrittenCard: coerceBoolean(false),
  isAnonymousSender: coerceBoolean(false),
  hasPhotoProof: coerceBoolean(false),
  hasVideoReaction: coerceBoolean(false),
  hasPremiumWrap: coerceBoolean(false),
  hasPremiumSetup: coerceBoolean(false),

  couponCode: z.string().trim().max(30).optional().nullable(),
  paymentMethod: GiftPaymentMethodEnum.default('UPI'),
});

export type CreateGiftDeliveryInput = z.infer<typeof createGiftDeliverySchema>;

export function validateGiftDeliveryRequest(input: unknown): CreateGiftDeliveryInput {
  const parsed = createGiftDeliverySchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new AppError(400, message || 'Invalid gift delivery booking payload.');
  }
  return parsed.data;
}

export const rescheduleGiftDeliverySchema = z.object({
  scheduledDate: z.string().trim().min(1, 'Scheduled date is required.').max(40),
  scheduledTimeSlot: z.string().trim().min(1, 'Scheduled time slot is required.').max(60),
  deliveryInstructions: z.string().trim().max(120).optional().nullable(),
});

export type RescheduleGiftDeliveryInput = z.infer<typeof rescheduleGiftDeliverySchema>;

export function validateRescheduleRequest(input: unknown): RescheduleGiftDeliveryInput {
  const parsed = rescheduleGiftDeliverySchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    throw new AppError(400, message || 'Invalid reschedule payload.');
  }
  return parsed.data;
}

export function validateIdempotencyKey(rawKey?: string | null): string {
  const key = rawKey?.trim();
  if (!key) {
    throw new AppError(400, 'Idempotency-Key header is required.');
  }
  if (key.length < 8 || key.length > 128) {
    throw new AppError(400, 'Idempotency-Key must be between 8 and 128 characters.');
  }
  return key;
}
