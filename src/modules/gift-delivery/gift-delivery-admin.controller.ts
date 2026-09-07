import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/app-error.js';
import { env } from '../../config/env.js';
import {
  adminOrderStatusSchema,
  adminCancelOrderSchema,
  adminCategorySchema,
  adminProductSchema,
  adminCardSchema,
  adminLocationSchema,
  adminSlotSchema,
  adminConfigSchema,
} from './gift-delivery-admin.validation.js';

// Helper for building image URLs
export function getImageUrl(req: Request, path: string, versionDate?: Date | null): string {
  const apiBase = env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}/api/v1`;
  const v = versionDate ? `?v=${new Date(versionDate).getTime()}` : '';
  return `${apiBase}/gift-delivery/${path}${v}`;
}

// ---------------------------------------------------------------------------
// 1. DASHBOARD & METRICS
// ---------------------------------------------------------------------------
export async function getGiftMetrics(_req: Request, res: Response): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    statusCounts,
    revenueResult,
    activeProductsCount,
    activeCategoriesCount,
    activeLocationsCount,
  ] = await Promise.all([
    prisma.giftDeliveryBooking.count(),
    prisma.giftDeliveryBooking.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.giftDeliveryBooking.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.giftDeliveryBooking.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { not: 'CANCELLED' },
      },
    }),
    prisma.giftProduct.count({ where: { isAvailable: true } }),
    prisma.giftCategory.count({ where: { isActive: true } }),
    prisma.giftDeliveryLocation.count({ where: { isActive: true } }),
  ]);

  const statusMap: Record<string, number> = {
    CONFIRMED: 0,
    PREPARING_GIFT: 0,
    GIFT_PACKED: 0,
    ON_THE_WAY: 0,
    ARRIVED: 0,
    DELIVERED: 0,
    CANCELLED: 0,
  };

  statusCounts.forEach((sc) => {
    statusMap[sc.status] = sc._count.id;
  });

  const totalRevenue = Number(revenueResult._sum.totalAmount || 0);

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders,
      todayOrders,
      totalRevenue,
      statusCounts: statusMap,
      activeProductsCount,
      activeCategoriesCount,
      activeLocationsCount,
    },
  });
}

// ---------------------------------------------------------------------------
// 2. ORDERS MANAGEMENT
// ---------------------------------------------------------------------------
export async function listAdminOrders(req: Request, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const skip = (page - 1) * limit;

  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const paymentStatus = typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined;
  const deliveryType = typeof req.query.deliveryType === 'string' ? req.query.deliveryType : undefined;
  const dateFrom = typeof req.query.dateFrom === 'string' ? req.query.dateFrom : undefined;
  const dateTo = typeof req.query.dateTo === 'string' ? req.query.dateTo : undefined;
  const minAmount = req.query.minAmount;
  const maxAmount = req.query.maxAmount;
  const sortBy = typeof req.query.sortBy === 'string' ? req.query.sortBy : 'createdAt';
  const sortDir = req.query.sortDir === 'asc' ? 'asc' : 'desc';

  const where: Prisma.GiftDeliveryBookingWhereInput = {};

  if (status && typeof status === 'string' && status !== 'ALL') {
    where.status = status as any;
  }
  if (paymentStatus && typeof paymentStatus === 'string' && paymentStatus !== 'ALL') {
    where.paymentStatus = paymentStatus as any;
  }
  if (deliveryType && typeof deliveryType === 'string' && deliveryType !== 'ALL') {
    where.deliveryType = deliveryType as any;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    where.OR = [
      { bookingNumber: { contains: q, mode: 'insensitive' } },
      { recipientName: { contains: q, mode: 'insensitive' } },
      { recipientPhone: { contains: q } },
      { productName: { contains: q, mode: 'insensitive' } },
      { deliveryCity: { contains: q, mode: 'insensitive' } },
      { user: { fullName: { contains: q, mode: 'insensitive' } } },
      { user: { mobileNumber: { contains: q } } },
      { user: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom && typeof dateFrom === 'string') {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo && typeof dateTo === 'string') {
      const dTo = new Date(dateTo);
      dTo.setHours(23, 59, 59, 999);
      where.createdAt.lte = dTo;
    }
  }

  if (minAmount || maxAmount) {
    where.totalAmount = {};
    if (minAmount) where.totalAmount.gte = new Prisma.Decimal(String(minAmount));
    if (maxAmount) where.totalAmount.lte = new Prisma.Decimal(String(maxAmount));
  }

  const orderBy: Prisma.GiftDeliveryBookingOrderByWithRelationInput = {};
  if (sortBy === 'totalAmount' || sortBy === 'scheduledDate' || sortBy === 'status') {
    orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
  } else {
    orderBy.createdAt = sortDir === 'asc' ? 'asc' : 'desc';
  }

  const [total, orders] = await Promise.all([
    prisma.giftDeliveryBooking.count({ where }),
    prisma.giftDeliveryBooking.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobileNumber: true,
            countryCode: true,
          },
        },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
}

export async function getAdminOrderDetails(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);

  const order = await prisma.giftDeliveryBooking.findFirst({
    where: {
      OR: [{ id }, { bookingNumber: id }],
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
          countryCode: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(404, 'Gift delivery order not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { order },
  });
}

export async function updateAdminOrderStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminOrderStatusSchema.parse(req.body);

  const existing = await prisma.giftDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!existing) {
    throw new AppError(404, 'Gift delivery order not found.');
  }

  if (existing.status === 'CANCELLED' && data.status !== 'CANCELLED') {
    throw new AppError(400, 'Cannot change status of an already cancelled order.');
  }

  const now = new Date();
  const updateData: Prisma.GiftDeliveryBookingUpdateInput = {
    status: data.status,
  };

  if (data.partnerName) updateData.partnerName = data.partnerName;
  if (data.partnerPhone) updateData.partnerPhone = data.partnerPhone;
  if (data.partnerVehicle) updateData.partnerVehicle = data.partnerVehicle;

  // Stamp transition milestones
  switch (data.status) {
    case 'CONFIRMED':
      if (!existing.confirmedAt) updateData.confirmedAt = now;
      break;
    case 'PREPARING_GIFT':
      if (!existing.preparingAt) updateData.preparingAt = now;
      break;
    case 'GIFT_PACKED':
      if (!existing.packedAt) updateData.packedAt = now;
      break;
    case 'ON_THE_WAY':
      if (!existing.onTheWayAt) updateData.onTheWayAt = now;
      break;
    case 'ARRIVED':
      if (!existing.arrivedAt) updateData.arrivedAt = now;
      break;
    case 'DELIVERED':
      if (!existing.deliveredAt) updateData.deliveredAt = now;
      updateData.paymentStatus = 'PAID';
      break;
    case 'CANCELLED':
      if (!existing.cancelledAt) updateData.cancelledAt = now;
      if (data.cancellationReason) updateData.cancellationReason = data.cancellationReason;
      break;
  }

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: existing.id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          mobileNumber: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Order status successfully updated to ${data.status}.`,
    data: { order: updated },
  });
}

