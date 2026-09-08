export interface LocationBarData {
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isServiceable: boolean;
}

export interface LocationPreset {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

export interface HeroConfig {
  greetingPrefix: string;
  defaultName: string;
  greetingEmoji: string;
  headline: string;
  highlightWord: string;
  subtitle: string;
  searchTitle: string;
  searchPlaceholder: string;
  micEnabled: boolean;
  hasCustomImage: boolean;
  sideImageUrl: string | null;
  sideImageUpdatedAt: string | null;
  sideImageMimeType?: string | null;
  sideImageFileName?: string | null;
}

export interface QuickActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  actionType: 'ROUTE' | 'MODAL' | 'LINK';
  actionTarget: string;
  badge: string | null;
  displayOrder: number;
  isActive: boolean;
  hasCustomImage: boolean;
  imageUrl: string | null;
  imageMimeType?: string | null;
  imageFileName?: string | null;
  imageUpdatedAt?: string | null;
}

export interface PromoBannerConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  iconName: string;
  isActive: boolean;
}

export interface ActionChipItem {
  id: string;
  label: string;
  icon: string;
  target: string;
  isActive: boolean;
}

export interface PincodeRecord {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedDelivery: string;
  availableServices: string[];
  codAvailable: boolean;
}

export interface SupportFaq {
  question: string;
  answer: string;
  category: string;
}

export interface SupportConfig {
  helpline: string;
  whatsapp: string;
  email: string;
  operatingHours: string;
  chatEnabled: boolean;
  faqs: SupportFaq[];
}

export interface HomeStoreData {
  location: {
    current: LocationBarData;
    presets: LocationPreset[];
  };
  hero: HeroConfig;
  quickActions: QuickActionItem[];
  banner: PromoBannerConfig;
  chips: ActionChipItem[];
  pincodes: PincodeRecord[];
  support: SupportConfig;
}
