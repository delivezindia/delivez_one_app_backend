import { PrismaClient } from '@prisma/client';
import { GIFT_DELIVERY_CONFIG } from '../src/modules/gift-delivery/gift-delivery-config.js';

const prisma = new PrismaClient();

export async function seedGiftDelivery() {
  console.log('Seeding dynamic Gift Delivery models...');

  // 1. Seed Categories
  let catIndex = 0;
  for (const cat of GIFT_DELIVERY_CONFIG.categories) {
    await prisma.giftCategory.upsert({
      where: { slug: cat.id.toLowerCase() },
      update: {
        name: cat.name,
        iconName: cat.icon,
        description: cat.description,
        displayOrder: catIndex,
        isActive: true,
      },
      create: {
        name: cat.name,
        slug: cat.id.toLowerCase(),
        iconName: cat.icon,
        description: cat.description,
        displayOrder: catIndex,
        isActive: true,
      },
    });
    catIndex++;
  }

  const categoryRecords = await prisma.giftCategory.findMany();
  const categoryMap = new Map(categoryRecords.map((c) => [c.name.toUpperCase(), c.id]));
  const cakesCatId = categoryMap.get('CAKES') || (categoryRecords[0] ? categoryRecords[0].id : '');

  // 2. Seed Products
  let prodIndex = 0;
  for (const prod of GIFT_DELIVERY_CONFIG.products) {
    const catId = categoryMap.get(prod.categoryId) || cakesCatId;
    const slug = prod.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await prisma.giftProduct.upsert({
      where: { slug },
      update: {
        categoryId: catId,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        imageUrl: prod.image,
        weight: prod.weight,
        serves: prod.serves,
        occasionTag: prod.occasionTag,
        badge: prod.badge,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        stockQuantity: 100,
        isAvailable: true,
        displayOrder: prodIndex,
      },
      create: {
        categoryId: catId,
        name: prod.name,
        slug,
        description: prod.description,
        price: prod.price,
        imageUrl: prod.image,
        weight: prod.weight,
        serves: prod.serves,
        occasionTag: prod.occasionTag,
        badge: prod.badge,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        stockQuantity: 100,
        isAvailable: true,
        displayOrder: prodIndex,
      },
    });
    prodIndex++;
  }

  // 3. Seed Greeting Cards
  let cardIndex = 0;
  for (const card of GIFT_DELIVERY_CONFIG.greetingCards) {
    const existing = await prisma.giftCardTemplate.findFirst({
      where: { name: card.name },
    });

    if (existing) {
      await prisma.giftCardTemplate.update({
        where: { id: existing.id },
        data: {
          theme: card.theme,
          previewUrl: card.previewUrl,
          displayOrder: cardIndex,
          isActive: true,
        },
      });
    } else {
      await prisma.giftCardTemplate.create({
        data: {
          name: card.name,
          theme: card.theme,
          previewUrl: card.previewUrl,
          displayOrder: cardIndex,
          isActive: true,
          minAmount: 100,
          maxAmount: 10000,
          customAmountSupported: true,
          denominations: [500, 1000, 2000, 5000],
        },
      });
    }
    cardIndex++;
  }

  // 4. Seed Delivery Locations
  const defaultLocations = [
    { name: 'Central Delhi Zone', city: 'New Delhi', state: 'Delhi', postalCodes: '110001, 110016, 110020, 110003', baseDeliveryCharge: 49.0, minOrderAmount: 299.0, estimatedDeliveryTime: '2 Hours' },
    { name: 'Bengaluru Tech Corridor', city: 'Bengaluru', state: 'Karnataka', postalCodes: '560001, 560034, 560100, 560038', baseDeliveryCharge: 49.0, minOrderAmount: 299.0, estimatedDeliveryTime: '2-3 Hours' },
    { name: 'South Mumbai & Bandra', city: 'Mumbai', state: 'Maharashtra', postalCodes: '400001, 400050, 400051, 400028', baseDeliveryCharge: 69.0, minOrderAmount: 399.0, estimatedDeliveryTime: '3 Hours' },
    { name: 'Hyderabad Hitec City', city: 'Hyderabad', state: 'Telangana', postalCodes: '500081, 500034, 500032, 500018', baseDeliveryCharge: 49.0, minOrderAmount: 299.0, estimatedDeliveryTime: '2-3 Hours' },
    { name: 'Pune City Central', city: 'Pune', state: 'Maharashtra', postalCodes: '411001, 411004, 411014, 411045', baseDeliveryCharge: 49.0, minOrderAmount: 299.0, estimatedDeliveryTime: '2-3 Hours' },
  ];

  for (const loc of defaultLocations) {
    const existing = await prisma.giftDeliveryLocation.findFirst({
      where: { name: loc.name },
    });
    if (!existing) {
      await prisma.giftDeliveryLocation.create({
        data: loc,
      });
    }
  }

  // 5. Seed Delivery Slots
  const defaultSlots = [
    { name: 'Early Morning Slot', startTime: '07:00 AM', endTime: '09:00 AM', deliverySpeed: 'STANDARD' as const, basePrice: 49.0, maxOrdersPerSlot: 40, displayOrder: 1 },
    { name: 'Standard Morning Slot', startTime: '09:00 AM', endTime: '12:00 PM', deliverySpeed: 'STANDARD' as const, basePrice: 49.0, maxOrdersPerSlot: 50, displayOrder: 2 },
    { name: 'Afternoon Slot', startTime: '12:00 PM', endTime: '03:00 PM', deliverySpeed: 'STANDARD' as const, basePrice: 49.0, maxOrdersPerSlot: 50, displayOrder: 3 },
    { name: 'Evening Prime Slot', startTime: '03:00 PM', endTime: '06:00 PM', deliverySpeed: 'STANDARD' as const, basePrice: 49.0, maxOrdersPerSlot: 50, displayOrder: 4 },
    { name: 'Night Prime Slot', startTime: '06:00 PM', endTime: '09:00 PM', deliverySpeed: 'STANDARD' as const, basePrice: 49.0, maxOrdersPerSlot: 40, displayOrder: 5 },
    { name: 'Express 2-Hour Slot', startTime: 'Instant', endTime: 'Within 2 Hours', deliverySpeed: 'EXPRESS' as const, basePrice: 99.0, maxOrdersPerSlot: 30, displayOrder: 6 },
    { name: 'Midnight Surprise Slot', startTime: '11:30 PM', endTime: '12:15 AM', deliverySpeed: 'MIDNIGHT' as const, basePrice: 199.0, maxOrdersPerSlot: 25, displayOrder: 7 },
  ];

  for (const slot of defaultSlots) {
    const existing = await prisma.giftDeliverySlot.findFirst({
      where: { name: slot.name },
    });
    if (!existing) {
      await prisma.giftDeliverySlot.create({
        data: slot,
      });
    }
  }

  // 6. Seed Global Config
  await prisma.giftDeliveryConfig.upsert({
    where: { key: 'GLOBAL_GIFT_CONFIG' },
    update: {},
    create: {
      key: 'GLOBAL_GIFT_CONFIG',
      packagingCharge: 20.0,
      freeDeliveryThreshold: 1500.0,
      taxPercentage: 18.0,
      sameDayCutoffTime: '06:00 PM',
      advanceBookingDays: 30,
      handwrittenCardPrice: 79.0,
      anonymousSenderPrice: 49.0,
      photoProofPrice: 39.0,
      luxurySetupPrice: 299.0,
      videoReactionPrice: 79.0,
      premiumWrapPrice: 49.0,
    },
  });

  console.log('Gift Delivery dynamic models seeded successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed-gift-delivery.ts')) {
  seedGiftDelivery()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