export async function cancelAdminOrder(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { reason } = adminCancelOrderSchema.parse(req.body);

  const existing = await prisma.giftDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!existing) {
    throw new AppError(404, 'Gift delivery order not found.');
  }

  if (existing.status === 'DELIVERED') {
    throw new AppError(400, 'Cannot cancel an order that has already been delivered.');
  }

  const updated = await prisma.giftDeliveryBooking.update({
    where: { id: existing.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: reason,
      paymentStatus: existing.paymentStatus === 'PAID' ? 'REFUNDED' : existing.paymentStatus,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully.',
    data: { order: updated },
  });
}

// ---------------------------------------------------------------------------
// 3. CATEGORIES MANAGEMENT
// ---------------------------------------------------------------------------
export async function listAdminCategories(req: Request, res: Response): Promise<void> {
  const categories = await prisma.giftCategory.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      _count: { select: { products: true } },
    },
  });

  const serialized = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    iconName: cat.iconName,
    displayOrder: cat.displayOrder,
    isActive: cat.isActive,
    productsCount: cat._count.products,
    hasImage: Boolean(cat.imageMimeType),
    imageUrl: cat.imageMimeType ? getImageUrl(req, `categories/${cat.id}/image`, cat.updatedAt) : null,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  }));

  res.status(200).json({
    status: 'success',
    data: { categories: serialized, total: serialized.length },
  });
}

