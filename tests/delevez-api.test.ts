import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from '../src/app.js';
import { createAccessToken, verifyAccessToken } from '../src/lib/jwt.js';
import {
  createOtpChallengeId,
  createOtpCode,
  hashOtpCode,
  otpCodeMatches,
} from '../src/lib/otp.js';
import {
  getSandboxGatewayOptions,
  validateSandboxPayment,
} from '../src/lib/sandbox-payment.js';
import {
  calculateConfidentialCourierQuote,
} from '../src/modules/confidential-courier/confidential-courier-pricing.js';
import {
  validateConfidentialCourierRequest,
} from '../src/modules/confidential-courier/confidential-courier.validation.js';
import { calculateCourierQuote } from '../src/modules/personal-courier/courier-pricing.js';
import { validateCourierRequest } from '../src/modules/personal-courier/courier.validation.js';

const validCourierRequest = {
  pickup: {
    label: 'Home',
    contactName: 'Ravi Kumar',
    countryCode: '+91',
    phoneNumber: '9876543210',
    addressLine1: '12 MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
  },
  dropoff: {
    label: 'Office',
    contactName: 'Aman Shah',
    countryCode: '+91',
    phoneNumber: '9876543211',
    addressLine1: '15 Park Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400002',
    country: 'India',
  },
  serviceType: 'BIKE_PRIORITY',
  pickupSchedule: { type: 'ASAP' },
  package: {
    parcelSize: 'MEDIUM',
    actualWeightKg: 5,
    lengthCm: 30,
    widthCm: 20,
    heightCm: 15,
    needsBox: true,
    packagingType: 'EXTRA_SECURE',
    specialHandling: false,
    fragile: false,
    secureHandling: true,
    contentCategory: 'DOCUMENTS',
    contentDescription: 'Signed documents',
    declaredValue: 25000,
    insuranceType: 'FULL',
  },
  paymentMethod: 'PAY_ON_DELIVERY',
};

const validConfidentialCourierRequest = {
  pickup: {
    label: 'Office',
    contactName: 'Ravi Kumar',
    countryCode: '+91',
    phoneNumber: '9876543210',
    addressLine1: '12 MG Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'India',
  },
  dropoff: {
    label: 'Legal department',
    contactName: 'Aman Shah',
    countryCode: '+91',
    phoneNumber: '9876543211',
    addressLine1: '15 Park Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400002',
    country: 'India',
  },
  document: {
    type: 'LEGAL',
    envelopeSize: 'A4',
    pageCount: 40,
    description: 'Signed original agreement',
    containsOriginals: true,
    requiresReturn: true,
    declaredValue: 25000,
    complianceAccepted: true,
  },
  security: {
    level: 'CHAIN_OF_CUSTODY',
    handoverMethod: 'OTP_AND_SIGNATURE',
    recipientIdRequired: true,
    pickupProofRequired: true,
  },
  schedule: { type: 'ASAP' },
  deliverySpeed: 'PRIORITY',
  paymentMethod: 'PAY_ON_DELIVERY',
};

