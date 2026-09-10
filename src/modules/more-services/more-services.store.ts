import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma.js';
import type { MoreServiceItem, CreateMoreServiceInput, UpdateMoreServiceInput } from './more-services.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data/more-services');
const STORE_FILE = path.join(DATA_DIR, 'more-services.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const INITIAL_SERVICES: MoreServiceItem[] = [
  {
    id: 'app-01',
    appSlug: 'delivez-now',
    appName: 'Delivez Now',
    tagline: 'Instant Few-Minute Delivery',
    description: 'Get anything delivered in minutes — groceries, medicines, snacks, and daily essentials from nearby stores.',
    iconUrl: 'https://cdn.delivez.com/apps/delivez-now-icon.png',
    bannerUrl: 'https://cdn.delivez.com/apps/delivez-now-banner.png',
    primaryColor: '#EC4899',
    secondaryColor: '#D97706',
    badge: 'Fastest',
    features: [
      'Few min delivery',
      'Live rider tracking',
      'Free delivery above ₹199'
    ],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delivez.now',
    appStoreUrl: 'https://apps.apple.com/in/app/delivez-now/id1234567890',
    deepLinkScheme: 'deliveznow://',
    rating: 4.8,
    downloads: '500K+',
    order: 1,
    isActive: true,
    createdAt: '2026-09-10T05:46:49.858Z',
    updatedAt: '2026-09-10T05:46:49.858Z'
  },
  {
    id: 'app-02',
    appSlug: 'delivez-pro',
    appName: 'Delivez Pro',
    tagline: 'Premium Priority Delivery',
    description: 'Business-grade delivery for enterprises. Bulk shipments, priority handling, scheduled pickups, and dedicated account manager.',
    iconUrl: 'https://cdn.delivez.com/apps/delivez-pro-icon.png',
    bannerUrl: 'https://cdn.delivez.com/apps/delivez-pro-banner.png',
    primaryColor: '#8B5CF6',
    secondaryColor: '#7C3AED',
    badge: 'For Business',
    features: [
      'Bulk shipping discounts',
      'Priority pickup slots',
      'Dedicated account manager'
    ],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delivez.pro',
    appStoreUrl: 'https://apps.apple.com/in/app/delivez-pro/id1234567891',
    deepLinkScheme: 'delivezpro://',
    rating: 4.9,
    downloads: '100K+',
    order: 2,
    isActive: true,
    createdAt: '2026-09-10T05:46:49.858Z',
    updatedAt: '2026-09-10T05:46:49.858Z'
  },
  {
    id: 'app-03',
    appSlug: 'delivez-local',
    appName: 'Delivez Local',
    tagline: 'Your Neighborhood Delivery',
    description: 'Connect with local shops, kirana stores, and home businesses in your area. Same-city delivery with the best local prices.',
    iconUrl: 'https://cdn.delivez.com/apps/delivez-local-icon.png',
    bannerUrl: 'https://cdn.delivez.com/apps/delivez-local-banner.png',
    primaryColor: '#6366F1',
    secondaryColor: '#4F46E5',
    badge: 'Hyperlocal',
    features: [
      'Shop from nearby stores',
      'Support local businesses',
      'Same-city fast delivery'
    ],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delivez.local',
    appStoreUrl: 'https://apps.apple.com/in/app/delivez-local/id1234567892',
    deepLinkScheme: 'delivezlocal://',
    rating: 4.7,
    downloads: '250K+',
    order: 3,
    isActive: true,
    createdAt: '2026-09-10T05:46:49.858Z',
    updatedAt: '2026-09-10T05:46:49.858Z'
  },
  {
    id: 'app-04',
    appSlug: 'delivez-move',
    appName: 'Delivez Move',
    tagline: 'Heavy & Bulk Shifting',
    description: 'Relocate homes, offices, and move heavy furniture or appliances with trained packers and movers. Insurance included.',
    iconUrl: 'https://cdn.delivez.com/apps/delivez-move-icon.png',
    bannerUrl: 'https://cdn.delivez.com/apps/delivez-move-banner.png',
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    badge: 'Packers & Movers',
    features: [
      'Trained packing crew',
      'Goods insurance included',
      'Door-to-door shifting'
    ],
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.delivez.move',
    appStoreUrl: 'https://apps.apple.com/in/app/delivez-move/id1234567893',
    deepLinkScheme: 'delivezmove://',
    rating: 4.6,
    downloads: '50K+',
    order: 4,
    isActive: true,
    createdAt: '2026-09-10T05:46:49.858Z',
    updatedAt: '2026-09-10T05:46:49.858Z'
  }
];