export async function createAdminCategory(req: Request, res: Response): Promise<void> {
  const data = adminCategorySchema.parse(req.body);
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await prisma.giftCategory.findFirst({
    where: { OR: [{ name: data.name }, { slug }] },
  });

  if (existing) {
    throw new AppError(400, 'Category with this name or slug already exists.');
  }

  const createData: Prisma.GiftCategoryCreateInput = {
    name: data.name,
    slug,
    description: data.description,
    iconName: data.iconName,
    displayOrder: data.displayOrder,
    isActive: data.isActive,
  };

  if (req.file) {
    createData.imageData = Buffer.from(req.file.buffer);
    createData.imageMimeType = req.file.mimetype;
    createData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const category = await prisma.giftCategory.create({ data: createData });

  res.status(201).json({
    status: 'success',
    message: 'Category created successfully.',
    data: {
      category: {
        ...category,
        imageData: undefined,
        imageUrl: category.imageMimeType ? getImageUrl(req, `categories/${category.id}/image`, category.updatedAt) : null,
      },
    },
  });
}

export async function updateAdminCategory(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminCategorySchema.partial().parse(req.body);

  const existing = await prisma.giftCategory.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Category not found.');
  }

  const updateData: Prisma.GiftCategoryUpdateInput = { ...data };

  if (req.file) {
    updateData.imageData = Buffer.from(req.file.buffer);
    updateData.imageMimeType = req.file.mimetype;
    updateData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const updated = await prisma.giftCategory.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Category updated successfully.',
    data: {
      category: {
        ...updated,
        imageData: undefined,
        imageUrl: updated.imageMimeType ? getImageUrl(req, `categories/${updated.id}/image`, updated.updatedAt) : null,
      },
    },
  });
}

export async function deleteAdminCategory(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftCategory.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!existing) {
    throw new AppError(404, 'Category not found.');
  }

  // Delete associated products and product images if any to maintain clean referential integrity
  const products = await prisma.giftProduct.findMany({
    where: { categoryId: id },
    select: { id: true },
  });

  const productIds = products.map((p) => p.id);
  if (productIds.length > 0) {
    await prisma.giftProductImage.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.giftProduct.deleteMany({
      where: { categoryId: id },
    });
  }

  // Delete the category
  await prisma.giftCategory.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: `Category "${existing.name}" deleted successfully.`,
    data: { deletedCategoryId: id },
  });
}

