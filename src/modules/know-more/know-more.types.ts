export type ServiceCategory =
  | 'courier-delivery'
  | 'luggage-delivery'
  | 'confidential-delivery'
  | 'forgot-something'
  | 'return-pickup'
  | 'all';

export interface KnowMoreCard {
  id: string;
  serviceSlug: ServiceCategory;
  heading: string;
  description: string;
  images: string[];
  ctaText: string;
  ctaLink: string;
  badge?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKnowMoreCardInput {
  serviceSlug: ServiceCategory;
  heading: string;
  description: string;
  images: string[];
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateKnowMoreCardInput {
  serviceSlug?: ServiceCategory;
  heading?: string;
  description?: string;
  images?: string[];
  ctaText?: string;
  ctaLink?: string;
  badge?: string;
  order?: number;
  isActive?: boolean;
}
