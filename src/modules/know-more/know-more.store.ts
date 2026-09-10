import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma.js';
import type { KnowMoreCard, CreateKnowMoreCardInput, UpdateKnowMoreCardInput, ServiceCategory } from './know-more.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data/know-more');
const STORE_FILE = path.join(DATA_DIR, 'cards.json');
const IMAGES_DIR = path.join(DATA_DIR, 'images');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const INITIAL_CARDS: KnowMoreCard[] = [
  {
    id: 'km-card-01',
    serviceSlug: 'courier-delivery',
    heading: 'Personal Courier & Parcel Express Guide',
    description: 'Learn how our verified riders pick up packages in 15 minutes, inspect weight & dimensions, and deliver across city pin codes with end-to-end GPS telemetry.',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1000&auto=format&fit=crop&q=80'
    ],
    ctaText: 'Explore Courier Guide',
    ctaLink: '/services/courier-delivery',
    badge: 'Express Standard',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'km-card-02',
    serviceSlug: 'luggage-delivery',
    heading: 'Airport Luggage Transfer & Security Protocols',
    description: 'Discover how TSA-compliant sealed security tags, dedicated vehicle escorts, and airport gate drop-offs keep your travel baggage 100% stress-free.',
    images: [
      'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=1000&auto=format&fit=crop&q=80'
    ],
    ctaText: 'Read Luggage Policy',
    ctaLink: '/services/luggage-delivery',
    badge: 'Airport Check-In',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'km-card-03',
    serviceSlug: 'confidential-delivery',
    heading: 'Vault Courier & Dual-OTP Chain of Custody',
    description: 'Detailed insights on armed couriers, tamper-evident barcode envelopes, and real-time electronic signatures for high-value legal documents and jewelry.',
    images: [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80'
    ],
    ctaText: 'Inspect Vault Protocols',
    ctaLink: '/services/confidential-delivery',
    badge: 'Zero Tamper',
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'km-card-04',
    serviceSlug: 'forgot-something',
    heading: 'Lost & Forgotten Item Fast-Track Recovery',
    description: 'How to summon an instant rescue courier when keys, office badges, or laptops are left behind. Includes verified identity confirmation and handover OTP.',
    images: [
      'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80'
    ],
    ctaText: 'Read Recovery Flow',
    ctaLink: '/services/forgot-something',
    badge: 'Urgent Rescue',
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'km-card-05',
    serviceSlug: 'return-pickup',
    heading: 'E-Commerce Return Pickup & Service Center Handover',
    description: 'Everything you need to know about doorstep barcode scanning, return package weight verification, and getting instant vendor handover acknowledgment.',
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&auto=format&fit=crop&q=80'
    ],
    ctaText: 'Understand Returns',
    ctaLink: '/services/return-pickup',
    badge: 'Zero Hassle',
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let cachedCards: KnowMoreCard[] = [...INITIAL_CARDS];
let hasAttemptedDbLoad = false;

export async function syncDatabaseToMemory(): Promise<void> {
  try {
    const dbRecord = await prisma.service.findUnique({ where: { slug: 'know-more' } });
    if (dbRecord?.description) {
      const parsed = JSON.parse(dbRecord.description);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedCards = parsed;
        try {
          fs.writeFileSync(STORE_FILE, JSON.stringify(cachedCards, null, 2), 'utf8');
        } catch {
          // ignore disk write errors
        }
        return;
      }
    }
  } catch (err) {
    console.error('[KnowMoreStore] PostgreSQL initial read error:', err);
  }

  // Fallback to disk
  try {
    if (fs.existsSync(STORE_FILE)) {
      const fileData = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(fileData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedCards = parsed;
        return;
      }
    }
  } catch (err) {
    console.error('[KnowMoreStore] File read fallback error:', err);
  }
}

// Background sync to PostgreSQL database
export async function syncCardsToDatabase(cards: KnowMoreCard[]): Promise<void> {
  try {
    const serialized = JSON.stringify(cards);
    await prisma.service.upsert({
      where: { slug: 'know-more' },
      update: {
        description: serialized,
        updatedAt: new Date(),
      },
      create: {
        slug: 'know-more',
        name: 'Know More',
        shortDescription: 'Explore our full range of tailored logistics, enterprise solutions, and 24/7 support.',
        description: serialized,
        isActive: true,
      },
    });
  } catch (err) {
    console.error('[KnowMoreStore] PostgreSQL write sync error:', err);
  }
}

