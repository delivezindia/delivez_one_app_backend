import { createHash, randomBytes } from 'node:crypto';
import type { Request, RequestHandler } from 'express';
import { Prisma, type GiftDeliveryStatus } from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import { getGiftDeliveryOptions } from './gift-delivery-config.js';
import { calculateGiftDeliveryQuote } from './gift-delivery-pricing.js';
import {
  validateGiftDeliveryRequest,
  validateIdempotencyKey,
  validateRescheduleRequest,
} from './gift-delivery.validation.js';

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

// Format: DLVZ + 8 digits (e.g. DLVZ56874291 as shown in mobile screens)
const makeBookingNumber = (): string => {
  const randomSeq = String(Math.floor(10000000 + Math.random() * 90000000));
  return `DLVZ${randomSeq}`;
};

const makeOtp = (): string => String(Math.floor(1000 + Math.random() * 9000));

const serializeBooking = (req: Request, booking: any) => ({
  ...booking,
  productPrice: Number(booking.productPrice),
  productQuantity: Number(booking.productQuantity),
  itemTotal: Number(booking.itemTotal),
  deliveryCharge: Number(booking.deliveryCharge),
  packagingCharge: Number(booking.packagingCharge),
  addonsTotal: Number(booking.addonsTotal),
  discountAmount: Number(booking.discountAmount),
  taxAmount: Number(booking.taxAmount),
  totalAmount: Number(booking.totalAmount),
  partnerRating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
  deliveryLatitude: booking.deliveryLatitude === null ? null : Number(booking.deliveryLatitude),
  deliveryLongitude: booking.deliveryLongitude === null ? null : Number(booking.deliveryLongitude),
  recipient: {
    name: booking.recipientName,
    phone: booking.recipientPhone,
    countryCode: booking.recipientCountryCode || '+91',
    deliverTo: booking.deliverTo,
    address: booking.deliveryAddress,
    landmark: booking.deliveryLandmark,
    postalCode: booking.deliveryPostalCode,
    city: booking.deliveryCity,
    state: booking.deliveryState,
    instructions: booking.deliveryInstructions,
  },
  gift: {
    categoryId: booking.categoryId,
    categoryName: booking.categoryName,
    productId: booking.productId,
    name: booking.productName,
    description: booking.productDescription,
    image: booking.productImage,
    price: Number(booking.productPrice),
    quantity: Number(booking.productQuantity),
    weight: booking.productWeight,
    serves: booking.productServes,
    occasion: booking.selectedOccasion,
    message: booking.giftMessage,
    greetingCard: {
      id: booking.greetingCardId,
      name: booking.greetingCardName,
    },
  },
  partner: {
    name: booking.partnerName || 'Rajesh Verma',
    phone: booking.partnerPhone || '+91 98765 43210',
    vehicle: booking.partnerVehicle || 'Hero Electric - KA 05 EV 4321',
    rating: booking.partnerRating === null ? 4.9 : Number(booking.partnerRating),
    hub: booking.currentHubLocation || 'Indiranagar Delivery Hub',
  },
});

import { env } from '../../config/env.js';

