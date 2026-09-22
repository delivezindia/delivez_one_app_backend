import type {
  CompanyStatItem,
  PillarItem,
  ValueItem,
  WhatWeDoItem,
  MilestoneItem,
  NetworkHubItem,
  NetworkOverviewData,
} from './company-network.types.js';

export const ABOUT_DELIVEZ = {
  title: 'About Delivez',
  hero: {
    tagline: 'Delivez',
    headline: 'Moving a Smarter Tomorrow',
    description:
      'Delivez is a technology-driven logistics platform making deliveries simpler, faster and more reliable for everyone — individuals, businesses and communities.',
    icon: 'truck',
  },
  stats: [
    { value: '1M+', label: 'Happy Customers', icon: 'users' },
    { value: '25,000+', label: 'Business Partners', icon: 'briefcase' },
    { value: '220+', label: 'Cities & Towns', icon: 'map-pin' },
  ] as CompanyStatItem[],
  pillars: [
    { title: 'Reliable Deliveries', icon: 'truck' },
    { title: 'Secure Shipments', icon: 'shield' },
    { title: 'Trusted by Businesses', icon: 'users' },
    { title: 'A More Sustainable Future', icon: 'leaf' },
  ] as PillarItem[],
  purpose: {
    headline: 'Our Purpose',
    description:
      'To create a connected world through reliable, innovative and customer-centric logistics solutions.',
  },
  values: [
    { title: 'Customer First', icon: 'users' },
    { title: 'Innovation Always', icon: 'lightbulb' },
    { title: 'Integrity in Action', icon: 'shield-check' },
    { title: 'Sustainable Growth', icon: 'leaf' },
  ] as ValueItem[],
};

export const COMPANY_OVERVIEW = {
  title: 'Company Overview',
  hero: {
    tagline: 'Delivez',
    headline: "India's Next-Generation Logistics Platform",
    description: 'Connecting people, businesses and communities for a smarter tomorrow.',
    icon: 'building',
  },
  stats: [
    { value: '1M+', label: 'Happy Customers', icon: 'users' },
    { value: '25,000+', label: 'Business Partners', icon: 'box' },
    { value: '220+', label: 'Cities & Towns', icon: 'map-pin' },
    { value: '6+', label: 'Countries (and growing)', icon: 'globe' },
  ] as CompanyStatItem[],
  aboutSection: {
    title: 'About Delivez',
    description:
      'Delivez is a technology-driven logistics platform that simplifies shipping and delivery for individuals, businesses and communities. We combine innovation, reliable operations and a customer-first approach to build a more connected world.',
    videoStory: {
      title: 'Watch Our Story',
      duration: '2:15 mins',
      videoUrl: 'https://cdn.delivez.com/videos/delivez-story.mp4',
    },
  },
  whatWeDo: [
    {
      id: 'express',
      title: 'Express & Parcel Delivery',
      description: 'Fast, reliable and secure deliveries across India and beyond.',
      icon: 'box',
    },
    {
      id: 'warehousing',
      title: 'Warehousing & Fulfilment',
      description: 'End-to-end storage, fulfilment and inventory solutions.',
      icon: 'home',
    },
  ] as WhatWeDoItem[],
  journeyPreview: [
    { year: '1999', title: 'Journey Started', description: 'Founded with a mission to simplify logistics.' },
    { year: '2005', title: 'Regional Expansion', description: 'Expanded to major cities and built a stronger regional network.' },
    { year: '2010', title: 'Tech Adoption', description: 'Introduced tech tracking and smart operations.' },
  ],
  presence: {
    title: 'Our Presence',
    description: 'Delivering across India and expanding globally.',
    stats: [
      { value: '220+', label: 'Cities & Towns', icon: 'map-pin' },
      { value: '2,500+', label: 'Service Centres', icon: 'building' },
      { value: '25,000+', label: 'Delivery Partners', icon: 'users' },
      { value: '6+', label: 'Countries', icon: 'globe' },
    ],
  },
};

export const OUR_JOURNEY = {
  title: 'Our Journey',
  hero: {
    tagline: 'Delivez',
    headline:
      'From a bold beginning in 1999 to a trusted logistics platform today — built on innovation, people and customer trust.',
    badge: 'DELIVERING PROGRESS SINCE 1999',
  },
  milestones: [
    {
      year: '1999',
      title: 'The Beginning',
      description: 'Started our operations in 1999 with a simple goal — to make logistics more reliable and customer-focused.',
    },
    {
      year: '2005',
      title: 'Expanding Horizons',
      description: 'Extended our services across major cities, building a strong regional network and a growing customer base.',
    },
    {
      year: '2010',
      title: 'Embracing Technology',
      description: 'Invested in technology to enable real-time tracking, better visibility and smarter operations.',
    },
    {
      year: '2015',
      title: 'National Presence',
      description: 'Scaled operations across India with an extensive network of hubs, service centres and delivery partners.',
    },
    {
      year: '2020',
      title: 'A Stronger, Smarter Network',
      description: 'Enhanced our capabilities with automation, data-driven operations and a wider range of logistics solutions.',
    },
    {
      year: '2023',
      title: 'Customer-Centric Growth',
      description: 'Introduced new services for businesses and individuals, focused on speed, reliability and convenience.',
    },
    {
      year: 'Today & Beyond',
      title: 'Building a Smarter Tomorrow',
      description: 'Continuing to innovate, expand globally and create a more connected world through reliable, technology-driven logistics.',
    },
  ] as MilestoneItem[],
  footerCard: {
    title: 'A Journey Driven by People',
    description:
      'Our journey is powered by our customers, partners and team members who believe in a simpler, smarter and more connected future.',
    icon: 'users',
  },
};