describe('Delevez API Endpoints & Core Logic', () => {
  describe('Health & System endpoints', () => {
    it('GET /api/v1/health returns process health', async () => {
      const response = await request(app).get('/api/v1/health');
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        service: 'delivery-app-backend',
      });
      expect(response.body.uptimeSeconds).toBeTypeOf('number');
    });
  });

  describe('JWT Utilities', () => {
    it('creates and verifies access tokens containing user id', () => {
      const { token, expiresIn } = createAccessToken('user-12345');
      const payload = verifyAccessToken(token);

      expect(payload.sub).toBe('user-12345');
      expect(expiresIn).toBe('7d');
      expect(payload.exp).toBeGreaterThan(payload.iat!);
    });
  });

  describe('OTP Utilities', () => {
    it('generates 6-digit OTP and verifies matching hashes', () => {
      const challengeId = createOtpChallengeId();
      const code = createOtpCode();
      expect(code).toMatch(/^\d{6}$/);

      const hash = hashOtpCode(challengeId, code);
      expect(otpCodeMatches(challengeId, code, hash)).toBe(true);
      expect(otpCodeMatches(challengeId, '000000', hash)).toBe(false);
    });
  });

  describe('Sandbox Payment Provider', () => {
    it('exposes sandbox payment methods without sensitive credentials', () => {
      const options = getSandboxGatewayOptions();
      expect(options.sandbox).toBe(true);
      expect(options.provider).toBe('DELIVEZ_SANDBOX');
      expect(options.methods.map((m) => m.id)).toEqual([
        'UPI',
        'CARD',
        'WALLET',
        'NET_BANKING',
      ]);
    });

    it('validates sandbox payment method and outcome', () => {
      expect(validateSandboxPayment({ method: 'UPI' })).toEqual({
        method: 'UPI',
        outcome: 'SUCCESS',
      });
      expect(
        validateSandboxPayment({ method: 'CARD', outcome: 'FAILURE' }),
      ).toEqual({
        method: 'CARD',
        outcome: 'FAILURE',
      });
      expect(() => validateSandboxPayment({ method: 'INVALID' })).toThrow();
      expect(() =>
        validateSandboxPayment({ method: 'UPI', outcome: 'INVALID' }),
      ).toThrow();
    });
  });

  describe('Personal Courier & Courier Delivery', () => {
    it('GET /api/v1/personal-courier/options returns available rates and options', async () => {
      const response = await request(app).get('/api/v1/personal-courier/options');
      expect(response.status).toBe(200);
      expect(response.body.data.currency).toBe('INR');
      expect(response.body.data.serviceTypes.length).toBeGreaterThanOrEqual(4);
      expect(response.body.data.sandboxGateway.sandbox).toBe(true);
    });

    it('GET /api/v1/courier-delivery/options also returns available rates and options', async () => {
      const response = await request(app).get('/api/v1/courier-delivery/options');
      expect(response.status).toBe(200);
      expect(response.body.data.currency).toBe('INR');
    });

    it('calculates personal courier quote correctly', () => {
      const validated = validateCourierRequest(validCourierRequest);
      const quote = calculateCourierQuote(validated);

      expect(quote.breakdown.baseCharge).toBe(120);
      expect(quote.breakdown.packagingCharge).toBe(49);
      expect(quote.breakdown.insurancePremium).toBe(188);
      expect(quote.chargeableWeightKg).toBe(5);
      expect(quote.totalAmount).toBe(381);
    });

    it('requires authentication for personal courier quote API', async () => {
      const response = await request(app)
        .post('/api/v1/personal-courier/quote')
        .send(validCourierRequest);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('A Bearer access token is required.');
    });
  });

  describe('Luggage Delivery & Confidential Courier', () => {
    it('GET /api/v1/luggage-delivery/options returns document types and security options', async () => {
      const response = await request(app).get(
        '/api/v1/luggage-delivery/options',
      );
      expect(response.status).toBe(200);
      expect(response.body.data.currency).toBe('INR');
      expect(response.body.data.documentTypes.length).toBe(6);
      expect(response.body.data.securityLevels.length).toBe(3);
    });

    it('GET /api/v1/confidential-courier/options also returns options', async () => {
      const response = await request(app).get(
        '/api/v1/confidential-courier/options',
      );
      expect(response.status).toBe(200);
      expect(response.body.data.currency).toBe('INR');
    });

    it('calculates confidential courier quote correctly', () => {
      const validated = validateConfidentialCourierRequest(validConfidentialCourierRequest);
      const quote = calculateConfidentialCourierQuote(validated);

      expect(quote.breakdown.baseCharge).toBe(249);
      expect(quote.breakdown.securityCharge).toBe(149);
      expect(quote.breakdown.handoverCharge).toBe(59);
      expect(quote.breakdown.originalsCharge).toBe(25);
      expect(quote.breakdown.returnCharge).toBe(186.75);
      expect(quote.totalAmount).toBe(668.75);
    });

    it('requires authentication for luggage delivery quote API', async () => {
      const response = await request(app)
        .post('/api/v1/luggage-delivery/quote')
        .send(validConfidentialCourierRequest);

      expect(response.status).toBe(401);
    });
  });

  describe('Auth check endpoint', () => {
    it('GET /api/v1/auth/check reports logged out when token is missing', async () => {
      const response = await request(app).get('/api/v1/auth/check');
      expect(response.status).toBe(200);
      expect(response.body.data.isLoggedIn).toBe(false);
      expect(response.body.data.user).toBeNull();
    });

    it('GET /api/v1/auth/check reports logged out when token is invalid', async () => {
      const response = await request(app)
        .get('/api/v1/auth/check')
        .set('Authorization', 'Bearer invalid-token');
      expect(response.status).toBe(200);
      expect(response.body.data.isLoggedIn).toBe(false);
      expect(response.body.data.user).toBeNull();
    });
  });

  describe('Administrator Authentication', () => {
    it('allows admin to log in via phone and password', async () => {
      const response = await request(app)
        .post('/api/v1/admin/login')
        .send({
          countryCode: '+91',
          mobileNumber: '9999999999',
          password: 'Admin@123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('ADMIN');
      expect(response.body.data.accessToken).toBeTypeOf('string');
    });

    it('allows admin to log in via email and password', async () => {
      const response = await request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'admin@delevez.com',
          password: 'Admin@123456',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('ADMIN');
      expect(response.body.data.accessToken).toBeTypeOf('string');
    });

    it('rejects invalid admin password', async () => {
      const response = await request(app)
        .post('/api/v1/admin/login')
        .send({
          email: 'admin@delevez.com',
          password: 'WrongPassword99',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid administrator credentials.');
    });

    it('fetches admin profile using access token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/admin/login')
        .send({
          email: 'admin@delevez.com',
          password: 'Admin@123456',
        });

      const token = loginRes.body.data.accessToken;

      const profileRes = await request(app)
        .get('/api/v1/admin/me')
        .set('Authorization', `Bearer ${token}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.data.user.role).toBe('ADMIN');
      expect(profileRes.body.data.user.email).toBe('admin@delevez.com');
    });
  });

  describe('Admin Service Image Management', () => {
    it('uploads an image to a service, serves it, and deletes it', async () => {
      const loginRes = await request(app)
        .post('/api/v1/admin/login')
        .send({
          email: 'admin@delevez.com',
          password: 'Admin@123456',
        });
      const token = loginRes.body.data.accessToken;

      // Get first service
      const servicesRes = await request(app)
        .get('/api/v1/admin/services')
        .set('Authorization', `Bearer ${token}`);
      expect(servicesRes.status).toBe(200);
      const service = servicesRes.body.data.services[0];
      expect(service).toBeDefined();

      // Upload a valid 1x1 PNG image
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const uploadRes = await request(app)
        .patch(`/api/v1/admin/services/${service.id}`)
        .set('Authorization', `Bearer ${token}`)
        .attach('image', pngBuffer, 'test-service-image.png');

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.body.data.service.hasImage).toBe(true);
      expect(uploadRes.body.data.service.imageUrl).toContain(service.slug);

      // Verify the image is served publicly
      const imageRes = await request(app).get(`/api/v1/services/${service.slug}/image`);
      expect(imageRes.status).toBe(200);
      expect(imageRes.headers['content-type']).toBe('image/png');

      // Delete the image
      const deleteRes = await request(app)
        .delete(`/api/v1/admin/services/${service.id}/image`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.service.hasImage).toBe(false);
      expect(deleteRes.body.data.service.imageUrl).toBeNull();
    });
  });
});

