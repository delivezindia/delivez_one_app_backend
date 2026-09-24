import fs from 'node:fs';
import path from 'node:path';
import type { Request, RequestHandler } from 'express';
import { env } from '../../config/env.js';

export interface CourierIconMeta {
  iconName: string;
  name?: string;
  title: string;
  icon: string;
  iconUrl: string;
  icon_url: string;
  imageUrl: string;
  image_url: string;
  image: string;
  pngUrl: string;
  png_url: string;
  svgUrl: string;
  svg_url: string;
  cdnUrl: string;
}

export type LottieIconMeta = CourierIconMeta;

export const COURIER_ICON_KEYS = [
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
  'self_pickup',
  'self_drop',
] as const;

export const COURIER_ICON_TITLES: Record<string, string> = {
  documents: 'Documents & Certificates',
  electronics: 'Electronics & Gadgets',
  clothing: 'Clothing & Apparel',
  medicine: 'Health & Medicine',
  household: 'Household Items',
  commercial: 'Commercial Goods',
  express_delivery: 'Express Delivery',
  standard_delivery: 'Standard Delivery',
  bike_delivery: 'Bike Priority Delivery',
  truck_delivery: 'Same Day Van Delivery',
  secure_shield: 'Package Shield & Insurance',
  tracking_live: 'Live GPS Tracking',
  order_box: 'Standard Parcel Box',
  success_check: 'Delivery Success Confirmation',
  self_pickup: 'Self Pickup at Nearest Hub',
  self_drop: 'Self Drop at Destination Hub',
};

function getBaseApiUrl(req?: Request): string {
  if (req) {
    const host = req.get('host') || 'localhost:4000';
    return `${req.protocol}://${host}/api/v1`;
  }
  return env.PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
}

function getBaseOrigin(req?: Request): string {
  if (req) {
    const host = req.get('host') || 'localhost:4000';
    return `${req.protocol}://${host}`;
  }
  const apiBase = env.PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1';
  return apiBase.replace(/\/api\/v1\/?$/, '');
}

export function buildIconMeta(iconName: string, title?: string, req?: Request): CourierIconMeta {
  const origin = getBaseOrigin(req);
  const cleanName = iconName.toLowerCase().replace(/\.(json|png|svg|webp)$/, '');
  const displayTitle = title || COURIER_ICON_TITLES[cleanName] || cleanName;

  const pngUrl = `${origin}/public/icons/courier/${cleanName}.png`;
  const svgUrl = `${origin}/public/icons/courier/${cleanName}.svg`;

  return {
    iconName: cleanName,
    name: cleanName,
    title: displayTitle,
    icon: pngUrl,
    iconUrl: pngUrl,
    icon_url: pngUrl,
    imageUrl: pngUrl,
    image_url: pngUrl,
    image: pngUrl,
    pngUrl,
    png_url: pngUrl,
    svgUrl,
    svg_url: svgUrl,
    cdnUrl: pngUrl,
  };
}

export const buildLottieMeta = buildIconMeta;

export function getAllCourierIcons(req?: Request): Record<string, CourierIconMeta> {
  const result: Record<string, CourierIconMeta> = {};
  for (const key of COURIER_ICON_KEYS) {
    result[key] = buildIconMeta(key, COURIER_ICON_TITLES[key], req);
  }
  return result;
}

export const getAllLottieIcons = getAllCourierIcons;

export const getCourierIconHandler: RequestHandler = (req, res) => {
  const rawParam = typeof req.params.iconName === 'string' ? req.params.iconName : '';
  const isSvg = rawParam.toLowerCase().endsWith('.svg');
  const cleanKey = rawParam.toLowerCase().replace(/\.(png|svg|json|webp)$/, '');

  const ext = isSvg ? 'svg' : 'png';
  const filePath = path.resolve(process.cwd(), `public/icons/courier/${cleanKey}.${ext}`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.sendFile(filePath);
    return;
  }

  // Fallback to order_box
  const fallbackPath = path.resolve(process.cwd(), `public/icons/courier/order_box.${ext}`);
  if (fs.existsSync(fallbackPath)) {
    res.setHeader('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.sendFile(fallbackPath);
    return;
  }

  res.status(404).json({
    status: 'fail',
    message: `Icon '${rawParam}' not found. Available icons: ${COURIER_ICON_KEYS.join(', ')}`,
  });
};

export const getLottieIconHandler: RequestHandler = (req, res) => {
  const rawParam = typeof req.params.iconName === 'string' ? req.params.iconName : '';
  const cleanKey = rawParam.toLowerCase().replace(/\.json$/, '');
  const filePath = path.resolve(process.cwd(), `public/lottie/${cleanKey}.json`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.sendFile(filePath);
    return;
  }

  res.status(404).json({
    status: 'fail',
    message: `Lottie animation icon '${cleanKey}' not found. Available icons: ${COURIER_ICON_KEYS.join(', ')}`,
  });
};
