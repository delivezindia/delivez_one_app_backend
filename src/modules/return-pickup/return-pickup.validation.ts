import { z } from 'zod';
import { AppError } from '../../lib/app-error.js';

const ReturnPickupTypeEnum = z.enum([
  'RETURN_ITEM',
  'EXCHANGE_ITEM',
  'REPAIR_SERVICE',
  'WARRANTY_RETURN',
  'RENTAL_RETURN',
  'SEND_BACK_TO_PERSON',
  'OTHER',
]);

const ReturnDestinationTypeEnum = z.enum([
  'ONLINE_STORE',
  'LOCAL_STORE',
  'BRAND_STORE',
  'SERVICE_CENTRE',
  'WAREHOUSE',
  'ANOTHER_PERSON',
  'OTHER',
]);

const ReturnDeliveryServiceEnum = z.enum([
  'STANDARD',
  'EXPRESS',
  'PRECISE_TIME',
  'APPOINTMENT_BASED',
]);

const ReturnItemConditionEnum = z.enum(['NEW_UNUSED', 'USED_GOOD', 'DAMAGED']);

const ReturnPaymentMethodEnum = z.enum([
  'WALLET',
  'UPI',
  'CARD',
  'NET_BANKING',
  'OTHER_WALLETS',
  'PAY_ON_PICKUP',
]);

const coerceNumber = (fallback: number, min?: number, max?: number) =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return fallback;
      const num = Number(val);
      return Number.isNaN(num) ? fallback : num;
    },
    z
      .number()
      .min(min ?? Number.MIN_SAFE_INTEGER)
      .max(max ?? Number.MAX_SAFE_INTEGER),
  );

const coerceOptionalNumber = (min?: number, max?: number) =>
  z.preprocess(
    (val) => {
      if (val === undefined || val === null || val === '') return null;
      const num = Number(val);
      return Number.isNaN(num) ? null : num;
    },
    z
      .number()
      .min(min ?? 0)
      .max(max ?? 10000000)
      .nullable()
      .optional(),
  );

const coerceBoolean = (fallback = true) =>
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

export const createReturnPickupSchema = z.object({
  returnType: ReturnPickupTypeEnum.default('RETURN_ITEM'),
  destinationType: ReturnDestinationTypeEnum.default('ONLINE_STORE'),
  destinationName: z.string().trim().max(100).optional().nullable(),
  orderId: z.string().trim().max(60).optional().nullable(),
  returnId: z.string().trim().max(60).optional().nullable(),
  returnBeforeDate: z.string().trim().max(40).optional().nullable(),
  estimatedRefundAmount: coerceOptionalNumber(0, 1000000),

  pickupStoreName: z.string().trim().min(1, 'Pickup store or location name is required.').max(120),
  pickupAddress: z.string().trim().min(3, 'Pickup address is required.').max(250),
  pickupCity: z.string().trim().min(2, 'Pickup city is required.').max(60),
  pickupState: z.string().trim().max(60).default('Karnataka'),
  pickupPostalCode: z.string().trim().min(3, 'Pickup postal code is required.').max(12),
  pickupContactName: z.string().trim().min(2, 'Pickup contact person name is required.').max(80),
  pickupPhoneNumber: z.string().trim().min(8, 'Pickup contact phone number is required.').max(20),
  pickupReferenceNumber: z.string().trim().max(60).optional().nullable(),
  pickupInstructions: z.string().trim().max(250).optional().nullable(),
  pickupLatitude: coerceOptionalNumber(-90, 90),
  pickupLongitude: coerceOptionalNumber(-180, 180),

  returnAddressType: z.string().trim().max(40).default('My Home'),
  returnAddress: z.string().trim().min(3, 'Delivery address is required.').max(250),
  returnCity: z.string().trim().min(2, 'Delivery city is required.').max(60),
  returnState: z.string().trim().max(60).default('Karnataka'),
  returnPostalCode: z.string().trim().min(3, 'Delivery postal code is required.').max(12),
  returnContactName: z.string().trim().min(2, 'Recipient contact name is required.').max(80),
  returnPhoneNumber: z.string().trim().min(8, 'Recipient phone number is required.').max(20),
  returnLandmark: z.string().trim().max(120).optional().nullable(),
  returnInstructions: z.string().trim().max(250).optional().nullable(),
  returnLatitude: coerceOptionalNumber(-90, 90),
  returnLongitude: coerceOptionalNumber(-180, 180),

  itemCategory: z.string().trim().min(1, 'Item category is required.').default('ELECTRONICS'),
  itemDescription: z.string().trim().min(1, 'Item description is required.').max(250),
  itemQuantity: coerceNumber(1, 1, 50),
  declaredValue: coerceOptionalNumber(0, 500000),
  approxWeightKg: coerceOptionalNumber(0, 50),
  lengthCm: coerceOptionalNumber(0, 200),
  widthCm: coerceOptionalNumber(0, 200),
  heightCm: coerceOptionalNumber(0, 200),
  itemCondition: ReturnItemConditionEnum.default('NEW_UNUSED'),
  specialHandlingTags: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    return Array.isArray(val) ? val : [];
  }, z.array(z.string()).default([])),
  documents: coerceArrayOrJson(),

  scheduledDate: z.string().trim().max(40).optional().nullable(),
  scheduledTimeSlot: z.string().trim().max(60).default('11:00 AM - 1:00 PM'),
  deliveryService: ReturnDeliveryServiceEnum.default('STANDARD'),
  shipmentProtection: coerceBoolean(true),
  couponCode: z.string().trim().max(30).optional().nullable(),

  paymentMethod: ReturnPaymentMethodEnum.default('WALLET'),
});

export type CreateReturnPickupInput = z.infer<typeof createReturnPickupSchema>;

export function validateReturnPickupRequest(input: unknown): CreateReturnPickupInput {
  const parsed = createReturnPickupSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(', ');
    throw new AppError(400, message || 'Invalid return pickup booking payload.');
  }
  return parsed.data;
}

export const rescheduleReturnPickupSchema = z.object({
  scheduledDate: z.string().trim().min(1, 'Scheduled date is required.').max(40),
  scheduledTimeSlot: z.string().trim().min(1, 'Scheduled time slot is required.').max(60),
  pickupInstructions: z.string().trim().max(250).optional().nullable(),
});

export type RescheduleReturnPickupInput = z.infer<typeof rescheduleReturnPickupSchema>;

export function validateRescheduleRequest(input: unknown): RescheduleReturnPickupInput {
  const parsed = rescheduleReturnPickupSchema.safeParse(input);
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