// ---------------------------------------------------------------------------
// 4. PRODUCTS MANAGEMENT
// ---------------------------------------------------------------------------
export async function listAdminProducts(req: Request, res: Response): Promise<void> {
  const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const isAvailable = req.query.isAvailable;

  const where: Prisma.GiftProductWhereInput = {};
  if (categoryId && typeof categoryId === 'string' && categoryId !== 'ALL') {
    where.categoryId = categoryId;
  }
  if (isAvailable !== undefined && isAvailable !== 'ALL') {
    where.isAvailable = isAvailable === 'true';
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { sku: { contains: q, mode: 'insensitive' } },
      { occasionTag: { contains: q, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.giftProduct.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  const serialized = products.map((prod) => ({
    id: prod.id,
    categoryId: prod.categoryId,
    categoryName: prod.category.name,
    name: prod.name,
    slug: prod.slug,
    description: prod.description,
    price: Number(prod.price),
    discountPrice: prod.discountPrice ? Number(prod.discountPrice) : null,
    sku: prod.sku,
    weight: prod.weight,
    serves: prod.serves,
    occasionTag: prod.occasionTag,
    badge: prod.badge,
    stockQuantity: prod.stockQuantity,
    isAvailable: prod.isAvailable,
    displayOrder: prod.displayOrder,
    rating: Number(prod.rating),
    reviewsCount: prod.reviewsCount,
    hasImage: Boolean(prod.imageMimeType),
    image: prod.imageMimeType
      ? getImageUrl(req, `products/${prod.id}/image`, prod.updatedAt)
      : prod.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
    createdAt: prod.createdAt,
    updatedAt: prod.updatedAt,
  }));

  res.status(200).json({
    status: 'success',
    data: { products: serialized, total: serialized.length },
  });
}

export async function getAdminProduct(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const prod = await prisma.giftProduct.findUnique({
    where: { id },
    include: { category: true, images: true },
  });

  if (!prod) {
    throw new AppError(404, 'Product not found.');
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: {
        ...prod,
        price: Number(prod.price),
        discountPrice: prod.discountPrice ? Number(prod.discountPrice) : null,
        rating: Number(prod.rating),
        imageData: undefined,
        image: prod.imageMimeType
          ? getImageUrl(req, `products/${prod.id}/image`, prod.updatedAt)
          : prod.imageUrl,
      },
    },
  });
}

export async function createAdminProduct(req: Request, res: Response): Promise<void> {
  const data = adminProductSchema.parse(req.body);
  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const existing = await prisma.giftProduct.findFirst({
    where: { OR: [{ slug }, ...(data.sku ? [{ sku: data.sku }] : [])] },
  });

  if (existing) {
    throw new AppError(400, 'Product with this slug or SKU already exists.');
  }

  const createData: Prisma.GiftProductCreateInput = {
    category: { connect: { id: data.categoryId } },
    name: data.name,
    slug,
    description: data.description,
    price: new Prisma.Decimal(data.price),
    discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
    sku: data.sku,
    weight: data.weight,
    serves: data.serves,
    occasionTag: data.occasionTag,
    badge: data.badge,
    stockQuantity: data.stockQuantity,
    isAvailable: data.isAvailable,
    displayOrder: data.displayOrder,
    imageUrl: data.imageUrl,
  };

  if (req.file) {
    createData.imageData = Buffer.from(req.file.buffer);
    createData.imageMimeType = req.file.mimetype;
    createData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const product = await prisma.giftProduct.create({
    data: createData,
    include: { category: true },
  });

  res.status(201).json({
    status: 'success',
    message: 'Product created successfully.',
    data: {
      product: {
        ...product,
        imageData: undefined,
        image: product.imageMimeType ? getImageUrl(req, `products/${product.id}/image`, product.updatedAt) : product.imageUrl,
      },
    },
  });
}

export async function updateAdminProduct(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminProductSchema.partial().parse(req.body);

  const existing = await prisma.giftProduct.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Product not found.');
  }

  const updateData: Prisma.GiftProductUpdateInput = {};

  if (data.categoryId) updateData.category = { connect: { id: data.categoryId } };
  if (data.name) updateData.name = data.name;
  if (data.slug) updateData.slug = data.slug;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.price !== undefined) updateData.price = new Prisma.Decimal(data.price);
  if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null;
  if (data.sku !== undefined) updateData.sku = data.sku;
  if (data.weight !== undefined) updateData.weight = data.weight;
  if (data.serves !== undefined) updateData.serves = data.serves;
  if (data.occasionTag) updateData.occasionTag = data.occasionTag;
  if (data.badge !== undefined) updateData.badge = data.badge;
  if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
  if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  if (req.file) {
    updateData.imageData = Buffer.from(req.file.buffer);
    updateData.imageMimeType = req.file.mimetype;
    updateData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const updated = await prisma.giftProduct.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });

  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully.',
    data: {
      product: {
        ...updated,
        imageData: undefined,
        image: updated.imageMimeType ? getImageUrl(req, `products/${updated.id}/image`, updated.updatedAt) : updated.imageUrl,
      },
    },
  });
}

