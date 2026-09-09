import fs from 'fs';
import path from 'path';
import type { HomeStoreData, PincodeRecord, QuickActionItem, PromptExampleItem } from './home-content.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data/home-store');
const STORE_FILE = path.join(DATA_DIR, 'content.json');
const IMAGES_DIR = path.join(DATA_DIR, 'images');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const DEFAULT_STORE: HomeStoreData = {
  location: {
    current: {
      label: 'Home',
      addressLine: '123, MG Road, Bengaluru, Karnataka',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      latitude: 12.9716,
      longitude: 77.5946,
      isServiceable: true,
    },
    presets: [
      {
        id: 'home-default',
        label: 'Home',
        addressLine: '123, MG Road, Bengaluru, Karnataka',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      {
        id: 'work-indiranagar',
        label: 'Work',
        addressLine: '100 Feet Rd, Indiranagar, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        latitude: 12.9784,
        longitude: 77.6408,
      },
      {
        id: 'other-koramangala',
        label: 'Koramangala',
        addressLine: '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        latitude: 12.9352,
        longitude: 77.6245,
      },
      {
        id: 'city-mumbai',
        label: 'Mumbai Hub',
        addressLine: 'Bandra Kurla Complex, Bandra East, Mumbai',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400051',
        latitude: 19.0657,
        longitude: 72.8687,
      },
      {
        id: 'city-delhi',
        label: 'Delhi Hub',
        addressLine: 'Connaught Place, Central Delhi, New Delhi',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        latitude: 28.6315,
        longitude: 77.2167,
      },
      {
        id: 'city-hyderabad',
        label: 'Hyderabad Hub',
        addressLine: 'Hitec City, Madhapur, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        latitude: 17.4435,
        longitude: 78.3772,
      },
    ],
  },
  hero: {
    greetingPrefix: 'Hi',
    defaultName: 'Arjun',
    greetingEmoji: '👋',
    headline: 'What do you need delivered today?',
    highlightWord: 'delivered',
    subtitle: 'AI will take care of the rest.',
    searchTitle: 'Tell us in your own words... ?',
    searchPlaceholder: 'Example: Pick up my laptop from office and deliver home by 8 PM.',
    micEnabled: true,
    hasCustomImage: false,
    sideImageUrl: null,
    sideImageUpdatedAt: null,
  },
  quickActions: [
    {
      id: 'ship-now',
      title: 'Ship Now',
      subtitle: 'Book a new shipment',
      icon: 'box',
      actionType: 'ROUTE',
      actionTarget: '/courier',
      badge: 'Fast',
      displayOrder: 1,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'track-shipment',
      title: 'Track Shipment',
      subtitle: 'Track your shipments',
      icon: 'truck',
      actionType: 'ROUTE',
      actionTarget: '#track-order',
      badge: 'Live',
      displayOrder: 2,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'find-pincode',
      title: 'Find Pincode',
      subtitle: 'Check service availability',
      icon: 'map-pin',
      actionType: 'MODAL',
      actionTarget: 'PINCODE_MODAL',
      badge: 'Check',
      displayOrder: 3,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'help-support',
      title: 'Help & Support',
      subtitle: '24/7 assistance',
      icon: 'headset',
      actionType: 'MODAL',
      actionTarget: 'SUPPORT_MODAL',
      badge: '24/7',
      displayOrder: 4,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
  ],
  banner: {
    title: 'Priority. Protection. Performance.',
    subtitle: 'Delivered the Delivez way.',
    buttonText: 'Know More',
    buttonLink: '#services',
    backgroundColor: '#F59E0B',
    textColor: '#111827',
    iconName: 'ShieldCheck',
    isActive: true,
  },
  chips: [
    { id: 'price-calculator', label: 'Price Calculator', icon: 'calculator', target: '#services', isActive: true },
    { id: 'schedule-pickup', label: 'Schedule Pickup', icon: 'calendar', target: '/courier', isActive: true },
    { id: 'delivez-money', label: 'Delivez Money', icon: 'wallet', target: '#wallet', isActive: true },
    { id: 'best-offers', label: 'Best Offers', icon: 'tag', target: '#services', isActive: true },
  ],
  pincodes: [
    {
      pincode: '560001',
      city: 'Bengaluru',
      state: 'Karnataka',
      isServiceable: true,
      estimatedDelivery: 'Same Day (2-4 Hours)',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '560038',
      city: 'Bengaluru (Indiranagar)',
      state: 'Karnataka',
      isServiceable: true,
      estimatedDelivery: 'Same Day (2-4 Hours)',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '560034',
      city: 'Bengaluru (Koramangala)',
      state: 'Karnataka',
      isServiceable: true,
      estimatedDelivery: 'Same Day (2-4 Hours)',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '110001',
      city: 'New Delhi (Connaught Place)',
      state: 'Delhi',
      isServiceable: true,
      estimatedDelivery: 'Same Day / Next Day',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '400001',
      city: 'Mumbai (Fort / South Mumbai)',
      state: 'Maharashtra',
      isServiceable: true,
      estimatedDelivery: 'Same Day / Next Day',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '500081',
      city: 'Hyderabad (Hitec City)',
      state: 'Telangana',
      isServiceable: true,
      estimatedDelivery: 'Same Day / Next Day',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '600017',
      city: 'Chennai (T. Nagar)',
      state: 'Tamil Nadu',
      isServiceable: true,
      estimatedDelivery: 'Next Day Express',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
    {
      pincode: '411001',
      city: 'Pune (Camp / Station)',
      state: 'Maharashtra',
      isServiceable: true,
      estimatedDelivery: 'Next Day Express',
      availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'forgot-something', 'return-pickup', 'know-more'],
      codAvailable: true,
    },
  ],
  support: {
    helpline: '+91 1800-DELIVEZ-SOS (Toll Free)',
    whatsapp: '+91 98765 43210',
    email: 'support@delivez.com',
    operatingHours: '24/7 Assistance • 365 Days',
    chatEnabled: true,
    faqs: [
      {
        question: 'How do I book an urgent delivery?',
        answer: 'Click "Ship Now" on the home screen or choose from our specialized services like Courier, Confidential, or Luggage delivery.',
        category: 'Booking',
      },
      {
        question: 'How do I track my shipment?',
        answer: 'Enter your tracking ID (e.g. DLVZ... or DV-...) in the Track Shipment section for real-time live updates and driver telemetry.',
        category: 'Tracking',
      },
      {
        question: 'Is Confidential Delivery really secure?',
        answer: 'Yes, Delivez Vault uses AES-256 encryption, tamper-evident void seals, armed executive transit, and dual-party OTP verification.',
        category: 'Security',
      },
      {
        question: 'How can I check service availability in my area?',
        answer: 'Click on "Find Pincode" or enter your 6-digit postal code to check instant serviceability and estimated turnaround time.',
        category: 'Serviceability',
      },
    ],
  },
  promptExamples: [
    {
      id: 'laptop-office',
      title: 'Pick up my laptop from office and deliver home by 8 PM',
      shortText: 'Pick up my laptop from office and deliv...',
      promptText: 'Pick up my laptop from office and deliver home by 8 PM',
      serviceSlug: 'courier-delivery',
      icon: 'laptop',
      iconColor: '#d97706',
      displayOrder: 1,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'airport-luggage',
      title: 'Send my luggage to Bengaluru Airport Terminal 1',
      shortText: 'Send my luggage to Bengaluru Airport T...',
      promptText: 'Send my luggage to Bengaluru Airport Terminal 1',
      serviceSlug: 'luggage-delivery',
      icon: 'luggage',
      iconColor: '#16a34a',
      displayOrder: 2,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'legal-documents',
      title: 'Deliver important documents to my lawyer',
      shortText: 'Deliver important documents to my law...',
      promptText: 'Deliver important confidential documents to my lawyer with tamper-proof void seal',
      serviceSlug: 'confidential-delivery',
      icon: 'file-text',
      iconColor: '#9333ea',
      displayOrder: 3,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'birthday-gift',
      title: 'Send a birthday gift to my wife at home',
      shortText: 'Send a birthday gift to my wife at ho...',
      promptText: 'Send a surprise birthday gift to my wife at home with special gift wrap',
      serviceSlug: 'gift-delivery',
      icon: 'gift',
      iconColor: '#e11d48',
      displayOrder: 4,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'zara-return',
      title: 'Pick up my return from Zara and deliver to logistics hub',
      shortText: 'Pick up my return from Zara and deliv...',
      promptText: 'Pick up my clothing return package from Zara and deliver to return center',
      serviceSlug: 'return-pickup',
      icon: 'hanger',
      iconColor: '#0284c7',
      displayOrder: 5,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
    {
      id: 'forgot-keys',
      title: 'I forgot my car keys at home. Deliver to office',
      shortText: 'I forgot my car keys at home. Deliver to...',
      promptText: 'I forgot my car keys at home. Please retrieve them from home and deliver to my office immediately',
      serviceSlug: 'forgot-something',
      icon: 'key',
      iconColor: '#ea580c',
      displayOrder: 6,
      isActive: true,
      hasCustomImage: false,
      imageUrl: null,
    },
  ],
};

let memoryStore: HomeStoreData = (() => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_STORE,
        ...parsed,
        location: { ...DEFAULT_STORE.location, ...(parsed.location || {}) },
        hero: { ...DEFAULT_STORE.hero, ...(parsed.hero || {}) },
        banner: { ...DEFAULT_STORE.banner, ...(parsed.banner || {}) },
        support: { ...DEFAULT_STORE.support, ...(parsed.support || {}) },
        quickActions: parsed.quickActions?.length ? parsed.quickActions : DEFAULT_STORE.quickActions,
        chips: parsed.chips?.length ? parsed.chips : DEFAULT_STORE.chips,
        pincodes: parsed.pincodes?.length ? parsed.pincodes : DEFAULT_STORE.pincodes,
        promptExamples: parsed.promptExamples?.length ? parsed.promptExamples : DEFAULT_STORE.promptExamples,
      };
    }
  } catch (err) {
    console.error('Failed to load home store from disk, using defaults:', err);
  }
  return JSON.parse(JSON.stringify(DEFAULT_STORE));
})();