let cachedServices: MoreServiceItem[] = [...INITIAL_SERVICES];

async function syncDatabaseToMemory(): Promise<void> {
  try {
    const dbRecord = await prisma.service.findUnique({ where: { slug: 'more-services' } });
    if (dbRecord?.description) {
      const parsed = JSON.parse(dbRecord.description);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedServices = parsed;
        try {
          fs.writeFileSync(STORE_FILE, JSON.stringify(cachedServices, null, 2), 'utf8');
        } catch {
          // ignore disk write errors
        }
        return;
      }
    }
  } catch (err) {
    console.error('[MoreServicesStore] PostgreSQL read error:', err);
  }

  // Fallback to disk
  try {
    if (fs.existsSync(STORE_FILE)) {
      const fileData = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedServices = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('[MoreServicesStore] Disk read error:', err);
  }

  // Initialize store file
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(INITIAL_SERVICES, null, 2), 'utf8');
  } catch {
    // ignore
  }
}

// Initial sync
syncDatabaseToMemory().catch(console.error);

async function persistServices(services: MoreServiceItem[]): Promise<void> {
  cachedServices = services;
  const serialized = JSON.stringify(services, null, 2);

  try {
    fs.writeFileSync(STORE_FILE, serialized, 'utf8');
  } catch (err) {
    console.error('[MoreServicesStore] Failed to write store file:', err);
  }

  try {
    await prisma.service.upsert({
      where: { slug: 'more-services' },
      create: {
        name: 'More Services',
        slug: 'more-services',
        shortDescription: 'Delivez Ecosystem Apps & More Services',
        description: serialized,
        isActive: true,
        displayOrder: 99
      },
      update: {
        description: serialized,
        updatedAt: new Date()
      }
    });
  } catch (err) {
    console.error('[MoreServicesStore] PostgreSQL write error:', err);
  }
}

export class MoreServicesStore {
  static async getAll(includeInactive = false): Promise<MoreServiceItem[]> {
    await syncDatabaseToMemory();
    const sorted = [...cachedServices].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (includeInactive) return sorted;
    return sorted.filter((s) => s.isActive !== false);
  }

  static async getBySlug(slug: string): Promise<MoreServiceItem | null> {
    await syncDatabaseToMemory();
    const clean = slug.trim().toLowerCase();
    return cachedServices.find((s) => s.appSlug.toLowerCase() === clean || s.id.toLowerCase() === clean) || null;
  }

  static async create(input: CreateMoreServiceInput): Promise<MoreServiceItem> {
    await syncDatabaseToMemory();
    const now = new Date().toISOString();
    const slugBase = input.appSlug || input.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Ensure unique slug
    let appSlug = slugBase;
    let counter = 1;
    while (cachedServices.some((s) => s.appSlug === appSlug)) {
      appSlug = `${slugBase}-${counter++}`;
    }

    let features: string[] = [];
    if (Array.isArray(input.features)) {
      features = input.features.map(f => String(f).trim()).filter(Boolean);
    } else if (typeof input.features === 'string') {
      features = input.features.split(',').map(f => f.trim()).filter(Boolean);
    }

    const newItem: MoreServiceItem = {
      id: `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      appSlug,
      appName: input.appName.trim(),
      tagline: input.tagline?.trim() || '',
      description: input.description.trim(),
      iconUrl: input.iconUrl?.trim() || 'https://cdn.delivez.com/apps/default-icon.png',
      bannerUrl: input.bannerUrl?.trim() || 'https://cdn.delivez.com/apps/default-banner.png',
      primaryColor: input.primaryColor?.trim() || '#E50914',
      secondaryColor: input.secondaryColor?.trim() || '#B91C1C',
      badge: input.badge?.trim() || '',
      features,
      playStoreUrl: input.playStoreUrl?.trim() || '',
      appStoreUrl: input.appStoreUrl?.trim() || '',
      deepLinkScheme: input.deepLinkScheme?.trim() || `${appSlug.replace(/-/g, '')}://`,
      rating: Number(input.rating) || 4.8,
      downloads: input.downloads?.trim() || '10K+',
      order: input.order !== undefined ? Number(input.order) : cachedServices.length + 1,
      isActive: input.isActive !== false,
      createdAt: now,
      updatedAt: now
    };

    const updated = [...cachedServices, newItem];
    await persistServices(updated);
    return newItem;
  }