export async function deleteAdminProduct(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftProduct.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Product not found.');
  }

  await prisma.giftProduct.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Product deleted successfully.',
  });
}

// ---------------------------------------------------------------------------
// 5. GIFT CARDS MANAGEMENT
// ---------------------------------------------------------------------------
export async function listAdminCards(req: Request, res: Response): Promise<void> {
  const cards = await prisma.giftCardTemplate.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
  });

  const serialized = cards.map((card) => ({
    id: card.id,
    name: card.name,
    theme: card.theme,
    title: card.title,
    description: card.description,
    minAmount: Number(card.minAmount),
    maxAmount: Number(card.maxAmount),
    customAmountSupported: card.customAmountSupported,
    denominations: card.denominations,
    validityDays: card.validityDays,
    isActive: card.isActive,
    displayOrder: card.displayOrder,
    hasImage: Boolean(card.imageMimeType),
    previewUrl: card.imageMimeType
      ? getImageUrl(req, `cards/${card.id}/image`, card.updatedAt)
      : card.previewUrl || 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400',
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  }));

  res.status(200).json({
    status: 'success',
    data: { cards: serialized, total: serialized.length },
  });
}

export async function createAdminCard(req: Request, res: Response): Promise<void> {
  const data = adminCardSchema.parse(req.body);

  const createData: Prisma.GiftCardTemplateCreateInput = {
    name: data.name,
    theme: data.theme,
    title: data.title,
    description: data.description,
    previewUrl: data.previewUrl,
    minAmount: new Prisma.Decimal(data.minAmount),
    maxAmount: new Prisma.Decimal(data.maxAmount),
    customAmountSupported: data.customAmountSupported,
    denominations: data.denominations || [500, 1000, 2000, 5000],
    validityDays: data.validityDays,
    isActive: data.isActive,
    displayOrder: data.displayOrder,
  };

  if (req.file) {
    createData.imageData = Buffer.from(req.file.buffer);
    createData.imageMimeType = req.file.mimetype;
    createData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const card = await prisma.giftCardTemplate.create({ data: createData });

  res.status(201).json({
    status: 'success',
    message: 'Gift card template created successfully.',
    data: {
      card: {
        ...card,
        imageData: undefined,
        previewUrl: card.imageMimeType ? getImageUrl(req, `cards/${card.id}/image`, card.updatedAt) : card.previewUrl,
      },
    },
  });
}

export async function updateAdminCard(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminCardSchema.partial().parse(req.body);

  const existing = await prisma.giftCardTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Gift card template not found.');
  }

  const updateData: Prisma.GiftCardTemplateUpdateInput = {};
  if (data.name) updateData.name = data.name;
  if (data.theme) updateData.theme = data.theme;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.previewUrl !== undefined) updateData.previewUrl = data.previewUrl;
  if (data.minAmount !== undefined) updateData.minAmount = new Prisma.Decimal(data.minAmount);
  if (data.maxAmount !== undefined) updateData.maxAmount = new Prisma.Decimal(data.maxAmount);
  if (data.customAmountSupported !== undefined) updateData.customAmountSupported = data.customAmountSupported;
  if (data.denominations !== undefined) updateData.denominations = data.denominations;
  if (data.validityDays !== undefined) updateData.validityDays = data.validityDays;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  if (req.file) {
    updateData.imageData = Buffer.from(req.file.buffer);
    updateData.imageMimeType = req.file.mimetype;
    updateData.imageFileName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  const updated = await prisma.giftCardTemplate.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Gift card template updated successfully.',
    data: {
      card: {
        ...updated,
        imageData: undefined,
        previewUrl: updated.imageMimeType ? getImageUrl(req, `cards/${updated.id}/image`, updated.updatedAt) : updated.previewUrl,
      },
    },
  });
}

export async function deleteAdminCard(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftCardTemplate.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Gift card template not found.');
  }

  await prisma.giftCardTemplate.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Gift card template deleted successfully.',
  });
}