export function saveHomeStore(): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(memoryStore, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save home store to disk:', err);
  }
}

export function getHomeStore(): HomeStoreData {
  return memoryStore;
}

export function saveHeroImage(buffer: Buffer, mimeType: string, originalName: string): string {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `hero-side-image.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  memoryStore.hero.hasCustomImage = true;
  memoryStore.hero.sideImageMimeType = mimeType;
  memoryStore.hero.sideImageFileName = originalName;
  memoryStore.hero.sideImageUpdatedAt = new Date().toISOString();
  saveHomeStore();
  return fileName;
}

export function removeHeroImage(): void {
  memoryStore.hero.hasCustomImage = false;
  memoryStore.hero.sideImageMimeType = null;
  memoryStore.hero.sideImageFileName = null;
  memoryStore.hero.sideImageUpdatedAt = new Date().toISOString();
  saveHomeStore();
}

export function getHeroImageFile(): { buffer: Buffer; mimeType: string; fileName: string } | null {
  if (!memoryStore.hero.hasCustomImage || !memoryStore.hero.sideImageMimeType) {
    return null;
  }
  const ext = memoryStore.hero.sideImageMimeType === 'image/png' ? 'png' : memoryStore.hero.sideImageMimeType === 'image/webp' ? 'webp' : 'jpg';
  const filePath = path.join(IMAGES_DIR, `hero-side-image.${ext}`);
  if (fs.existsSync(filePath)) {
    return {
      buffer: fs.readFileSync(filePath),
      mimeType: memoryStore.hero.sideImageMimeType,
      fileName: memoryStore.hero.sideImageFileName || `hero-image.${ext}`,
    };
  }
  return null;
}

export function saveBannerImage(buffer: Buffer, mimeType: string, originalName: string): string {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `banner-image.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  memoryStore.banner.hasCustomImage = true;
  memoryStore.banner.imageMimeType = mimeType;
  memoryStore.banner.imageFileName = originalName;
  memoryStore.banner.imageUpdatedAt = new Date().toISOString();
  saveHomeStore();
  return fileName;
}

