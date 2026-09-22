export interface CompanyStatItem {
  value: string;
  label: string;
  icon: string;
}

export interface PillarItem {
  title: string;
  description?: string;
  icon: string;
}

export interface ValueItem {
  title: string;
  icon: string;
}

export interface WhatWeDoItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface MilestoneItem {
  year: string;
  title: string;
  description: string;
  imagePlaceholder?: string;
}

export interface NetworkHubItem {
  id: string;
  name: string;
  type: 'National Hub' | 'Regional Hub';
  city: string;
  region: 'North' | 'South' | 'West' | 'East';
  pincodeRange: string;
  serviceReliability: string;
}

export interface NetworkHighlightItem {
  title: string;
  description: string;
  icon: string;
}

export interface NetworkOverviewData {
  title: string;
  subtitle: string;
  tagline: string;
  description: string;
  heroStats: CompanyStatItem[];
  networkNumbers: {
    citiesCount: string;
    serviceCentresCount: string;
    deliveryPartnersCount: string;
    pinCodesCount: string;
    serviceReliability: string;
  };
  highlights: NetworkHighlightItem[];
  tabs: string[];
}
