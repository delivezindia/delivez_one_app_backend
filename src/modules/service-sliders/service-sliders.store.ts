import fs from 'fs';
import path from 'path';
import type { ServiceImageSlider, ServiceSlug, UpdateServiceImageSliderInput } from './service-sliders.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data/service-sliders');
const STORE_FILE = path.join(DATA_DIR, 'service-image-sliders.json');
const IMAGES_DIR = path.join(DATA_DIR, 'images');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const INITIAL_SERVICE_SLIDERS: Record<ServiceSlug, ServiceImageSlider> = {
  'courier-delivery': {
    serviceSlug: 'courier-delivery',
    serviceName: 'Courier Delivery',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  'luggage-delivery': {
    serviceSlug: 'luggage-delivery',
    serviceName: 'Luggage Delivery',
    images: [
      'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  'confidential-delivery': {
    serviceSlug: 'confidential-delivery',
    serviceName: 'Confidential Delivery',
    images: [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  'forgot-something': {
    serviceSlug: 'forgot-something',
    serviceName: 'Forgot Something',
    images: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  'return-pickup': {
    serviceSlug: 'return-pickup',
    serviceName: 'Return Pickup',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&auto=format&fit=crop&q=80'
    ],
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
};

let cachedSliders: Record<string, ServiceImageSlider> = { ...INITIAL_SERVICE_SLIDERS };

function loadStore(): Record<string, ServiceImageSlider> {
  if (cachedSliders !== null) return cachedSliders;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        cachedSliders = { ...INITIAL_SERVICE_SLIDERS, ...parsed };
        return cachedSliders;
      }
    }
  } catch (err) {
    console.error('[ServiceSlidersStore] Failed to read service-image-sliders.json', err);
  }

  cachedSliders = { ...INITIAL_SERVICE_SLIDERS };
  saveStore(cachedSliders);
  return cachedSliders;
}

function saveStore(sliders: Record<string, ServiceImageSlider>): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(sliders, null, 2), 'utf8');
    cachedSliders = sliders;
  } catch (err) {
    console.error('[ServiceSlidersStore] Failed to save service-image-sliders.json', err);
  }
}

export function getAllServiceSliders(): ServiceImageSlider[] {
  const store = loadStore();
  return Object.values(store);
}

export function getServiceSliderBySlug(slug: string): ServiceImageSlider | null {
  const store = loadStore();
  return store[slug] || null;
}

export function updateServiceSlider(slug: string, input: UpdateServiceImageSliderInput): ServiceImageSlider | null {
  const store = loadStore();
  if (!store[slug]) return null;

  const existing = store[slug];
  const updatedImages = input.images !== undefined
    ? (Array.isArray(input.images) ? input.images.map(img => String(img).trim()).filter(Boolean) : existing.images)
    : existing.images;

  store[slug] = {
    ...existing,
    images: updatedImages,
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  saveStore(store);
  return store[slug];
}

export function saveUploadedImageFile(buffer: Buffer, mimeType: string, originalName: string): string {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const cleanBase = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `slider-${Date.now()}-${cleanBase}.${ext}`;
  const filePath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
}

export function getSliderImageFile(filename: string): { buffer: Buffer; mimeType: string } | null {
  const safeFilename = path.basename(filename);
  const filePath = path.join(IMAGES_DIR, safeFilename);
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const buffer = fs.readFileSync(filePath);
  return { buffer, mimeType };
}