  static async update(id: string, input: UpdateMoreServiceInput): Promise<MoreServiceItem | null> {
    await syncDatabaseToMemory();
    const idx = cachedServices.findIndex((s) => s.id === id || s.appSlug === id);
    if (idx === -1) return null;

    const existing = cachedServices[idx];
    if (!existing) return null;
    const now = new Date().toISOString();

    let features = existing.features;
    if (input.features !== undefined) {
      if (Array.isArray(input.features)) {
        features = input.features.map(f => String(f).trim()).filter(Boolean);
      } else if (typeof input.features === 'string') {
        features = input.features.split(',').map(f => f.trim()).filter(Boolean);
      }
    }

    const updatedItem: MoreServiceItem = {
      ...existing,
      appName: input.appName !== undefined ? input.appName.trim() : existing.appName,
      appSlug: input.appSlug !== undefined ? input.appSlug.trim().toLowerCase() : existing.appSlug,
      tagline: input.tagline !== undefined ? input.tagline.trim() : existing.tagline,
      description: input.description !== undefined ? input.description.trim() : existing.description,
      iconUrl: input.iconUrl !== undefined ? input.iconUrl.trim() : existing.iconUrl,
      bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl.trim() : existing.bannerUrl,
      primaryColor: input.primaryColor !== undefined ? input.primaryColor.trim() : existing.primaryColor,
      secondaryColor: input.secondaryColor !== undefined ? input.secondaryColor.trim() : existing.secondaryColor,
      badge: input.badge !== undefined ? input.badge.trim() : existing.badge,
      features,
      playStoreUrl: input.playStoreUrl !== undefined ? input.playStoreUrl.trim() : existing.playStoreUrl,
      appStoreUrl: input.appStoreUrl !== undefined ? input.appStoreUrl.trim() : existing.appStoreUrl,
      deepLinkScheme: input.deepLinkScheme !== undefined ? input.deepLinkScheme.trim() : existing.deepLinkScheme,
      rating: input.rating !== undefined ? Number(input.rating) : existing.rating,
      downloads: input.downloads !== undefined ? input.downloads.trim() : existing.downloads,
      order: input.order !== undefined ? Number(input.order) : existing.order,
      isActive: input.isActive !== undefined ? input.isActive : existing.isActive,
      updatedAt: now
    };

    const updatedList = [...cachedServices];
    updatedList[idx] = updatedItem;
    await persistServices(updatedList);
    return updatedItem;
  }

  static async delete(id: string): Promise<boolean> {
    await syncDatabaseToMemory();
    const initialLen = cachedServices.length;
    const filtered = cachedServices.filter((s) => s.id !== id && s.appSlug !== id);
    if (filtered.length === initialLen) return false;
    await persistServices(filtered);
    return true;
  }

  static async reorder(idsInOrder: string[]): Promise<MoreServiceItem[]> {
    await syncDatabaseToMemory();
    const updated = [...cachedServices];
    idsInOrder.forEach((id, index) => {
      const item = updated.find((s) => s.id === id || s.appSlug === id);
      if (item) {
        item.order = index + 1;
        item.updatedAt = new Date().toISOString();
      }
    });
    updated.sort((a, b) => (a.order || 0) - (b.order || 0));
    await persistServices(updated);
    return updated;
  }
}