// ---------------------------------------------------------------------------
// 6. LOCATIONS MANAGEMENT
// ---------------------------------------------------------------------------
export async function listAdminLocations(_req: Request, res: Response): Promise<void> {
  const locations = await prisma.giftDeliveryLocation.findMany({
    orderBy: [{ city: 'asc' }, { name: 'asc' }],
  });

  res.status(200).json({
    status: 'success',
    data: {
      locations: locations.map((loc) => ({
        ...loc,
        baseDeliveryCharge: Number(loc.baseDeliveryCharge),
        minOrderAmount: Number(loc.minOrderAmount),
      })),
      total: locations.length,
    },
  });
}

export async function createAdminLocation(req: Request, res: Response): Promise<void> {
  const data = adminLocationSchema.parse(req.body);

  const loc = await prisma.giftDeliveryLocation.create({
    data: {
      name: data.name,
      city: data.city,
      state: data.state,
      postalCodes: data.postalCodes,
      baseDeliveryCharge: new Prisma.Decimal(data.baseDeliveryCharge),
      minOrderAmount: new Prisma.Decimal(data.minOrderAmount),
      estimatedDeliveryTime: data.estimatedDeliveryTime,
      isSameDayAvailable: data.isSameDayAvailable,
      isMidnightAvailable: data.isMidnightAvailable,
      isActive: data.isActive,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Delivery location zone created successfully.',
    data: {
      location: {
        ...loc,
        baseDeliveryCharge: Number(loc.baseDeliveryCharge),
        minOrderAmount: Number(loc.minOrderAmount),
      },
    },
  });
}

export async function updateAdminLocation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminLocationSchema.partial().parse(req.body);

  const existing = await prisma.giftDeliveryLocation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Delivery location not found.');
  }

  const updateData: Prisma.GiftDeliveryLocationUpdateInput = { ...data };
  if (data.baseDeliveryCharge !== undefined) updateData.baseDeliveryCharge = new Prisma.Decimal(data.baseDeliveryCharge);
  if (data.minOrderAmount !== undefined) updateData.minOrderAmount = new Prisma.Decimal(data.minOrderAmount);

  const updated = await prisma.giftDeliveryLocation.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Delivery location updated successfully.',
    data: {
      location: {
        ...updated,
        baseDeliveryCharge: Number(updated.baseDeliveryCharge),
        minOrderAmount: Number(updated.minOrderAmount),
      },
    },
  });
}

export async function deleteAdminLocation(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftDeliveryLocation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Delivery location not found.');
  }

  await prisma.giftDeliveryLocation.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Delivery location deleted successfully.',
  });
}

// ---------------------------------------------------------------------------
// 7. DELIVERY SLOTS & GLOBAL CONFIGURATION
// ---------------------------------------------------------------------------
export async function getAdminConfig(_req: Request, res: Response): Promise<void> {
  const config = await prisma.giftDeliveryConfig.findUnique({
    where: { key: 'GLOBAL_GIFT_CONFIG' },
  });

  const slots = await prisma.giftDeliverySlot.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  res.status(200).json({
    status: 'success',
    data: {
      config: config
        ? {
            ...config,
            packagingCharge: Number(config.packagingCharge),
            freeDeliveryThreshold: Number(config.freeDeliveryThreshold),
            taxPercentage: Number(config.taxPercentage),
            handwrittenCardPrice: Number(config.handwrittenCardPrice),
            anonymousSenderPrice: Number(config.anonymousSenderPrice),
            photoProofPrice: Number(config.photoProofPrice),
            luxurySetupPrice: Number(config.luxurySetupPrice),
            videoReactionPrice: Number(config.videoReactionPrice),
            premiumWrapPrice: Number(config.premiumWrapPrice),
          }
        : null,
      slots: slots.map((s) => ({
        ...s,
        basePrice: Number(s.basePrice),
      })),
    },
  });
}

