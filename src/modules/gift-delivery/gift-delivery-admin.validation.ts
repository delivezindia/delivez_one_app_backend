import { z } from 'zod';

export const adminOrderStatusSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'PREPARING_GIFT',
    'GIFT_PACKED',
    'ON_THE_WAY',
    'ARRIVED',
    'DELIVERED',
    'CANCELLED',
  ]),
  partnerName: z.string().optional(),
  partnerPhone: z.string().optional(),
  partnerVehicle: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const adminCancelOrderSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason must be at least 3 characters.').max(500),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  slug: z.string().optional(),
  description: z.string().max(500).optional(),
  iconName: z.string().default('Gift'),
  displayOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
});

export const adminProductSchema = z.object({
  categoryId: z.string().uuid('Valid category ID required.'),
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  slug: z.string().optional(),
  description: z.string().max(1000).optional(),
  price: z.coerce.number().positive('Price must be greater than 0.'),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  weight: z.string().max(50).optional().nullable(),
  serves: z.string().max(50).optional().nullable(),
  occasionTag: z.string().max(50).default('Birthday'),
  badge: z.string().max(50).optional().nullable(),
  stockQuantity: z.coerce.number().int().min(0).default(100),
  isAvailable: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
  imageUrl: z.string().url().optional().nullable(),
});

export const adminCardSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(100),
  theme: z.string().min(2).max(50).default('Birthday'),
  title: z.string().max(120).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  previewUrl: z.string().url().optional().nullable(),
  minAmount: z.coerce.number().min(0).default(100),
  maxAmount: z.coerce.number().positive().default(10000),
  customAmountSupported: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  denominations: z.any().optional(),
  validityDays: z.coerce.number().int().min(1).default(365),
  isActive: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const adminLocationSchema = z.object({
  name: z.string().min(2, 'Location zone name required.').max(100),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  postalCodes: z.string().min(3, 'At least one postal code required.').max(500),
  baseDeliveryCharge: z.coerce.number().min(0).default(49),
  minOrderAmount: z.coerce.number().min(0).default(299),
  estimatedDeliveryTime: z.string().default('2-4 Hours'),
  isSameDayAvailable: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  isMidnightAvailable: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  isActive: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
});

export const adminSlotSchema = z.object({
  name: z.string().min(2).max(80),
  startTime: z.string().min(2).max(30),
  endTime: z.string().min(2).max(30),
  deliverySpeed: z.enum(['STANDARD', 'EXPRESS', 'PRECISE_TIME', 'MIDNIGHT']).default('STANDARD'),
  basePrice: z.coerce.number().min(0).default(49),
  maxOrdersPerSlot: z.coerce.number().int().min(1).default(50),
  isActive: z.union([z.boolean(), z.string().transform((v) => v === 'true')]).default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

export const adminConfigSchema = z.object({
  packagingCharge: z.coerce.number().min(0).default(20),
  freeDeliveryThreshold: z.coerce.number().min(0).default(1500),
  taxPercentage: z.coerce.number().min(0).max(100).default(18),
  sameDayCutoffTime: z.string().default('06:00 PM'),
  advanceBookingDays: z.coerce.number().int().min(1).max(365).default(30),
  handwrittenCardPrice: z.coerce.number().min(0).default(79),
  anonymousSenderPrice: z.coerce.number().min(0).default(49),
  photoProofPrice: z.coerce.number().min(0).default(39),
  luxurySetupPrice: z.coerce.number().min(0).default(299),
  videoReactionPrice: z.coerce.number().min(0).default(79),
  premiumWrapPrice: z.coerce.number().min(0).default(49),
});