export function removeBannerImage(): void {
  memoryStore.banner.hasCustomImage = false;
  memoryStore.banner.imageMimeType = null;
  memoryStore.banner.imageFileName = null;
  memoryStore.banner.imageUpdatedAt = new Date().toISOString();
  saveHomeStore();
}

export function getBannerImageFile(): { buffer: Buffer; mimeType: string; fileName: string } | null {
  if (!memoryStore.banner.hasCustomImage || !memoryStore.banner.imageMimeType) {
    return null;
  }
  const ext = memoryStore.banner.imageMimeType === 'image/png' ? 'png' : memoryStore.banner.imageMimeType === 'image/webp' ? 'webp' : 'jpg';
  const filePath = path.join(IMAGES_DIR, `banner-image.${ext}`);
  if (fs.existsSync(filePath)) {
    return {
      buffer: fs.readFileSync(filePath),
      mimeType: memoryStore.banner.imageMimeType,
      fileName: memoryStore.banner.imageFileName || `banner-image.${ext}`,
    };
  }
  return null;
}

export function saveQuickActionImage(actionId: string, buffer: Buffer, mimeType: string, originalName: string): void {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `action-${actionId}.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  const item = memoryStore.quickActions.find((q) => q.id === actionId);
  if (item) {
    item.hasCustomImage = true;
    item.imageMimeType = mimeType;
    item.imageFileName = originalName;
    item.imageUpdatedAt = new Date().toISOString();
    saveHomeStore();
  }
}

export function getQuickActionImageFile(actionId: string): { buffer: Buffer; mimeType: string; fileName: string } | null {
  const item = memoryStore.quickActions.find((q) => q.id === actionId);
  if (!item?.hasCustomImage || !item.imageMimeType) return null;
  const ext = item.imageMimeType === 'image/png' ? 'png' : item.imageMimeType === 'image/webp' ? 'webp' : 'jpg';
  const filePath = path.join(IMAGES_DIR, `action-${actionId}.${ext}`);
  if (fs.existsSync(filePath)) {
    return {
      buffer: fs.readFileSync(filePath),
      mimeType: item.imageMimeType,
      fileName: item.imageFileName || `action-${actionId}.${ext}`,
    };
  }
  return null;
}

export function removeQuickActionImage(actionId: string): void {
  const item = memoryStore.quickActions.find((q) => q.id === actionId);
  if (item) {
    item.hasCustomImage = false;
    item.imageMimeType = null;
    item.imageFileName = null;
    item.imageUpdatedAt = new Date().toISOString();
    saveHomeStore();
  }
}

// Generate the glowing yellow robot mascot SVG seen in Screenshot 2
export function getDefaultRobotSvg(): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FBBF24" stop-opacity="0.35" />
      <stop offset="60%" stop-color="#F59E0B" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#F59E0B" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="robotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  <!-- Background Glow -->
  <circle cx="100" cy="100" r="95" fill="url(#glow)" />
  <!-- Antenna -->
  <rect x="94" y="28" width="12" height="18" rx="6" fill="url(#robotGrad)" />
  <circle cx="100" cy="24" r="10" fill="url(#robotGrad)" />
  <!-- Robot Ears -->
  <rect x="36" y="78" width="16" height="34" rx="8" fill="url(#robotGrad)" />
  <rect x="148" y="78" width="16" height="34" rx="8" fill="url(#robotGrad)" />
  <!-- Robot Head / Body -->
  <rect x="46" y="46" width="108" height="96" rx="28" fill="url(#robotGrad)" />
  <!-- Eyes -->
  <rect x="66" y="76" width="20" height="16" rx="8" fill="#FFFFFF" />
  <rect x="114" y="76" width="20" height="16" rx="8" fill="#FFFFFF" />
  <!-- Mouth / Smile -->
  <rect x="74" y="108" width="52" height="10" rx="5" fill="#FFFFFF" />
</svg>`;
  return Buffer.from(svg, 'utf8');
}

