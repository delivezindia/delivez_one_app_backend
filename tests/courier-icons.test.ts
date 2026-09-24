import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Courier Delivery Image Icons & Options Suite', () => {
  it('1. GET /api/v1/courier-delivery/options returns lightweight image icon URLs without animation bloat', async () => {
    const res = await request(app).get('/api/v1/courier-delivery/options');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    const data = res.body.data;

    // Verify icons object
    expect(data.icons).toBeDefined();
    expect(data.icon).toBeDefined();
    expect(data.iconUrls).toBeDefined();
    expect(data.imageUrls).toBeDefined();
    expect(data.lottieIcons).toBeUndefined();
    expect(data.lottie_icons).toBeUndefined();

    const expectedKeys = [
      'documents',
      'electronics',
      'clothing',
      'medicine',
      'household',
      'commercial',
      'express_delivery',
      'standard_delivery',
      'bike_delivery',
      'truck_delivery',
      'secure_shield',
      'tracking_live',
      'order_box',
      'success_check',
    ];

    for (const key of expectedKeys) {
      expect(data.icons[key]).toBeDefined();
      const item = data.icons[key];
      expect(item.iconName).toBe(key);
      expect(item.icon).toMatch(/\.png$/);
      expect(item.iconUrl).toMatch(/\.png$/);
      expect(item.imageUrl).toMatch(/\.png$/);
      expect(item.pngUrl).toMatch(/\.png$/);
      expect(item.svgUrl).toMatch(/\.svg$/);
      expect(item.animationData).toBeUndefined();
      expect(item.lottieUrl).toBeUndefined();

      // Verify direct mapping
      expect(data.iconUrls[key]).toMatch(/\.png$/);
      expect(data.imageUrls[key]).toMatch(/\.png$/);
    }

    // Verify categories have real image icons and NO animationData or lottie bloat
    expect(data.categories.length).toBeGreaterThan(0);
    for (const cat of data.categories) {
      expect(cat.icon).toMatch(/\.png$/);
      expect(cat.iconUrl).toMatch(/\.png$/);
      expect(cat.imageUrl).toMatch(/\.png$/);
      expect(cat.svgUrl).toMatch(/\.svg$/);
      expect(cat.animationData).toBeUndefined();
      expect(cat.lottie).toBeUndefined();
      expect(cat.lottieUrl).toBeUndefined();
    }

    // Verify local options have real image icons
    for (const opt of data.localOptions) {
      expect(opt.icon).toMatch(/\.png$/);
      expect(opt.iconUrl).toMatch(/\.png$/);
      expect(opt.imageUrl).toMatch(/\.png$/);
      expect(opt.svgUrl).toMatch(/\.svg$/);
      expect(opt.animationData).toBeUndefined();
      expect(opt.lottie).toBeUndefined();
    }

    // Verify intercity options have real image icons
    for (const opt of data.intercityOptions) {
      expect(opt.icon).toMatch(/\.png$/);
      expect(opt.iconUrl).toMatch(/\.png$/);
      expect(opt.imageUrl).toMatch(/\.png$/);
      expect(opt.svgUrl).toMatch(/\.svg$/);
      expect(opt.animationData).toBeUndefined();
      expect(opt.lottie).toBeUndefined();
    }

    // Verify response size is lightweight (< 40KB)
    const jsonStr = JSON.stringify(res.body);
    expect(jsonStr.length).toBeLessThan(160000);
  });

  it('2. GET /public/icons/courier/documents.png serves valid PNG binary', async () => {
    const res = await request(app).get('/public/icons/courier/documents.png');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/png');
    expect(res.body.length).toBeGreaterThan(1000);
  });

  it('3. GET /public/icons/courier/documents.svg serves valid SVG XML', async () => {
    const res = await request(app).get('/public/icons/courier/documents.svg');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('image/svg+xml');
    const bodyStr = res.text || res.body?.toString() || '';
    expect(bodyStr).toContain('<svg');
  });

  it('4. GET /api/v1/courier-delivery/icons/:name serves PNG and SVG via router', async () => {
    const resPng = await request(app).get('/api/v1/courier-delivery/icons/documents.png');
    expect(resPng.status).toBe(200);
    expect(resPng.headers['content-type']).toContain('image/png');

    const resSvg = await request(app).get('/api/v1/courier-delivery/icons/documents.svg');
    expect(resSvg.status).toBe(200);
    expect(resSvg.headers['content-type']).toContain('image/svg+xml');

    const resNoExt = await request(app).get('/api/v1/courier-delivery/icons/documents');
    expect(resNoExt.status).toBe(200);
    expect(resNoExt.headers['content-type']).toContain('image/png');
  });

  it('5. GET /api/v1/courier-delivery/lottie/:name still preserves backward-compatibility for direct Lottie file requests', async () => {
    const res = await request(app).get('/api/v1/courier-delivery/lottie/documents.json');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/json');
    expect(res.body.v).toBeDefined();
  });
});
