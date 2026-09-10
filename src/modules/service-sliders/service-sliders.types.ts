export type ServiceSlug =
  | 'courier-delivery'
  | 'luggage-delivery'
  | 'confidential-delivery'
  | 'forgot-something'
  | 'return-pickup';

export interface ServiceImageSlider {
  serviceSlug: ServiceSlug;
  serviceName: string;
  images: string[];
  isActive: boolean;
  updatedAt: string;
}

export interface UpdateServiceImageSliderInput {
  images?: string[];
  isActive?: boolean;
}
