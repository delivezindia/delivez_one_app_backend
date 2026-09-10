export interface MoreServiceItem {
  id: string;
  appSlug: string;
  appName: string;
  tagline: string;
  description: string;
  iconUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  badge: string;
  features: string[];
  playStoreUrl: string;
  appStoreUrl: string;
  deepLinkScheme: string;
  rating: number;
  downloads: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMoreServiceInput {
  appSlug?: string;
  appName: string;
  tagline?: string;
  description: string;
  iconUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  badge?: string;
  features?: string[] | string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  deepLinkScheme?: string;
  rating?: number;
  downloads?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateMoreServiceInput {
  appSlug?: string;
  appName?: string;
  tagline?: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  badge?: string;
  features?: string[] | string;
  playStoreUrl?: string;
  appStoreUrl?: string;
  deepLinkScheme?: string;
  rating?: number;
  downloads?: string;
  order?: number;
  isActive?: boolean;
}