export const getOptions: RequestHandler = async (req, res) => {
  const [dbCategories, dbProducts, dbCards, dbSlots, dbConfig, dbLocations] = await Promise.all([
    prisma.giftCategory.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.giftProduct.findMany({
      where: { isAvailable: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      include: { category: true },
    }),
    prisma.giftCardTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.giftDeliverySlot.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.giftDeliveryConfig.findUnique({
      where: { key: 'GLOBAL_GIFT_CONFIG' },
    }),
    prisma.giftDeliveryLocation.findMany({
      where: { isActive: true },
      orderBy: [{ city: 'asc' }, { name: 'asc' }],
    }),
  ]);

  const fallback = getGiftDeliveryOptions();
  const apiBase = env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}/api/v1`;

  const categories = dbCategories.length > 0
    ? dbCategories.map((c) => ({
        id: c.slug.toUpperCase(),
        name: c.name,
        description: c.description || '',
        icon: c.iconName || 'Gift',
        tagline: c.description || `Fresh handcrafted ${c.name.toLowerCase()}`,
        imageUrl: c.imageMimeType ? `${apiBase}/gift-delivery/categories/${c.id}/image?v=${c.updatedAt.getTime()}` : null,
      }))
    : fallback.categories;

  const products = dbProducts.length > 0
    ? dbProducts.map((p) => ({
        id: p.id,
        categoryId: p.category.slug.toUpperCase(),
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        rating: Number(p.rating),
        reviewsCount: p.reviewsCount,
        weight: p.weight || undefined,
        serves: p.serves || undefined,
        occasionTag: p.occasionTag,
        badge: p.badge || undefined,
        image: p.imageMimeType
          ? `${apiBase}/gift-delivery/products/${p.id}/image?v=${p.updatedAt.getTime()}`
          : p.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
      }))
    : fallback.products;

  const greetingCards = dbCards.length > 0
    ? dbCards.map((c) => ({
        id: c.id,
        name: c.name,
        theme: c.theme,
        previewUrl: c.imageMimeType
          ? `${apiBase}/gift-delivery/cards/${c.id}/image?v=${c.updatedAt.getTime()}`
          : c.previewUrl || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400',
        icon: 'Gift',
      }))
    : fallback.greetingCards;

  const timeSlots = dbSlots.length > 0
    ? dbSlots.map((s) => `${s.startTime} - ${s.endTime} (${s.name})`)
    : fallback.timeSlots;

  const packagingCharge = dbConfig ? Number(dbConfig.packagingCharge) : fallback.packagingCharge;

  res.status(200).json({
    status: 'success',
    data: {
      categories,
      products,
      deliveryTypes: fallback.deliveryTypes,
      timeSlots,
      premiumSetups: fallback.premiumSetups,
      addons: fallback.addons,
      greetingCards,
      coupons: fallback.coupons,
      packagingCharge,
      locations: dbLocations.map((l) => ({
        id: l.id,
        name: l.name,
        city: l.city,
        state: l.state,
        postalCodes: l.postalCodes,
        baseDeliveryCharge: Number(l.baseDeliveryCharge),
      })),
      sandboxGateway: getSandboxGatewayOptions(),
    },
  });
};

export const getCategoryPhoto: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const category = await prisma.giftCategory.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { imageData: true, imageMimeType: true, imageFileName: true, updatedAt: true, id: true },
  });

  if (!category?.imageData || !category.imageMimeType) {
    throw new AppError(404, 'Category image not found.');
  }

  const fileName = encodeURIComponent(category.imageFileName || 'category-image');
  const buffer = Buffer.isBuffer(category.imageData) ? category.imageData : Buffer.from(category.imageData as any);

  res.set({
    'Content-Type': category.imageMimeType,
    'Content-Length': String(buffer.length),
    'Content-Disposition': `inline; filename*=UTF-8''${fileName}`,
    'Cache-Control': 'public, max-age=3600',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    ETag: `"${category.id}-${category.updatedAt.getTime()}"`,
  });

  res.status(200).send(buffer);
};

export const getProductPhoto: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const product = await prisma.giftProduct.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { imageData: true, imageMimeType: true, imageFileName: true, updatedAt: true, id: true },
  });

  if (!product?.imageData || !product.imageMimeType) {
    throw new AppError(404, 'Product image not found.');
  }

  const fileName = encodeURIComponent(product.imageFileName || 'product-image');
  const buffer = Buffer.isBuffer(product.imageData) ? product.imageData : Buffer.from(product.imageData as any);

  res.set({
    'Content-Type': product.imageMimeType,
    'Content-Length': String(buffer.length),
    'Content-Disposition': `inline; filename*=UTF-8''${fileName}`,
    'Cache-Control': 'public, max-age=3600',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    ETag: `"${product.id}-${product.updatedAt.getTime()}"`,
  });

  res.status(200).send(buffer);
};

export const getCardPhoto: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const card = await prisma.giftCardTemplate.findUnique({
    where: { id },
    select: { imageData: true, imageMimeType: true, imageFileName: true, updatedAt: true, id: true },
  });


  if (!card?.imageData || !card.imageMimeType) {
    throw new AppError(404, 'Gift card image not found.');
  }

  const fileName = encodeURIComponent(card.imageFileName || 'gift-card-image');
  const buffer = Buffer.isBuffer(card.imageData) ? card.imageData : Buffer.from(card.imageData as any);

  res.set({
    'Content-Type': card.imageMimeType,
    'Content-Length': String(buffer.length),
    'Content-Disposition': `inline; filename*=UTF-8''${fileName}`,
    'Cache-Control': 'public, max-age=3600',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    ETag: `"${card.id}-${card.updatedAt.getTime()}"`,
  });

  res.status(200).send(buffer);
};


export const getQuote: RequestHandler = (req, res) => {
  const quote = calculateGiftDeliveryQuote(req.body ?? {});
  res.status(200).json({
    status: 'success',
    data: { quote },
  });
};

export const createBooking: RequestHandler = async (req, res) => {
  const idempotencyKey = validateIdempotencyKey(req.get('Idempotency-Key'));
  const input = validateGiftDeliveryRequest(req.body);
  const requestFingerprint = fingerprint(input);
  const userId = req.user!.id;

  const existing = await prisma.giftDeliveryBooking.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    include: { service: true },
  });

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new AppError(409, 'This Idempotency-Key was already used for different gift delivery details.');
    }
    res.status(200).json({
      status: 'success',
      data: { booking: serializeBooking(req, existing), idempotentReplay: true },
    });
    return;
  }

  const quote = calculateGiftDeliveryQuote({
    productId: input.productId,
    productPrice: input.productPrice,
    productQuantity: input.productQuantity,
    deliveryType: input.deliveryType,
    selectedAddons: input.selectedAddons,
    hasHandwrittenCard: input.hasHandwrittenCard,
    isAnonymousSender: input.isAnonymousSender,
    hasPhotoProof: input.hasPhotoProof,
    hasVideoReaction: input.hasVideoReaction,
    hasPremiumWrap: input.hasPremiumWrap,
    hasPremiumSetup: input.hasPremiumSetup,
    couponCode: input.couponCode ?? undefined,
  });

  const giftService = await prisma.service.findFirst({
    where: { slug: { in: ['gift-delivery', 'gift-and-surprise'] }, isActive: true },
    select: { id: true },
  });

  const isInstant = input.paymentMethod === 'WALLET' || input.paymentMethod === 'UPI';
  const status: GiftDeliveryStatus = 'CONFIRMED';
  const paymentStatus = input.paymentMethod === 'WALLET' ? 'PAID' : 'PAID'; // Gift delivery is instant prepaid confirmation
  const confirmedAt = new Date();
  const deliveryOtp = makeOtp();

  try {
    const booking = await prisma.giftDeliveryBooking.create({
      data: {
        bookingNumber: makeBookingNumber(),
        userId,
        serviceId: giftService?.id ?? null,
        idempotencyKey,
        requestFingerprint,
        status,

        categoryId: input.categoryId,
        categoryName: input.categoryName,
        productId: input.productId,
        productName: input.productName,
        productDescription: input.productDescription || null,
        productImage: input.productImage || null,
        productPrice: new Prisma.Decimal(input.productPrice),
        productQuantity: input.productQuantity,
        productWeight: input.productWeight || '1 kg',
        productServes: input.productServes || '6 - 8 People',
        selectedOccasion: input.selectedOccasion || 'Birthday',

        deliverTo: input.deliverTo || 'Someone Else',
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        recipientCountryCode: input.recipientCountryCode || '+91',
        deliveryAddress: input.deliveryAddress,
        deliveryLandmark: input.deliveryLandmark || null,
        deliveryPostalCode: input.deliveryPostalCode,
        deliveryCity: input.deliveryCity,
        deliveryState: input.deliveryState || 'Karnataka',
        deliveryLatitude:
          input.deliveryLatitude !== null && input.deliveryLatitude !== undefined
            ? new Prisma.Decimal(input.deliveryLatitude)
            : null,
        deliveryLongitude:
          input.deliveryLongitude !== null && input.deliveryLongitude !== undefined
            ? new Prisma.Decimal(input.deliveryLongitude)
            : null,
        deliveryInstructions: input.deliveryInstructions || null,

        giftMessage: input.giftMessage || null,
        greetingCardId: input.greetingCardId || null,
        greetingCardName: input.greetingCardName || null,

        deliveryType: input.deliveryType,
        scheduledDate: input.scheduledDate,
        scheduledTimeSlot: input.scheduledTimeSlot,
        isMidnightDelivery: input.isMidnightDelivery,

        selectedAddons: input.selectedAddons ? (input.selectedAddons as Prisma.InputJsonValue) : Prisma.JsonNull,
        hasHandwrittenCard: input.hasHandwrittenCard,
        isAnonymousSender: input.isAnonymousSender,
        hasPhotoProof: input.hasPhotoProof,
        hasVideoReaction: input.hasVideoReaction,
        hasPremiumWrap: input.hasPremiumWrap,
        hasPremiumSetup: input.hasPremiumSetup,

        currency: quote.currency,
        itemTotal: new Prisma.Decimal(quote.itemTotal),
        deliveryCharge: new Prisma.Decimal(quote.deliveryCharge),
        packagingCharge: new Prisma.Decimal(quote.packagingCharge),
        addonsTotal: new Prisma.Decimal(quote.addonsTotal),
        discountAmount: new Prisma.Decimal(quote.discountAmount),
        taxAmount: new Prisma.Decimal(quote.taxAmount),
        totalAmount: new Prisma.Decimal(quote.totalAmount),

        paymentMethod: input.paymentMethod,
        paymentStatus,
        paymentProvider: input.paymentMethod === 'WALLET' ? 'DELIVEZ_WALLET' : 'SANDBOX_PAYMENT',
        paymentReference: `PAY-GIFT-${randomBytes(4).toString('hex').toUpperCase()}`,

        partnerName: 'Rajesh Verma',
        partnerPhone: '+91 98765 43210',
        partnerVehicle: 'Hero Electric - KA 05 EV 4321',
        partnerRating: new Prisma.Decimal(4.9),
        currentHubLocation: 'Indiranagar Delivery Hub',

        deliveryOtp,
        confirmedAt,
        preparingAt: new Date(),
      },
      include: { service: true },
    });

    res.status(201).json({
      status: 'success',
      data: { booking: serializeBooking(req, booking), idempotentReplay: false },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const replay = await prisma.giftDeliveryBooking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: { service: true },
      });
      if (replay?.requestFingerprint === requestFingerprint) {
        res.status(200).json({
          status: 'success',
          data: { booking: serializeBooking(req, replay), idempotentReplay: true },
        });
        return;
      }
    }
    throw error;
  }
};

export const listBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(String(req.query.limit ?? '10'), 10) || 10));
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : null;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : null;
  const userId = req.user!.id;

  const where: Prisma.GiftDeliveryBookingWhereInput = { userId };

  if (statusFilter && statusFilter !== 'ALL') {
    if (statusFilter === 'ACTIVE') {
      where.status = {
        in: [
          'CONFIRMED',
          'PREPARING_GIFT',
          'GIFT_PACKED',
          'PARTNER_ASSIGNED',
          'PICKED_UP',
          'ON_THE_WAY',
          'ARRIVED',
        ],
      };
    } else if (statusFilter === 'COMPLETED') {
      where.status = 'DELIVERED';
    } else if (statusFilter === 'CANCELLED') {
      where.status = 'CANCELLED';
    } else if (
      [
        'CONFIRMED',
        'PREPARING_GIFT',
        'GIFT_PACKED',
        'PARTNER_ASSIGNED',
        'PICKED_UP',
        'ON_THE_WAY',
        'ARRIVED',
        'DELIVERED',
        'CANCELLED',
      ].includes(statusFilter)
    ) {
      where.status = statusFilter as GiftDeliveryStatus;
    }
  }

  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { productName: { contains: search, mode: 'insensitive' } },
      { recipientName: { contains: search, mode: 'insensitive' } },
      { deliveryAddress: { contains: search, mode: 'insensitive' } },
      { deliveryCity: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [bookings, total] = await prisma.$transaction([
    prisma.giftDeliveryBooking.findMany({
      where,
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.giftDeliveryBooking.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map((b) => serializeBooking(req, b)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Gift delivery booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(req, booking) },
  });
};

export const trackBooking: RequestHandler = async (req, res) => {
  const identifier = String(req.params.identifier || req.params.id);

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: {
      OR: [{ id: identifier }, { bookingNumber: identifier }],
    },
    include: { service: true },
  });

  if (!booking) {
    throw new AppError(404, 'Tracking details not found for this gift delivery.');
  }

  const statusOrder: GiftDeliveryStatus[] = [
    'CONFIRMED',
    'PREPARING_GIFT',
    'GIFT_PACKED',
    'PARTNER_ASSIGNED',
    'PICKED_UP',
    'ON_THE_WAY',
    'ARRIVED',
    'DELIVERED',
  ];

  const currentIndex = statusOrder.indexOf(booking.status);

  // Dynamic simulated partner coordinates & speed based on status
  const destLat = Number(booking.deliveryLatitude) || 12.9716;
  const destLng = Number(booking.deliveryLongitude) || 77.5946;
  const hubLat = 12.9352;
  const hubLng = 77.6245;

  let partnerLat = hubLat;
  let partnerLng = hubLng;
  let eta = '15–20 mins';
  let distanceRemainingKm = '3.2 km';
  let partnerSpeedKmh = 0;

  if (booking.status === 'PREPARING_GIFT' || booking.status === 'GIFT_PACKED') {
    eta = 'Gift being prepared by bakery/artisan';
    distanceRemainingKm = '3.2 km';
  } else if (booking.status === 'PARTNER_ASSIGNED' || booking.status === 'PICKED_UP') {
    partnerLat = hubLat;
    partnerLng = hubLng;
    eta = '15–20 mins';
    distanceRemainingKm = '2.8 km';
    partnerSpeedKmh = 20;
  } else if (booking.status === 'ON_THE_WAY') {
    partnerLat = (hubLat + destLat) / 2 + 0.003;
    partnerLng = (hubLng + destLng) / 2 + 0.003;
    eta = '8–12 mins';
    distanceRemainingKm = '1.4 km';
    partnerSpeedKmh = 32;
  } else if (booking.status === 'ARRIVED') {
    partnerLat = destLat;
    partnerLng = destLng;
    eta = 'Partner arrived at delivery address';
    distanceRemainingKm = '0.0 km';
    partnerSpeedKmh = 0;
  } else if (booking.status === 'DELIVERED') {
    partnerLat = destLat;
    partnerLng = destLng;
    eta = 'Delivered';
    distanceRemainingKm = '0.0 km';
    partnerSpeedKmh = 0;
  }

  const milestones = [
    {
      key: 'ORDER_CONFIRMED',
      label: 'Order Confirmed',
      description: 'Your gift order has been placed and confirmed.',
      completed: true,
      timestamp: booking.confirmedAt || booking.createdAt,
    },
    {
      key: 'PREPARING_GIFT',
      label: 'Preparing Your Gift',
      description: `Freshly preparing ${booking.productName} with premium care.`,
      completed: currentIndex >= 1 || booking.status === 'DELIVERED',
      timestamp: booking.preparingAt || booking.confirmedAt,
    },
    {
      key: 'GIFT_PACKED',
      label: 'Gift Packed & Ready',
      description: booking.hasPremiumWrap ? 'Wrapped in premium gift paper with satin ribbon.' : 'Securely packed in celebration packaging.',
      completed: currentIndex >= 2 || booking.status === 'DELIVERED',
      timestamp: booking.packedAt,
    },
    {
      key: 'ON_THE_WAY',
      label: 'On The Way',
      description: `Partner ${booking.partnerName} (${booking.partnerVehicle}) is on the way.`,
      completed: currentIndex >= 5 || booking.status === 'DELIVERED',
      timestamp: booking.onTheWayAt,
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Gift delivered with joy and celebration to recipient!',
      completed: booking.status === 'DELIVERED',
      timestamp: booking.deliveredAt,
    },
  ];

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(req, booking),
      tracking: {
        orderId: booking.bookingNumber,
        bookingNumber: booking.bookingNumber,
        currentStatus: booking.status,
        distanceKm: distanceRemainingKm,
        eta,
        estimatedDeliveryDate: `${booking.scheduledDate} (${booking.scheduledTimeSlot})`,
        milestones,
        partner: {
          name: booking.partnerName || 'Rajesh Verma',
          phone: booking.partnerPhone || '+91 98765 43210',
          vehicle: booking.partnerVehicle || 'Hero Electric - KA 05 EV 4321',
          rating: 4.9,
          hub: booking.currentHubLocation || 'Indiranagar Delivery Hub',
          currentLocation: {
            latitude: partnerLat,
            longitude: partnerLng,
            speedKmh: partnerSpeedKmh,
            headingDegrees: 90,
          },
        },
        deliveryLocation: {
          recipientName: booking.recipientName,
          address: booking.deliveryAddress,
          city: booking.deliveryCity,
          postalCode: booking.deliveryPostalCode,
          latitude: destLat,
          longitude: destLng,
        },
        deliveryOtp: booking.deliveryOtp,
      },
    },
  });
};

export const verifyOtp: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.id);
  const { otp } = req.body ?? {};

  if (!otp) {
    throw new AppError(400, 'Valid delivery verification OTP is required.');
  }

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!booking) throw new AppError(404, 'Gift delivery booking not found.');

  if (booking.deliveryOtp !== String(otp).trim()) {
    throw new AppError(400, 'Invalid delivery verification OTP.');
  }

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      deliveryOtpVerifiedAt: new Date(),
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Delivery OTP verified successfully. Gift has been delivered!',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const cancelBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const cancellationReason =
    typeof req.body?.reason === 'string' ? req.body.reason.trim() : 'Cancelled by customer';

  if (cancellationReason.length < 3 || cancellationReason.length > 250) {
    throw new AppError(400, 'Cancellation reason must be between 3 and 250 characters.');
  }

  const result = await prisma.giftDeliveryBooking.updateMany({
    where: {
      id: bookingId,
      userId,
      status: {
        in: ['CONFIRMED', 'PREPARING_GIFT'],
      },
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason,
    },
  });

  if (result.count === 0) {
    const exists = await prisma.giftDeliveryBooking.findFirst({
      where: { id: bookingId, userId },
      select: { status: true },
    });
    if (!exists) throw new AppError(404, 'Gift delivery booking not found.');
    throw new AppError(409, `A gift delivery in status "${exists.status}" cannot be cancelled as preparation or transit has begun.`);
  }

  const updated = await prisma.giftDeliveryBooking.findUnique({
    where: { id: bookingId },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gift delivery order cancelled successfully.',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const rescheduleBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const input = validateRescheduleRequest(req.body);

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: {
      id: bookingId,
      userId,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Gift delivery booking not found.');
  }

  const allowedStatuses: GiftDeliveryStatus[] = ['CONFIRMED', 'PREPARING_GIFT'];
  if (!allowedStatuses.includes(booking.status)) {
    throw new AppError(400, `Cannot reschedule gift delivery in status "${booking.status}".`);
  }

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      scheduledDate: input.scheduledDate,
      scheduledTimeSlot: input.scheduledTimeSlot,
      deliveryInstructions: input.deliveryInstructions !== undefined ? input.deliveryInstructions : booking.deliveryInstructions,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Gift delivery schedule updated successfully.',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const getInvoice: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: {
      userId,
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
    },
    include: { service: true, user: true },
  });

  if (!booking) {
    throw new AppError(404, 'Gift delivery booking not found.');
  }

  const itemTotal = Number(booking.itemTotal);
  const deliveryCharge = Number(booking.deliveryCharge);
  const packagingCharge = Number(booking.packagingCharge);
  const addonsTotal = Number(booking.addonsTotal);
  const discount = Number(booking.discountAmount);
  const subtotal = itemTotal + deliveryCharge + packagingCharge + addonsTotal;
  const taxableAmount = Math.max(0, subtotal - discount);
  const totalTax = Number(booking.taxAmount);
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  const invoiceNumber = `INV-GIFT-${booking.bookingNumber.replace('DLVZ', '')}`;
  const invoiceDate = booking.confirmedAt || booking.createdAt;

  res.status(200).json({
    status: 'success',
    data: {
      invoice: {
        invoiceNumber,
        invoiceDate,
        bookingNumber: booking.bookingNumber,
        hsnSacCode: '996812',
        serviceDescription: 'Gift & Surprise Delivery Services',
        customer: {
          name: booking.user.fullName || 'Valued Customer',
          phone: booking.user.mobileNumber || '',
          email: booking.user.email,
        },
        recipient: {
          name: booking.recipientName,
          phone: booking.recipientPhone,
          address: `${booking.deliveryAddress}, ${booking.deliveryCity}, ${booking.deliveryPostalCode}`,
        },
        item: {
          productName: booking.productName,
          category: booking.categoryName,
          quantity: booking.productQuantity,
          weight: booking.productWeight,
          giftMessage: booking.giftMessage,
        },
        lineItems: [
          { description: `${booking.productName} (Qty: ${booking.productQuantity})`, amount: itemTotal },
          { description: `Delivery Charge (${booking.deliveryType})`, amount: deliveryCharge },
          { description: 'Packaging & Box Charges', amount: packagingCharge },
          ...(addonsTotal > 0 ? [{ description: 'Premium Add-ons & Setup Services', amount: addonsTotal }] : []),
        ],
        subtotal,
        discount,
        taxableAmount,
        taxes: [
          { name: 'CGST (9%)', rate: '9%', amount: cgst },
          { name: 'SGST (9%)', rate: '9%', amount: sgst },
        ],
        totalTax,
        grandTotal: Number(booking.totalAmount),
        currency: booking.currency || 'INR',
        payment: {
          method: booking.paymentMethod,
          status: booking.paymentStatus,
          reference: booking.paymentReference,
        },
      },
    },
  });
};

export const submitFeedback: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);
  const { rating, reviewText } = req.body ?? {};

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    throw new AppError(400, 'Rating must be an integer between 1 and 5.');
  }

  const booking = await prisma.giftDeliveryBooking.findFirst({
    where: { id: bookingId, userId },
  });

  if (!booking) throw new AppError(404, 'Gift delivery booking not found.');

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      rating: Math.round(numRating),
      reviewText: typeof reviewText === 'string' ? reviewText.trim().slice(0, 500) : null,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Feedback submitted successfully. Thank you!',
    data: { booking: serializeBooking(req, updated) },
  });
};

export const completeSandboxPayment: RequestHandler = async (req, res) => {
  const input = validateSandboxPayment(req.body);
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const existing = await prisma.giftDeliveryBooking.findFirst({
    where: { id: bookingId, userId },
    include: { service: true },
  });

  if (!existing) throw new AppError(404, 'Gift delivery booking not found.');

  const succeeded = input.outcome === 'SUCCESS';
  const booking = await prisma.giftDeliveryBooking.update({
    where: { id: existing.id },
    data: {
      status: succeeded ? 'CONFIRMED' : 'CONFIRMED',
      paymentStatus: succeeded ? 'PAID' : 'FAILED',
      paymentProvider: SANDBOX_PAYMENT_PROVIDER,
      paymentReference: makeSandboxPaymentReference(input.outcome),
      confirmedAt: succeeded ? new Date() : existing.confirmedAt,
    },
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(req, booking),
      payment: {
        provider: SANDBOX_PAYMENT_PROVIDER,
        sandbox: true,
        method: input.method,
        outcome: input.outcome,
        idempotentReplay: false,
      },
    },
  });
};

export const adminUpdateStatus: RequestHandler = async (req, res) => {
  const bookingId = String(req.params.id);
  const { status, hubLocation } = req.body ?? {};

  const validStatuses: GiftDeliveryStatus[] = [
    'CONFIRMED',
    'PREPARING_GIFT',
    'GIFT_PACKED',
    'PARTNER_ASSIGNED',
    'PICKED_UP',
    'ON_THE_WAY',
    'ARRIVED',
    'DELIVERED',
    'CANCELLED',
  ];

  if (!status || !validStatuses.includes(status)) {
    throw new AppError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const existing = await prisma.giftDeliveryBooking.findFirst({
    where: { OR: [{ id: bookingId }, { bookingNumber: bookingId }] },
  });

  if (!existing) throw new AppError(404, 'Gift delivery booking not found.');

  const updateData: Prisma.GiftDeliveryBookingUpdateInput = { status };
  const now = new Date();

  if (hubLocation && typeof hubLocation === 'string') {
    updateData.currentHubLocation = hubLocation.trim();
  }

  if (status === 'PREPARING_GIFT' && !existing.preparingAt) {
    updateData.preparingAt = now;
  } else if (status === 'GIFT_PACKED' && !existing.packedAt) {
    updateData.packedAt = now;
  } else if (status === 'PICKED_UP' && !existing.pickedUpAt) {
    updateData.pickedUpAt = now;
  } else if (status === 'ON_THE_WAY' && !existing.onTheWayAt) {
    updateData.onTheWayAt = now;
  } else if (status === 'ARRIVED' && !existing.arrivedAt) {
    updateData.arrivedAt = now;
  } else if (status === 'DELIVERED' && !existing.deliveredAt) {
    updateData.deliveredAt = now;
  } else if (status === 'CANCELLED' && !existing.cancelledAt) {
    updateData.cancelledAt = now;
  }

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: existing.id },
    data: updateData,
    include: { service: true },
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(req, updated) },
  });
};
