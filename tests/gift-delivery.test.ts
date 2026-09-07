import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { createAccessToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/prisma.js';

describe('Gift Delivery Module (DELIVEZ BACK)', () => {
  let testUser: any;
  let userToken: string;
  let bookingId: string;
  let bookingNumber: string;
  let deliveryOtp: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        fullName: 'Rahul Sharma',
        countryCode: '+91',
        mobileNumber: `987${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: `giftuser_${randomUUID().slice(0, 8)}@example.com`,
        passwordHash: 'dummy-hashed-password',
        role: 'USER',
      },
    });

    userToken = createAccessToken(testUser.id).token;
  });

  afterAll(async () => {
    if (testUser?.id) {
      await prisma.giftDeliveryBooking.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  it('1. GET /api/v1/gift-delivery/options returns full categories, products, add-ons and coupons', async () => {
    const res = await request(app).get('/api/v1/gift-delivery/options');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.categories).toBeInstanceOf(Array);
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(9);
    expect(res.body.data.products).toBeInstanceOf(Array);
    expect(res.body.data.deliveryTypes).toBeInstanceOf(Array);
    expect(res.body.data.timeSlots).toBeInstanceOf(Array);
    expect(res.body.data.premiumSetups).toBeInstanceOf(Array);
    expect(res.body.data.addons).toBeInstanceOf(Array);
    expect(res.body.data.coupons).toBeInstanceOf(Array);
  });

  it('2. POST /api/v1/gift-delivery/quote calculates itemized breakdown with coupon discount', async () => {
    const res = await request(app)
      .post('/api/v1/gift-delivery/quote')
      .send({
        productId: 'cake-choc-truffle',
        productPrice: 699,
        productQuantity: 1,
        deliveryType: 'STANDARD',
        hasHandwrittenCard: true,
        hasAnonymousSender: true,
        couponCode: 'GIFTLOVE',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.quote).toBeDefined();
    expect(res.body.data.quote.itemTotal).toBe(699);
    expect(res.body.data.quote.deliveryCharge).toBe(49);
    expect(res.body.data.quote.packagingCharge).toBe(20);
    expect(res.body.data.quote.addonsTotal).toBe(128); // 79 + 49
    expect(res.body.data.quote.discountAmount).toBeGreaterThan(0);
    expect(res.body.data.quote.totalAmount).toBeGreaterThan(0);
    expect(res.body.data.quote.breakdown).toBeInstanceOf(Array);
  });

  it('3. POST /api/v1/gift-delivery creates a confirmed gift delivery order and returns 201', async () => {
    const idempotencyKey = `gift-test-${Date.now()}-${Math.random()}`;

    const res = await request(app)
      .post('/api/v1/gift-delivery')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        categoryId: 'CAKES',
        categoryName: 'Cakes',
        productId: 'cake-choc-truffle',
        productName: 'Chocolate Truffle Cake',
        productDescription: 'Premium cake for every celebration',
        productPrice: 699,
        productQuantity: 1,
        productWeight: '1 kg',
        productServes: '6 - 8 People',
        selectedOccasion: 'Birthday',

        deliverTo: 'Someone Else',
        recipientName: 'Rahul Sharma',
        recipientPhone: '9876543210',
        recipientCountryCode: '+91',
        deliveryAddress: 'B-101, Green Park, New Delhi - 110016, Near Metro Gate No. 2',
        deliveryLandmark: 'Main Market',
        deliveryPostalCode: '110016',
        deliveryCity: 'New Delhi',
        deliveryState: 'Delhi',
        deliveryLatitude: 28.5588,
        deliveryLongitude: 77.2028,
        deliveryInstructions: 'Ring doorbell twice, leave with security if unavailable',

        giftMessage: 'Wishing you the happiest birthday filled with joy and sweetness!',
        greetingCardId: 'card-bday-1',
        greetingCardName: 'Happy Birthday Celebration',

        deliveryType: 'STANDARD',
        scheduledDate: 'Thu, 09 May 2026',
        scheduledTimeSlot: '9:00 AM - 12:00 PM (Morning)',
        isMidnightDelivery: false,

        hasHandwrittenCard: true,
        isAnonymousSender: true,
        hasPremiumWrap: true,
        couponCode: 'GIFTLOVE',
        paymentMethod: 'UPI',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.booking.bookingNumber).toMatch(/^DLVZ/);
    expect(res.body.data.booking.status).toBe('CONFIRMED');
    expect(res.body.data.booking.paymentStatus).toBe('PAID');
    expect(res.body.data.booking.recipient.name).toBe('Rahul Sharma');
    expect(res.body.data.booking.gift.name).toBe('Chocolate Truffle Cake');

    bookingId = res.body.data.booking.id;
    bookingNumber = res.body.data.booking.bookingNumber;
    deliveryOtp = res.body.data.booking.deliveryOtp;
  });

  it('4. POST /api/v1/gift-delivery replays idempotently on identical request', async () => {
    const idempotencyKey = `gift-replay-${Date.now()}`;
    const payload = {
      categoryId: 'FLOWERS',
      categoryName: 'Flowers',
      productId: 'flower-red-roses-12',
      productName: '12 Red Roses Love Bouquet',
      productPrice: 599,
      productQuantity: 1,
      deliverTo: 'Someone Else',
      recipientName: 'Priya Verma',
      recipientPhone: '9876500000',
      deliveryAddress: 'Flat 402, Sunshine Heights, HSR Layout',
      deliveryCity: 'Bengaluru',
      deliveryPostalCode: '560102',
      deliveryState: 'Karnataka',
      deliveryType: 'EXPRESS',
      scheduledDate: 'Fri, 10 May 2026',
      scheduledTimeSlot: '3:00 PM - 6:00 PM (Evening)',
      paymentMethod: 'WALLET',
    };

    const first = await request(app)
      .post('/api/v1/gift-delivery')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(first.status).toBe(201);
    expect(first.body.data.idempotentReplay).toBe(false);

    const second = await request(app)
      .post('/api/v1/gift-delivery')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(second.status).toBe(200);
    expect(second.body.data.idempotentReplay).toBe(true);
    expect(second.body.data.booking.id).toBe(first.body.data.booking.id);
  });

  it('5. GET /api/v1/gift-delivery lists user gift orders', async () => {
    const res = await request(app)
      .get('/api/v1/gift-delivery')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.bookings).toBeInstanceOf(Array);
    expect(res.body.data.bookings.length).toBeGreaterThan(0);
  });

  it('6. GET /api/v1/gift-delivery/:id fetches gift order details', async () => {
    const res = await request(app)
      .get(`/api/v1/gift-delivery/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.id).toBe(bookingId);
    expect(res.body.data.booking.gift.name).toBe('Chocolate Truffle Cake');
  });

  it('7. GET /api/v1/gift-delivery/track/:id returns live driver telemetry, milestones and OTP', async () => {
    const res = await request(app).get(`/api/v1/gift-delivery/track/${bookingNumber}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tracking.orderId).toBe(bookingNumber);
    expect(res.body.data.tracking.milestones).toBeInstanceOf(Array);
    expect(res.body.data.tracking.partner.name).toBe('Rajesh Verma');
    expect(res.body.data.tracking.partner.currentLocation).toBeDefined();
    expect(res.body.data.tracking.deliveryOtp).toBeDefined();
  });

  it('8. POST /api/v1/gift-delivery/:id/reschedule reschedules delivery date and slot', async () => {
    const res = await request(app)
      .post(`/api/v1/gift-delivery/${bookingId}/reschedule`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        scheduledDate: 'Sat, 11 May 2026',
        scheduledTimeSlot: '6:00 PM - 9:00 PM (Night)',
        deliveryInstructions: 'Call upon arrival at main gate',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.scheduledDate).toBe('Sat, 11 May 2026');
    expect(res.body.data.booking.scheduledTimeSlot).toBe('6:00 PM - 9:00 PM (Night)');
  });

  it('9. GET /api/v1/gift-delivery/:id/invoice returns official tax invoice with GST breakdown', async () => {
    const res = await request(app)
      .get(`/api/v1/gift-delivery/${bookingId}/invoice`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.invoice).toBeDefined();
    expect(res.body.data.invoice.hsnSacCode).toBe('996812');
    expect(res.body.data.invoice.taxes).toBeInstanceOf(Array);
    expect(res.body.data.invoice.grandTotal).toBeGreaterThan(0);
  });

  it('10. POST /api/v1/gift-delivery/:id/verify-otp completes delivery and marks status DELIVERED', async () => {
    const res = await request(app)
      .post(`/api/v1/gift-delivery/${bookingId}/verify-otp`)
      .send({
        otp: deliveryOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.status).toBe('DELIVERED');
  });

  it('11. POST /api/v1/gift-delivery/:id/feedback submits customer rating and review', async () => {
    const res = await request(app)
      .post(`/api/v1/gift-delivery/${bookingId}/feedback`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 5,
        reviewText: 'Beautiful cake and super fast delivery with lovely card!',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.rating).toBe(5);
  });
});
