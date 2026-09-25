import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Onboarding & Welcome Flow API Suite', () => {
  const testDeviceId = 'test-flutter-device-001';

  it('1. GET /api/v1/onboarding returns complete configuration and all 5 slides', async () => {
    const res = await request(app).get('/api/v1/onboarding');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    const data = res.body.data;

    expect(data.enabled).toBe(true);
    expect(data.totalPages).toBe(5);
    expect(data.allowSkip).toBe(true);
    expect(data.loginRoute).toBe('/auth/login');
    expect(Array.isArray(data.slides)).toBe(true);
    expect(data.slides.length).toBe(5);

    // Verify Screen 1: One Network. Every Promise. Delivered.
    const s1 = data.slides[0];
    expect(s1.step).toBe(1);
    expect(s1.title).toContain('One Network');
    expect(s1.title).toContain('Delivered');
    expect(s1.layout.backgroundColor).toBe('brandPrimary');
    expect(s1.layout.hasWave).toBe(true);
    expect(s1.layout.waveType).toBe('bottom_wave');
    expect(s1.ctaText).toBe('Get Started');
    expect(s1.assetImage).toBe('assets/images/img.png');

    // Verify Screen 2: Secure. Confidential. Delivered.
    const s2 = data.slides[1];
    expect(s2.step).toBe(2);
    expect(s2.title).toContain('Confidential');
    expect(s2.layout.backgroundColor).toBe('background');
    expect(s2.layout.waveType).toBe('yellow_wave');
    expect(s2.items.length).toBe(4);
    expect(s2.items.map((i: any) => i.title)).toContain('Safe &\nConfidential');
    expect(s2.items.map((i: any) => i.title)).toContain('Hassle-free\nReturns');
    expect(s2.items.map((i: any) => i.title)).toContain('Real-time\nTracking');
    expect(s2.items.map((i: any) => i.title)).toContain('24/7\nSupport');

    // Verify Screen 3: Personal Courier Solutions Just for You
    const s3 = data.slides[2];
    expect(s3.step).toBe(3);
    expect(s3.title).toContain('Personal');
    expect(s3.title).toContain('Courier');
    expect(s3.items.length).toBe(4);
    expect(s3.items[0].title).toBe('Safe & Secure');
    expect(s3.items[1].title).toBe('Fast Delivery');
    expect(s3.items[2].title).toBe('Real-time Tracking');
    expect(s3.items[3].title).toBe('Care & Trust');

    // Verify Screen 4: From Pickup To Delivery
    const s4 = data.slides[3];
    expect(s4.step).toBe(4);
    expect(s4.title).toContain('From Pickup');
    expect(s4.title).toContain('Covered');
    expect(s4.layout.cardType).toBe('process_steps');
    expect(s4.items.length).toBe(5);
    expect(s4.items.map((i: any) => i.title)).toEqual([
      'Pickup',
      'Process',
      'In Transit',
      'On the Way',
      'Delivered',
    ]);

    // Verify Screen 5: Forgot Something?
    const s5 = data.slides[4];
    expect(s5.step).toBe(5);
    expect(s5.title).toContain('Forgot');
    expect(s5.title).toContain('Something?');
    expect(s5.items.length).toBe(4);
    expect(s5.items[0].title).toBe('Instant Pickup');
    expect(s5.items[1].title).toBe('Secure Handling');
    expect(s5.items[2].title).toBe('Quick Delivery');
    expect(s5.items[3].title).toBe('Total Reliability');
  });

  it('2. GET /api/v1/onboarding/slides/:idOrStep fetches individual slide', async () => {
    const resStep = await request(app).get('/api/v1/onboarding/slides/1');
    expect(resStep.status).toBe(200);
    expect(resStep.body.data.slide.step).toBe(1);

    const resId = await request(app).get('/api/v1/onboarding/slides/slide-4');
    expect(resId.status).toBe(200);
    expect(resId.body.data.slide.slug).toBe('pickup-delivery');
  });

  it('3. GET /api/v1/onboarding/status returns device onboarding state', async () => {
    const res = await request(app)
      .get(`/api/v1/onboarding/status?deviceId=${testDeviceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status.hasCompleted).toBe(false);
    expect(res.body.data.status.deviceId).toBe(testDeviceId);
  });

  it('4. POST /api/v1/onboarding/track-step logs funnel progression', async () => {
    const res = await request(app)
      .post('/api/v1/onboarding/track-step')
      .send({
        deviceId: testDeviceId,
        step: 2,
        slideId: 'slide-2',
        durationMs: 3500,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.recorded).toBe(true);
    expect(res.body.data.step).toBe(2);
  });

  it('5. POST /api/v1/onboarding/skip marks device as skipped', async () => {
    const res = await request(app)
      .post('/api/v1/onboarding/skip')
      .send({
        deviceId: 'skip-device-999',
        skippedAtStep: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status.hasSkipped).toBe(true);
    expect(res.body.data.status.lastStepViewed).toBe(3);
  });

  it('6. POST /api/v1/onboarding/complete marks onboarding finished', async () => {
    const res = await request(app)
      .post('/api/v1/onboarding/complete')
      .send({
        deviceId: testDeviceId,
        totalTimeSpentSeconds: 22,
        appVersion: '1.0.0',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.status.hasCompleted).toBe(true);
    expect(res.body.data.status.completedAt).toBeDefined();

    // Verify status endpoint reflects completion
    const checkRes = await request(app)
      .get(`/api/v1/onboarding/status?deviceId=${testDeviceId}`);
    expect(checkRes.body.data.status.hasCompleted).toBe(true);
  });

  it('7. Admin endpoints: GET overview, PUT update, POST reset', async () => {
    const adminRes = await request(app).get('/api/v1/admin/onboarding');
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.config).toBeDefined();
    expect(adminRes.body.data.analytics).toBeDefined();
    expect(adminRes.body.data.analytics.totalStarts).toBeGreaterThan(0);

    // Update slide
    const updateRes = await request(app)
      .put('/api/v1/admin/onboarding/slides/slide-1')
      .send({
        subtitle: 'Updated fast and secure pan-India delivery.',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.slide.subtitle).toBe('Updated fast and secure pan-India delivery.');

    // Reset to defaults
    const resetRes = await request(app).post('/api/v1/admin/onboarding/reset');
    expect(resetRes.status).toBe(200);

    const verifyReset = await request(app).get('/api/v1/onboarding/slides/1');
    expect(verifyReset.body.data.slide.subtitle).toBe('Fast, secure and reliable\ndeliveries across India.');
  });
});