function loadStore(): KnowMoreCard[] {
  if (!hasAttemptedDbLoad) {
    hasAttemptedDbLoad = true;
    syncDatabaseToMemory().catch(() => {});
  }
  return cachedCards;
}

function saveStore(cards: KnowMoreCard[]): void {
  cachedCards = cards;
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(cards, null, 2), 'utf8');
  } catch (err) {
    console.error('[KnowMoreStore] Failed to save cards.json', err);
  }
  syncCardsToDatabase(cards).catch(() => {});
}

export function getAllCards(filter?: { serviceSlug?: string; activeOnly?: boolean }): KnowMoreCard[] {
  let list = loadStore();
  if (filter?.serviceSlug && filter.serviceSlug !== 'all') {
    list = list.filter(item => item.serviceSlug === filter.serviceSlug || item.serviceSlug === 'all');
  }
  if (filter?.activeOnly) {
    list = list.filter(item => item.isActive !== false);
  }
  return [...list].sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getCardById(id: string): KnowMoreCard | null {
  const list = loadStore();
  return list.find(c => c.id === id) || null;
}

export function createCard(input: CreateKnowMoreCardInput): KnowMoreCard {
  const list = loadStore();
  const id = 'km-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  const newCard: KnowMoreCard = {
    id,
    serviceSlug: input.serviceSlug,
    heading: input.heading.trim(),
    description: input.description.trim(),
    images: Array.isArray(input.images) && input.images.length > 0 ? input.images.map(img => String(img).trim()).filter(Boolean) : [],
    ctaText: input.ctaText?.trim() || 'Learn More',
    ctaLink: input.ctaLink?.trim() || `/services/${input.serviceSlug}`,
    badge: input.badge?.trim() || undefined,
    order: typeof input.order === 'number' ? input.order : list.length + 1,
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...list, newCard];
  saveStore(updatedList);
  return newCard;
}

export function updateCard(id: string, input: UpdateKnowMoreCardInput): KnowMoreCard | null {
  const list = loadStore();
  const index = list.findIndex(c => c.id === id);
  if (index === -1) return null;

  const existing = list[index];
  if (!existing) return null;

  const updated: KnowMoreCard = {
    id: existing.id,
    createdAt: existing.createdAt,
    serviceSlug: input.serviceSlug ?? existing.serviceSlug,
    heading: input.heading !== undefined ? input.heading.trim() : existing.heading,
    description: input.description !== undefined ? input.description.trim() : existing.description,
    images: input.images !== undefined
      ? (Array.isArray(input.images) ? input.images.map(img => String(img).trim()).filter(Boolean) : [])
      : existing.images,
    ctaText: input.ctaText !== undefined ? input.ctaText.trim() : existing.ctaText,
    ctaLink: input.ctaLink !== undefined ? input.ctaLink.trim() : existing.ctaLink,
    badge: input.badge !== undefined ? (input.badge ? input.badge.trim() : undefined) : existing.badge,
    order: typeof input.order === 'number' ? input.order : existing.order,
    isActive: input.isActive !== undefined ? Boolean(input.isActive) : existing.isActive,
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...list];
  updatedList[index] = updated;
  saveStore(updatedList);
  return updated;
}

export function deleteCard(id: string): boolean {
  const list = loadStore();
  const filtered = list.filter(c => c.id !== id);
  if (filtered.length === list.length) return false;
  saveStore(filtered);
  return true;
}

export function toggleCardActive(id: string): KnowMoreCard | null {
  const list = loadStore();
  const item = list.find(c => c.id === id);
  if (!item) return null;
  item.isActive = !item.isActive;
  item.updatedAt = new Date().toISOString();
  saveStore([...list]);
  return item;
}

export function saveCardImage(buffer: Buffer, mimeType: string, originalName: string): string {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const cleanBase = path.basename(originalName, path.extname(originalName)).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `km-${Date.now()}-${cleanBase}.${ext}`;
  const filePath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(filePath, buffer);
  return filename;
}

export function getCardImageFile(filename: string): { buffer: Buffer; mimeType: string } | null {
  const safeFilename = path.basename(filename);
  const filePath = path.join(IMAGES_DIR, safeFilename);
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const buffer = fs.readFileSync(filePath);
  return { buffer, mimeType };
}

// Initial DB sync on module import
syncDatabaseToMemory().catch(() => {});