export const NETWORK_OVERVIEW: NetworkOverviewData = {
  title: 'Our Network',
  subtitle: 'Our Network Hubs',
  tagline: 'Connecting Every Corner For a Brighter Tomorrow',
  description:
    'Our extensive network connects people, businesses and communities across India and beyond, enabling faster, safer and more reliable deliveries every day.',
  heroStats: [
    { value: '220+', label: 'Cities & Towns', icon: 'map-pin' },
    { value: '2,500+', label: 'Service Centres', icon: 'building' },
    { value: '25,000+', label: 'Delivery Partners', icon: 'users' },
    { value: '6+', label: 'Countries', icon: 'globe' },
    { value: '1M+', label: 'Deliveries Daily', icon: 'box' },
  ],
  networkNumbers: {
    citiesCount: '220+',
    serviceCentresCount: '2,500+',
    deliveryPartnersCount: '25,000+',
    pinCodesCount: '50,000+',
    serviceReliability: '99%',
  },
  highlights: [
    {
      title: 'Pan-India Coverage',
      description: 'From metros to remote locations',
      icon: 'truck',
    },
    {
      title: 'Multi-Modal Connectivity',
      description: 'Road, air and rail integration',
      icon: 'share-2',
    },
    {
      title: 'Strategic Hubs',
      description: 'Optimally located for faster transit',
      icon: 'building',
    },
    {
      title: 'Growing Globally',
      description: 'Expanding beyond India',
      icon: 'globe',
    },
  ],
  tabs: ['India Network', 'Global Network', 'Network Hubs'],
};

export const NETWORK_HUBS: NetworkHubItem[] = [
  {
    id: 'hub-del',
    name: 'Delhi (NCR)',
    type: 'National Hub',
    city: 'New Delhi',
    region: 'North',
    pincodeRange: '110001 - 110096',
    serviceReliability: '99.4%',
  },
  {
    id: 'hub-bom',
    name: 'Mumbai',
    type: 'National Hub',
    city: 'Mumbai',
    region: 'West',
    pincodeRange: '400001 - 400104',
    serviceReliability: '99.2%',
  },
  {
    id: 'hub-blr',
    name: 'Bengaluru',
    type: 'National Hub',
    city: 'Bengaluru',
    region: 'South',
    pincodeRange: '560001 - 560114',
    serviceReliability: '99.6%',
  },
  {
    id: 'hub-ccu',
    name: 'Kolkata',
    type: 'National Hub',
    city: 'Kolkata',
    region: 'East',
    pincodeRange: '700001 - 700157',
    serviceReliability: '98.9%',
  },
  {
    id: 'hub-maa',
    name: 'Chennai',
    type: 'Regional Hub',
    city: 'Chennai',
    region: 'South',
    pincodeRange: '600001 - 600132',
    serviceReliability: '99.1%',
  },
  {
    id: 'hub-hyd',
    name: 'Hyderabad',
    type: 'Regional Hub',
    city: 'Hyderabad',
    region: 'South',
    pincodeRange: '500001 - 500098',
    serviceReliability: '99.3%',
  },
  {
    id: 'hub-amd',
    name: 'Ahmedabad',
    type: 'Regional Hub',
    city: 'Ahmedabad',
    region: 'West',
    pincodeRange: '380001 - 380061',
    serviceReliability: '99.0%',
  },
  {
    id: 'hub-pnq',
    name: 'Pune',
    type: 'Regional Hub',
    city: 'Pune',
    region: 'West',
    pincodeRange: '411001 - 411062',
    serviceReliability: '99.1%',
  },
  {
    id: 'hub-jpr',
    name: 'Jaipur',
    type: 'Regional Hub',
    city: 'Jaipur',
    region: 'North',
    pincodeRange: '302001 - 302039',
    serviceReliability: '98.8%',
  },
  {
    id: 'hub-lko',
    name: 'Lucknow',
    type: 'Regional Hub',
    city: 'Lucknow',
    region: 'North',
    pincodeRange: '226001 - 226030',
    serviceReliability: '98.7%',
  },
];
