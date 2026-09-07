import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { createAccessToken } from '../src/lib/jwt.js';
import { prisma } from '../src/lib/prisma.js';

describe('Return Pickup Module (DELIVEZ BACK)', () => {
  let testUser: any;
  let userToken: string;
  let bookingId: string;
  let bookingNumber: string;
  let pickupOtp: string;
  let uploadedDocId: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        fullName: 'Test Return User',
        countryCode: '+91',
        mobileNumber: `976${Math.floor(1000000 + Math.random() * 9000000)}`,
        email: `return_${randomUUID().slice(0, 8)}@example.com`,
        passwordHash: 'dummy-hashed-password',
        role: 'USER',
      },
    });

    userToken = createAccessToken(testUser.id).token;
  });

  afterAll(async () => {
    if (testUser?.id) {
      try {
        await prisma.returnPickupBooking.deleteMany({ where: { userId: testUser.id } });
        await prisma.giftDeliveryBooking.deleteMany({ where: { userId: testUser.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
      } catch {
        // Ignore foreign key teardown conflicts during parallel tests
      }
    }
  });

  it('1. GET /api/v1/return-pickup/options returns full configuration, coupons and upload limits', async () => {
    const res = await request(app).get('/api/v1/return-pickup/options');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.returnTypes).toBeInstanceOf(Array);
    expect(res.body.data.destinationTypes).toBeInstanceOf(Array);
    expect(res.body.data.recentStores).toBeInstanceOf(Array);
    expect(res.body.data.deliveryServices).toBeInstanceOf(Array);
    expect(res.body.data.pickupTimeSlots).toBeInstanceOf(Array);
    expect(res.body.data.documentTypes).toBeInstanceOf(Array);
    expect(res.body.data.coupons).toBeInstanceOf(Array);
    expect(res.body.data.uploadLimits).toBeDefined();
  });

  it('2. POST /api/v1/return-pickup/quote calculates accurate fare breakdown with coupon and breakdown itemization', async () => {
    const res = await request(app).post('/api/v1/return-pickup/quote').send({
      deliveryService: 'STANDARD',
      shipmentProtection: true,
      couponCode: 'DELIVEZ10',
      itemQuantity: 2,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.quote).toBeDefined();
    expect(res.body.data.quote.basePickupCharge).toBe(49);
    expect(res.body.data.quote.deliveryServiceCharge).toBe(89);
    expect(res.body.data.quote.protectionCharge).toBe(19);
    expect(res.body.data.quote.discountAmount).toBeGreaterThan(0);
    expect(res.body.data.quote.totalAmount).toBeGreaterThan(0);
    expect(res.body.data.quote.breakdown).toBeInstanceOf(Array);
    expect(res.body.data.quote.breakdown.length).toBeGreaterThanOrEqual(4);
  });

  it('3. POST /api/v1/return-pickup/upload uploads a return document and returns URL', async () => {
    const samplePdf = Buffer.from('%PDF-1.4 sample content for return invoice document');

    const res = await request(app)
      .post('/api/v1/return-pickup/upload')
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', samplePdf, 'invoice_receipt.pdf')
      .field('documentType', 'INVOICE_ORDER_PROOF')
      .field('title', 'Amazon Order Invoice');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.document).toBeDefined();
    expect(res.body.data.document.id).toMatch(/^doc_/);
    expect(res.body.data.document.fileName).toBe('invoice_receipt.pdf');
    expect(res.body.data.document.mimeType).toBe('application/pdf');
    expect(res.body.data.document.fileUrl).toContain('/api/v1/return-pickup/documents/doc_');

    uploadedDocId = res.body.data.document.id;
  });

  it('4. GET /api/v1/return-pickup/documents/:docId serves the uploaded file binary with caching', async () => {
    const res = await request(app).get(`/api/v1/return-pickup/documents/${uploadedDocId}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('invoice_receipt.pdf');
    expect(res.body).toBeDefined();
  });

  it('5. POST /api/v1/return-pickup creates a return pickup booking with attached documents', async () => {
    const idempotencyKey = `ret-test-${Date.now()}-${Math.random()}`;

    const res = await request(app)
      .post('/api/v1/return-pickup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        returnType: 'RETURN_ITEM',
        destinationType: 'ONLINE_STORE',
        destinationName: 'Amazon India',
        orderId: 'ORD-928451',
        returnId: 'RET-627189',
        returnBeforeDate: '16 Aug 2026',
        estimatedRefundAmount: 4999,

        pickupStoreName: 'ABC Retail Electronics',
        pickupAddress: 'No. 24, 5th Cross, Indiranagar',
        pickupCity: 'Bengaluru',
        pickupState: 'Karnataka',
        pickupPostalCode: '560038',
        pickupContactName: 'Ravi Kumar',
        pickupPhoneNumber: '9876543210',
        pickupReferenceNumber: 'JOB-9921',
        pickupInstructions: 'Collect from front desk',
        pickupLatitude: 12.9716,
        pickupLongitude: 77.5946,

        returnAddressType: 'My Home',
        returnAddress: '123, 4th Cross, Koramangala',
        returnCity: 'Bengaluru',
        returnState: 'Karnataka',
        returnPostalCode: '560034',
        returnContactName: 'Suresh Kumar',
        returnPhoneNumber: '9876512345',
        returnLandmark: 'Near Forum Mall',
        returnInstructions: 'Handover at security',
        returnLatitude: 12.9352,
        returnLongitude: 77.6245,

        itemCategory: 'ELECTRONICS',
        itemDescription: 'Sony Wireless Headphones (Black)',
        itemQuantity: 1,
        declaredValue: 2499,
        approxWeightKg: 0.5,
        itemCondition: 'NEW_UNUSED',
        specialHandlingTags: ['Fragile', 'High Value Item'],
        documents: [
          {
            id: uploadedDocId,
            documentType: 'INVOICE_ORDER_PROOF',
            fileName: 'invoice_receipt.pdf',
            mimeType: 'application/pdf',
          },
        ],

        scheduledDate: '2026-08-28',
        scheduledTimeSlot: '11:00 AM - 1:00 PM',
        deliveryService: 'STANDARD',
        shipmentProtection: true,
        couponCode: 'DELIVEZ10',
        paymentMethod: 'WALLET',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking).toBeDefined();
    expect(res.body.data.booking.bookingNumber).toMatch(/^DRVZ-RET-/);
    expect(res.body.data.booking.status).toBe('CONFIRMED');
    expect(res.body.data.booking.paymentStatus).toBe('PAID');
    expect(res.body.data.booking.documents).toBeInstanceOf(Array);
    expect(res.body.data.booking.documents.length).toBeGreaterThan(0);

    bookingId = res.body.data.booking.id;
    bookingNumber = res.body.data.booking.bookingNumber;
    pickupOtp = res.body.data.booking.pickupOtp;
  });

  it('6. POST /api/v1/return-pickup replays idempotently on identical request', async () => {
    const idempotencyKey = `ret-replay-${Date.now()}`;
    const payload = {
      returnType: 'EXCHANGE_ITEM',
      destinationType: 'LOCAL_STORE',
      pickupStoreName: 'Zara Outlet',
      pickupAddress: 'Indiranagar 100ft road',
      pickupCity: 'Bengaluru',
      pickupPostalCode: '560038',
      pickupContactName: 'Manager',
      pickupPhoneNumber: '9876500000',
      returnAddress: 'Flat 101, Indiranagar',
      returnCity: 'Bengaluru',
      returnPostalCode: '560038',
      returnContactName: 'Customer',
      returnPhoneNumber: '9876511111',
      itemCategory: 'CLOTHING_APPAREL',
      itemDescription: 'Jacket Size L',
      paymentMethod: 'WALLET',
    };

    const first = await request(app)
      .post('/api/v1/return-pickup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(first.status).toBe(201);
    expect(first.body.data.idempotentReplay).toBe(false);

    const second = await request(app)
      .post('/api/v1/return-pickup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(second.status).toBe(200);
    expect(second.body.data.idempotentReplay).toBe(true);
    expect(second.body.data.booking.id).toBe(first.body.data.booking.id);
  });

  it('7. POST /api/v1/return-pickup/:id/documents adds a document to an existing booking', async () => {
    const samplePng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);

    const res = await request(app)
      .post(`/api/v1/return-pickup/${bookingId}/documents`)
      .set('Authorization', `Bearer ${userToken}`)
      .attach('file', samplePng, 'return_barcode.png')
      .field('documentType', 'QR_BARCODE')
      .field('title', 'Return Authorization Barcode');

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.documents).toBeInstanceOf(Array);
    expect(res.body.data.documents.length).toBeGreaterThanOrEqual(2);
  });

  it('8. GET /api/v1/return-pickup/:id/documents lists documents on booking', async () => {
    const res = await request(app)
      .get(`/api/v1/return-pickup/${bookingId}/documents`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.documents).toBeInstanceOf(Array);
    expect(res.body.data.total).toBeGreaterThanOrEqual(2);
  });

  it('9. POST /api/v1/return-pickup/:id/reschedule updates scheduled slot', async () => {
    const res = await request(app)
      .post(`/api/v1/return-pickup/${bookingId}/reschedule`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        scheduledDate: '2026-08-30',
        scheduledTimeSlot: '3:00 PM - 5:00 PM',
        pickupInstructions: 'Leave package with building concierge',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.scheduledDate).toBe('2026-08-30');
    expect(res.body.data.booking.scheduledTimeSlot).toBe('3:00 PM - 5:00 PM');
  });

  it('10. GET /api/v1/return-pickup/:id/invoice returns structured tax invoice', async () => {
    const res = await request(app)
      .get(`/api/v1/return-pickup/${bookingId}/invoice`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.invoice).toBeDefined();
    expect(res.body.data.invoice.hsnSacCode).toBe('996812');
    expect(res.body.data.invoice.invoiceNumber).toContain('INV-RET-');
    expect(res.body.data.invoice.taxes).toBeInstanceOf(Array);
    expect(res.body.data.invoice.grandTotal).toBeGreaterThan(0);
  });

  it('11. GET /api/v1/return-pickup lists user return requests', async () => {
    const res = await request(app)
      .get('/api/v1/return-pickup')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.bookings).toBeInstanceOf(Array);
    expect(res.body.data.bookings.length).toBeGreaterThan(0);
  });

  it('12. GET /api/v1/return-pickup/:id fetches return booking details', async () => {
    const res = await request(app)
      .get(`/api/v1/return-pickup/${bookingId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.id).toBe(bookingId);
    expect(res.body.data.booking.pickup.storeName).toBe('ABC Retail Electronics');
    expect(res.body.data.booking.documents).toBeInstanceOf(Array);
  });

  it('13. GET /api/v1/return-pickup/track/:id returns live telemetry and partner coordinates', async () => {
    const res = await request(app).get(`/api/v1/return-pickup/track/${bookingNumber}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.tracking.bookingId).toBe(bookingNumber);
    expect(res.body.data.tracking.milestones).toBeInstanceOf(Array);
    expect(res.body.data.tracking.partner.name).toBe('Ravi Kumar');
    expect(res.body.data.tracking.partner.currentLocation).toBeDefined();
  });

  it('14. POST /api/v1/return-pickup/:id/verify-otp verifies pickup OTP and advances status', async () => {
    const res = await request(app).post(`/api/v1/return-pickup/${bookingId}/verify-otp`).send({
      type: 'PICKUP',
      otp: pickupOtp,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.status).toBe('PICKED_UP');
  });

  it('15. POST /api/v1/return-pickup/:id/feedback submits user review', async () => {
    const res = await request(app)
      .post(`/api/v1/return-pickup/${bookingId}/feedback`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 5,
        reviewText: 'Excellent, prompt return pickup service!',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.booking.rating).toBe(5);
  });
});
