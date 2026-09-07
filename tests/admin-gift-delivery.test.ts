import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { createAccessToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/prisma.js';
import { seedGiftDelivery } from '../prisma/seed-gift-delivery.js';

describe('Admin Gift Delivery API & Dynamic Configuration', () => {
  let adminToken: string;
  let userToken: string;
  let adminId: string;
  let testUserId: string;
  let testOrderId: string;
  let testBookingNumber: string;

  beforeAll(async () => {
    // Run seed to ensure DB tables are populated
    await seedGiftDelivery();

    // Ensure an admin user exists
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          fullName: 'Test Admin',
          countryCode: '+91',
          mobileNumber: '9999900001',
          email: 'admin.test@delivez.com',
          passwordHash: 'dummyhash',
          role: 'ADMIN',
        },
      });
    }
    adminId = adminUser.id;
    adminToken = createAccessToken(adminId, true).token;

    // Ensure a dedicated regular user exists for this test suite
    const regularUser = await prisma.user.create({
      data: {
        fullName: 'Admin Test Customer',
        countryCode: '+91',
        mobileNumber: `989${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: `admintest_${Date.now()}@example.com`,
        passwordHash: 'dummyhash',
        role: 'USER',
      },
    });
    testUserId = regularUser.id;
    userToken = createAccessToken(testUserId, false).token;

    // Create a test gift booking
    const booking = await prisma.giftDeliveryBooking.create({
      data: {
        bookingNumber: `DLVZTEST${Math.floor(1000 + Math.random() * 9000)}`,
        userId: testUserId,
        idempotencyKey: `test-order-${Date.now()}`,
        requestFingerprint: 'dummy-fingerprint',
        status: 'CONFIRMED',
        categoryId: 'CAKES',
        categoryName: 'Cakes',
        productId: 'prod-truffle-1',
        productName: 'Signature Chocolate Truffle Cake',
        productPrice: 699.0,
        productQuantity: 1,
        deliverTo: 'Someone Else',
        recipientName: 'Aarav Mehta',
        recipientPhone: '9876543210',
        deliveryAddress: 'Flat 402, Sunshine Heights, Koramangala',
        deliveryPostalCode: '560034',
        deliveryCity: 'Bengaluru',
        deliveryType: 'STANDARD',
        scheduledDate: 'Thu, 09 May 2026',
        scheduledTimeSlot: '9:00 AM - 12:00 PM',
        itemTotal: 699.0,
        deliveryCharge: 49.0,
        packagingCharge: 20.0,
        addonsTotal: 0,
        discountAmount: 50.0,
        taxAmount: 38.0,
        totalAmount: 756.0,
        paymentMethod: 'UPI',
        paymentStatus: 'PAID',
        deliveryOtp: '5678',
      },
    });

    testOrderId = booking.id;
    testBookingNumber = booking.bookingNumber;
  });

  // 1. Dashboard Metrics
  it('GET /api/v1/admin/gift-delivery/metrics returns real DB metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/gift-delivery/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.totalOrders).toBeGreaterThanOrEqual(1);
    expect(res.body.data.statusCounts).toHaveProperty('CONFIRMED');
    expect(res.body.data.activeProductsCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.activeCategoriesCount).toBeGreaterThanOrEqual(1);
  });

  // 2. Orders Management
  it('GET /api/v1/admin/gift-delivery/orders supports search, filter and pagination', async () => {
    const res = await request(app)
      .get('/api/v1/admin/gift-delivery/orders?search=Aarav&page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.orders).toBeInstanceOf(Array);
    expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pagination.page).toBe(1);
  });

  it('GET /api/v1/admin/gift-delivery/orders/:id returns full order details', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/gift-delivery/orders/${testBookingNumber}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.order.recipientName).toBe('Aarav Mehta');
    expect(res.body.data.order.user).toBeDefined();
  });

  it('PATCH /api/v1/admin/gift-delivery/orders/:id/status updates status with timestamp milestones', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/gift-delivery/orders/${testOrderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'PREPARING_GIFT',
        partnerName: 'Vikram Singh',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.order.status).toBe('PREPARING_GIFT');
    expect(res.body.data.order.preparingAt).not.toBeNull();
  });

  // 3. Categories Management
  let createdCategoryId: string;
  it('POST /api/v1/admin/gift-delivery/categories creates dynamic category', async () => {
    const uniqueSlug = `test-cat-${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/admin/gift-delivery/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', `Test Category ${Date.now()}`)
      .field('slug', uniqueSlug)
      .field('description', 'Test Description for category')
      .field('iconName', 'Sparkles')
      .field('displayOrder', '10')
      .field('isActive', 'true');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.category.slug).toBe(uniqueSlug);
    createdCategoryId = res.body.data.category.id;
  });

  it('GET /api/v1/admin/gift-delivery/categories lists all dynamic categories', async () => {
    const res = await request(app)
      .get('/api/v1/admin/gift-delivery/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(1);
  });

  // 4. Products Management
  let createdProductId: string;
  it('POST /api/v1/admin/gift-delivery/products creates dynamic gift product', async () => {
    const uniqueSlug = `test-cake-${Date.now()}`;
    const res = await request(app)
      .post('/api/v1/admin/gift-delivery/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('categoryId', createdCategoryId)
      .field('name', 'Artisan Strawberry Shortcake')
      .field('slug', uniqueSlug)
      .field('description', 'Fresh hand-picked strawberries layered with chantilly cream')
      .field('price', '899')
      .field('discountPrice', '799')
      .field('sku', `SKU-${Date.now()}`)
      .field('weight', '1.2 kg')
      .field('serves', '8 - 10 People')
      .field('occasionTag', 'Anniversary')
      .field('badge', 'Chef Special')
      .field('stockQuantity', '50')
      .field('isAvailable', 'true')
      .field('displayOrder', '1');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.product.slug).toBe(uniqueSlug);
    createdProductId = res.body.data.product.id;
  });

  it('GET /api/v1/admin/gift-delivery/products lists products with search and category filter', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/gift-delivery/products?categoryId=${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/v1/admin/gift-delivery/products/:id updates price and availability', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/gift-delivery/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('price', '949')
      .field('badge', 'Trending Now');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.product.price).toBe('949');
    expect(res.body.data.product.badge).toBe('Trending Now');
  });

  // 5. Locations & Slots Management
  it('GET /api/v1/admin/gift-delivery/locations lists active delivery zones', async () => {
    const res = await request(app)
      .get('/api/v1/admin/gift-delivery/locations')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.locations.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/admin/gift-delivery/config returns global config and delivery slots', async () => {
    const res = await request(app)
      .get('/api/v1/admin/gift-delivery/config')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.config).toHaveProperty('packagingCharge');
    expect(res.body.data.slots).toBeInstanceOf(Array);
  });

  // 6. Public Dynamic Options Verification
  it('GET /api/v1/gift-delivery/options returns live database categories & products', async () => {
    const res = await request(app).get('/api/v1/gift-delivery/options');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.greetingCards.length).toBeGreaterThanOrEqual(1);
  });

  // 7. Category Deletion
  it('DELETE /api/v1/admin/gift-delivery/categories/:id deletes category and cascades products', async () => {
    const res = await request(app)
      .delete(`/api/v1/admin/gift-delivery/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.message).toContain('deleted successfully');

    // Confirm it no longer exists
    const check = await prisma.giftCategory.findUnique({
      where: { id: createdCategoryId },
    });
    expect(check).toBeNull();
  });
});