export async function updateAdminConfig(req: Request, res: Response): Promise<void> {
  const data = adminConfigSchema.partial().parse(req.body);

  const updateData: Prisma.GiftDeliveryConfigUpdateInput = {};
  if (data.packagingCharge !== undefined) updateData.packagingCharge = new Prisma.Decimal(data.packagingCharge);
  if (data.freeDeliveryThreshold !== undefined) updateData.freeDeliveryThreshold = new Prisma.Decimal(data.freeDeliveryThreshold);
  if (data.taxPercentage !== undefined) updateData.taxPercentage = new Prisma.Decimal(data.taxPercentage);
  if (data.sameDayCutoffTime !== undefined) updateData.sameDayCutoffTime = data.sameDayCutoffTime;
  if (data.advanceBookingDays !== undefined) updateData.advanceBookingDays = data.advanceBookingDays;
  if (data.handwrittenCardPrice !== undefined) updateData.handwrittenCardPrice = new Prisma.Decimal(data.handwrittenCardPrice);
  if (data.anonymousSenderPrice !== undefined) updateData.anonymousSenderPrice = new Prisma.Decimal(data.anonymousSenderPrice);
  if (data.photoProofPrice !== undefined) updateData.photoProofPrice = new Prisma.Decimal(data.photoProofPrice);
  if (data.luxurySetupPrice !== undefined) updateData.luxurySetupPrice = new Prisma.Decimal(data.luxurySetupPrice);
  if (data.videoReactionPrice !== undefined) updateData.videoReactionPrice = new Prisma.Decimal(data.videoReactionPrice);
  if (data.premiumWrapPrice !== undefined) updateData.premiumWrapPrice = new Prisma.Decimal(data.premiumWrapPrice);

  const config = await prisma.giftDeliveryConfig.upsert({
    where: { key: 'GLOBAL_GIFT_CONFIG' },
    update: updateData,
    create: {
      key: 'GLOBAL_GIFT_CONFIG',
      packagingCharge: 20.0,
      freeDeliveryThreshold: 1500.0,
      taxPercentage: 18.0,
      ...updateData,
    } as any,
  });

  res.status(200).json({
    status: 'success',
    message: 'Global Gift Delivery configuration updated successfully.',
    data: { config },
  });
}

export async function listAdminSlots(_req: Request, res: Response): Promise<void> {
  const slots = await prisma.giftDeliverySlot.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  });

  res.status(200).json({
    status: 'success',
    data: {
      slots: slots.map((s) => ({
        ...s,
        basePrice: Number(s.basePrice),
      })),
      total: slots.length,
    },
  });
}

export async function createAdminSlot(req: Request, res: Response): Promise<void> {
  const data = adminSlotSchema.parse(req.body);

  const slot = await prisma.giftDeliverySlot.create({
    data: {
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      deliverySpeed: data.deliverySpeed,
      basePrice: new Prisma.Decimal(data.basePrice),
      maxOrdersPerSlot: data.maxOrdersPerSlot,
      isActive: data.isActive,
      displayOrder: data.displayOrder,
    },
  });

  res.status(201).json({
    status: 'success',
    message: 'Delivery slot created successfully.',
    data: {
      slot: {
        ...slot,
        basePrice: Number(slot.basePrice),
      },
    },
  });
}

export async function updateAdminSlot(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const data = adminSlotSchema.partial().parse(req.body);

  const existing = await prisma.giftDeliverySlot.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Delivery slot not found.');
  }

  const updateData: Prisma.GiftDeliverySlotUpdateInput = { ...data };
  if (data.basePrice !== undefined) updateData.basePrice = new Prisma.Decimal(data.basePrice);

  const updated = await prisma.giftDeliverySlot.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    message: 'Delivery slot updated successfully.',
    data: {
      slot: {
        ...updated,
        basePrice: Number(updated.basePrice),
      },
    },
  });
}

export async function deleteAdminSlot(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const existing = await prisma.giftDeliverySlot.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, 'Delivery slot not found.');
  }

  await prisma.giftDeliverySlot.delete({ where: { id } });

  res.status(200).json({
    status: 'success',
    message: 'Delivery slot deleted successfully.',
  });
}
