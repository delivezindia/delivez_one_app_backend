import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../src/app.js';
import { createAccessToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/prisma.js';
import { calculateForgotSomethingQuote } from '../src/modules/forgot-something/forgot-something-pricing.js';

describe('Forgot Something (Delivez Fetch) Module', () => {
  let testUser: any;
  let userToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test Forgot User',
        countryCode: '+91',
        mobileNumber: `987${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: `forgot_${randomUUID().slice(0, 8)}@example.com`,
        passwordHash: 'dummy-hashed-password',
        role: 'USER',
      },
    });

    userToken = createAccessToken(testUser.id).token;
  });

  afterAll(async () => {
    if (testUser?.id) {
      await prisma.forgotSomethingBooking.deleteMany({ where: { userId: testUser.id } });
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  const validForgotBookingPayload = {
    itemCategory: 'BAG',
    itemName: 'Black Laptop Bag',
    itemDescription: 'Left behind in cab on the way',
    itemBrandColor: 'Safari / Black',
    itemQuantity: 1,
    declaredValue: 2500,
    itemTags: ['Fragile', 'High Value', 'Urgent'],
    locationType: 'HOTEL',
    handoverType: 'RECEPTION',
    pickup: {
      flatBuilding: 'Flat 402, Lotus Towers',
      street: 'Outer Ring Road',
      area: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      contactName: 'Front Desk Reception',
      phoneNumber: '9876543210',
      landmark: 'Near EcoSpace',
    },
    dropoff: {
      addressType: 'Home',
      addressLine1: '123, MG Road, Bengaluru',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      recipientName: 'Rahul Sharma',
      phoneNumber: '9876548421',
      landmark: 'Opposite Metro Station',
    },
    speed: 'INSTANT',
    scheduledDate: '2026-08-27',
    scheduledTimeSlot: 'ASAP',
    pickupOtpRequired: true,
    deliveryOtpRequired: true,
    photoAtPickup: false,
    photoAtDelivery: true,
    tamperProofPackaging: true,
    receiverSignature: false,
    callBeforeArrival: false,
    paymentMethod: 'PAY_ON_DELIVERY',
  };

  it('calculates accurate pricing quotes', () => {
    const quote = calculateForgotSomethingQuote({
      speed: 'INSTANT',
      tamperProofPackaging: true,
    });

    expect(quote.currency).toBe('INR');
    expect(quote.retrievalFee).toBe(149);
    expect(quote.deliveryFee).toBe(129);
    expect(quote.secureHandlingFee).toBe(39);
    expect(quote.totalAmount).toBeGreaterThan(300);
  });

  it('serves discovery options at GET /api/v1/forgot-something/options', async () => {
    const response = await request(app).get('/api/v1/forgot-something/options');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.itemCategories).toBeDefined();
    expect(response.body.data.locationTypes).toBeDefined();
    expect(response.body.data.handoverOptions).toBeDefined();
    expect(response.body.data.speedOptions).toBeDefined();
  });

  it('calculates quote via POST /api/v1/forgot-something/quote', async () => {
    const response = await request(app)
      .post('/api/v1/forgot-something/quote')
      .send({ speed: 'EXPRESS', tamperProofPackaging: false });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.quote.retrievalFee).toBe(119);
    expect(response.body.data.quote.secureHandlingFee).toBe(0);
  });

  it('creates a new Forgot Something retrieval booking with idempotency and OTP verification', async () => {
    const idempotencyKey = `idemp-${randomUUID()}`;

    const response = await request(app)
      .post('/api/v1/forgot-something/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(validForgotBookingPayload);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.booking.bookingNumber).toMatch(/^DZ\d{8}$/);
    expect(response.body.data.booking.status).toBe('CONFIRMED');
    expect(response.body.data.booking.pickupOtp).toBeDefined();
    expect(response.body.data.booking.deliveryOtp).toBeDefined();

    const bookingId = response.body.data.booking.id;
    const bookingNumber = response.body.data.booking.bookingNumber;
    const pickupOtp = response.body.data.booking.pickupOtp;
    const deliveryOtp = response.body.data.booking.deliveryOtp;

    // Test Idempotent Replay
    const replayResponse = await request(app)
      .post('/api/v1/forgot-something/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(validForgotBookingPayload);

    expect(replayResponse.status).toBe(200);
    expect(replayResponse.body.data.idempotentReplay).toBe(true);
    expect(replayResponse.body.data.booking.id).toBe(bookingId);

    // Test GET /api/v1/forgot-something/bookings
    const listResponse = await request(app)
      .get('/api/v1/forgot-something/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.bookings.length).toBeGreaterThanOrEqual(1);

    // Test GET /api/v1/forgot-something/bookings/:id
    const getResponse = await request(app)
      .get(`/api/v1/forgot-something/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.booking.itemName).toBe('Black Laptop Bag');

    // Test GET /api/v1/forgot-something/track/:identifier
    const trackResponse = await request(app).get(`/api/v1/forgot-something/track/${bookingNumber}`);
    expect(trackResponse.status).toBe(200);
    expect(trackResponse.body.data.tracking.bookingId).toBe(bookingNumber);
    expect(trackResponse.body.data.tracking.milestones).toHaveLength(5);

    // Test Pickup OTP Verification
    const pickupOtpRes = await request(app)
      .post(`/api/v1/forgot-something/bookings/${bookingId}/verify-otp`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'PICKUP', otp: pickupOtp });

    expect(pickupOtpRes.status).toBe(200);
    expect(pickupOtpRes.body.data.booking.status).toBe('PICKED_UP');

    // Test Delivery OTP Verification
    const deliveryOtpRes = await request(app)
      .post(`/api/v1/forgot-something/bookings/${bookingId}/verify-otp`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ type: 'DELIVERY', otp: deliveryOtp });

    expect(deliveryOtpRes.status).toBe(200);
    expect(deliveryOtpRes.body.data.booking.status).toBe('DELIVERED');
  });

  it('supports cancellation when booking is in valid initial status', async () => {
    const idempotencyKey = `idemp-${randomUUID()}`;

    const createRes = await request(app)
      .post('/api/v1/forgot-something/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        ...validForgotBookingPayload,
        itemName: 'House Keys',
        itemCategory: 'KEYS',
      });

    expect(createRes.status).toBe(201);
    const bookingId = createRes.body.data.booking.id;

    const cancelRes = await request(app)
      .post(`/api/v1/forgot-something/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'Found my keys in my backpack.' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.booking.status).toBe('CANCELLED');
    expect(cancelRes.body.data.booking.cancellationReason).toBe('Found my keys in my backpack.');
  });
});