export function savePromptExampleImage(exampleId: string, buffer: Buffer, mimeType: string, originalName: string): void {
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `example-${exampleId}.${ext}`;
  const filePath = path.join(IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  const item = memoryStore.promptExamples.find((e) => e.id === exampleId);
  if (item) {
    item.hasCustomImage = true;
    item.imageMimeType = mimeType;
    item.imageFileName = originalName;
    item.imageUpdatedAt = new Date().toISOString();
    saveHomeStore();
  }
}

export function getPromptExampleImageFile(exampleId: string): { buffer: Buffer; mimeType: string; fileName: string } | null {
  const item = memoryStore.promptExamples?.find((e) => e.id === exampleId);
  if (!item?.hasCustomImage || !item.imageMimeType) return null;
  const ext = item.imageMimeType === 'image/png' ? 'png' : item.imageMimeType === 'image/webp' ? 'webp' : 'jpg';
  const filePath = path.join(IMAGES_DIR, `example-${exampleId}.${ext}`);
  if (fs.existsSync(filePath)) {
    return {
      buffer: fs.readFileSync(filePath),
      mimeType: item.imageMimeType,
      fileName: item.imageFileName || `example-${exampleId}.${ext}`,
    };
  }
  return null;
}

export function removePromptExampleImage(exampleId: string): void {
  const item = memoryStore.promptExamples?.find((e) => e.id === exampleId);
  if (item) {
    item.hasCustomImage = false;
    item.imageMimeType = null;
    item.imageFileName = null;
    item.imageUpdatedAt = new Date().toISOString();
    saveHomeStore();
  }
}
