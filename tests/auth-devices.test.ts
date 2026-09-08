import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({
  user: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  authOtp: { create: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  userDevice: { upsert: vi.fn(), findMany: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock('../src/lib/prisma.js', () => ({ prisma: db }));
import { app } from '../src/app.js';
import { hashOtpCode } from '../src/lib/otp.js';
import { createAccessToken } from '../src/lib/jwt.js';
const user = { id: 'user-1', role: 'USER', countryCode: '+91', mobileNumber: '9876543210' };
const challengeId = '22222222-2222-4222-8222-222222222222';
describe('Passwordless authentication and devices', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    db.$transaction.mockImplementation(async (op) => typeof op === 'function' ? op(db) : Promise.all(op));
    db.user.findUnique.mockResolvedValue(user);
    db.user.create.mockResolvedValue(user);
    db.user.update.mockResolvedValue(user);
    db.authOtp.updateMany.mockResolvedValue({ count: 1 });
    db.authOtp.findUnique.mockResolvedValue({ id: challengeId, userId: user.id, purpose: 'LOGIN', deviceId: null, codeHash: hashOtpCode(challengeId, '123456'), rememberMe: false, attempts: 0, expiresAt: new Date(Date.now() + 300000), consumedAt: null, user });
  });
  it('registers without password', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ fullName: 'Test User', mobileNumber: user.mobileNumber, acceptedTerms: true });
    expect(res.status).toBe(201);
    expect(res.body.data.registrationComplete).toBe(false);
    expect(res.body.data.accessToken).toBeUndefined();
    expect(db.user.create.mock.calls[0]![0].data).not.toHaveProperty('passwordHash');
  });
  it('requests OTP using only mobile number', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ mobileNumber: user.mobileNumber });
    expect(res.status).toBe(200);
    expect(res.body.data.challengeId).toBeTypeOf('string');
    expect(db.userDevice.upsert).not.toHaveBeenCalled();
  });
  it.each([{ password: 'Password123' }, { confirmPassword: '' }])('rejects registration password fields %j', async fields => {
    const res = await request(app).post('/api/v1/auth/register').send({ fullName: 'Test User', mobileNumber: user.mobileNumber, acceptedTerms: true, ...fields });
    expect(res.status).toBe(400);
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('completes registration only after correct OTP', async () => {
    const challenge = await db.authOtp.findUnique();
    db.authOtp.findUnique.mockResolvedValue({ ...challenge, purpose: 'REGISTER' });
    const wrong = await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '000000' });
    expect(wrong.status).toBe(400);
    expect(db.user.update).not.toHaveBeenCalled();
    const correct = await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '123456' });
    expect(correct.status).toBe(200);
    expect(correct.body.data.registrationComplete).toBe(true);
    expect(correct.body.message).toBe('Registration successful. OTP verified.');
    expect(db.user.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ mobileVerifiedAt: expect.any(Date) }) }));
  });
  it('verifies OTP without a device', async () => {
    const res = await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '123456' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTypeOf('string');
    expect(db.userDevice.upsert).not.toHaveBeenCalled();
  });
  it('saves an optional device after verification', async () => {
    const res = await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '123456', deviceId: 'android-001' });
    expect(res.status).toBe(200);
    expect(db.userDevice.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId_deviceId: { userId: user.id, deviceId: 'android-001' } } }));
  });
  it('does not save a device for wrong or consumed OTP', async () => {
    expect((await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '000000', deviceId: 'android-001' })).status).toBe(400);
    db.authOtp.updateMany.mockResolvedValue({ count: 0 });
    expect((await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '123456', deviceId: 'android-001' })).status).toBe(400);
    expect(db.userDevice.upsert).not.toHaveBeenCalled();
  });
  it.each(['', {}, 'x'.repeat(256)])('rejects invalid optional device %j', async deviceId => {
    expect((await request(app).post('/api/v1/auth/verify-otp').send({ challengeId, otp: '123456', deviceId })).status).toBe(400);
    expect(db.userDevice.upsert).not.toHaveBeenCalled();
  });
  it('requires authentication and scopes device listing to current user', async () => {
    expect((await request(app).get('/api/v1/auth/devices')).status).toBe(401);
    db.userDevice.findMany.mockResolvedValue([]);
    expect((await request(app).get('/api/v1/auth/devices').auth(createAccessToken(user.id).token, { type: 'bearer' })).status).toBe(200);
    expect(db.userDevice.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: user.id } }));
  });
  it('rejects password login for passwordless accounts', async () => {
    db.user.findFirst.mockResolvedValue({ ...user, passwordHash: null });
    expect((await request(app).post('/api/v1/auth/login').send({ mobileNumber: user.mobileNumber, password: 'anything' })).status).toBe(401);
  });
});
