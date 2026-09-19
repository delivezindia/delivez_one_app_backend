export const PRICING_VERSION = '2026-09-07.1';

// 7 Service Options from Screens 01 & 02
export const courierServices = Object.freeze({
  HOME_TO_AIRPORT: {
    id: 'HOME_TO_AIRPORT',
    title: 'Home to Airport',
    description: 'We pick up your luggage from your home and deliver it safely to the airport on time.',
    badge: 'Airport Transfer',
    icon: 'home-airport',
    pickupType: 'Home',
    deliveryType: 'Airport',
    available: true,
  },
  AIRPORT_TO_HOME: {
    id: 'AIRPORT_TO_HOME',
    title: 'Airport to Home',
    description: 'We pick up your luggage from the airport and deliver it safely to your home.',
    badge: 'Airport Pickup',
    icon: 'airport-home',
    pickupType: 'Airport',
    deliveryType: 'Home',
    available: true,
  },
  HOTEL_TO_AIRPORT: {
    id: 'HOTEL_TO_AIRPORT',
    title: 'Hotel to Airport',
    description: 'We pick up your luggage from your hotel and deliver it safely to the airport.',
    badge: 'Hotel Checkout Transfer',
    icon: 'hotel-airport',
    pickupType: 'Hotel',
    deliveryType: 'Airport',
    available: true,
  },
  AIRPORT_TO_HOTEL: {
    id: 'AIRPORT_TO_HOTEL',
    title: 'Airport to Hotel',
    description: 'We pick up your luggage from the airport and deliver it safely to your hotel.',
    badge: 'Hotel Check-in Transfer',
    icon: 'airport-hotel',
    pickupType: 'Airport',
    deliveryType: 'Hotel',
    available: true,
  },
  HOTEL_TO_HOME: {
    id: 'HOTEL_TO_HOME',
    title: 'Hotel to Home',
    description: 'We pick up your luggage from the hotel and deliver it safely to your home.',
    badge: 'Doorstep Delivery',
    icon: 'hotel-home',
    pickupType: 'Hotel',
    deliveryType: 'Home',
    available: true,
  },
  HOME_TO_HOTEL: {
    id: 'HOME_TO_HOTEL',
    title: 'Home to Hotel',
    description: 'We pick up your luggage from your home and deliver it safely to your hotel.',
    badge: 'Luggage Transfer',
    icon: 'home-hotel',
    pickupType: 'Home',
    deliveryType: 'Hotel',
    available: true,
  },
  MULTI_STOP: {
    id: 'MULTI_STOP',
    title: 'Multi-Stop Luggage Transfer',
    description: 'We pick up your luggage and deliver it across multiple stops as per your travel plan.',
    badge: 'Flexible Itinerary',
    icon: 'multi-stop',
    pickupType: 'Home',
    deliveryType: 'Hotel',
    available: true,
  },
});

export type CourierServiceOptionKey = keyof typeof courierServices;

// 16 Add-ons from Screens 15 & 16
export const courierAddons = Object.freeze([
  {
    id: 'secure_tag',
    number: 1,
    title: 'Secure Luggage Tag',
    description: 'Durable tag with unique ID',
    price: 29,
    category: 'PROTECTION',
    popular: true,
  },
  {
    id: 'tamper_seal',
    number: 2,
    title: 'Tamper-evident Seal',
    description: 'Seal to ensure your luggage remains intact',
    price: 29,
    category: 'PROTECTION',
    popular: true,
  },
  {
    id: 'wrapping',
    number: 3,
    title: 'Wrapping Service',
    description: 'Protects against dust, moisture & scratch',
    price: 49,
    category: 'PROTECTION',
  },
  {
    id: 'priority_delivery',
    number: 4,
    title: 'Priority Express Delivery',
    description: 'Faster delivery with priority handling',
    price: 99,
    category: 'SPEED',
  },
  {
    id: 'airport_checkin',
    number: 5,
    title: 'Airport Baggage Check-in Support',
    description: 'Fast-track check-in & handling at counter',
    price: 79,
    category: 'AIRPORT',
  },
  {
    id: 'hotel_coordination',
    number: 6,
    title: 'Hotel Coordination',
    description: 'We coordinate with hotel staff on your behalf',
    price: 79,
    category: 'HOTEL',
  },
  {
    id: 'extra_waiting',
    number: 7,
    title: 'Extra Waiting Time',
    description: 'Additional waiting buffer at pickup/delivery',
    price: 49,
    category: 'CONVENIENCE',
  },
  {
    id: 'fragile_handling',
    number: 8,
    title: 'Fragile Item Handling',
    description: 'Special care for fragile & delicate items',
    price: 59,
    category: 'PROTECTION',
  },
  {
    id: 'insurance',
    number: 9,
    title: 'Insurance Coverage',
    description: 'Financial protection for complete peace of mind',
    price: 129,
    category: 'PROTECTION',
  },
  {
    id: 'photo_pickup',
    number: 10,
    title: 'Photo Proof at Pickup',
    description: 'Photo verification captured when we pick up',
    price: 39,
    category: 'PROOF',
  },
  {
    id: 'photo_delivery',
    number: 11,
    title: 'Photo Proof at Delivery',
    description: 'Photo proof when we deliver to recipient',
    price: 39,
    category: 'PROOF',
    popular: true,
  },
  {
    id: 'otp_verification',
    number: 12,
    title: 'OTP Verification',
    description: 'Secure OTP verification at handover',
    price: 29,
    category: 'SECURITY',
  },
  {
    id: 'digital_signature',
    number: 13,
    title: 'Digital Signature',
    description: 'Digital signature captured at destination',
    price: 29,
    category: 'SECURITY',
  },
  {
    id: 'video_proof',
    number: 14,
    title: 'Video Proof of Inspection',
    description: 'End-to-end video proof of luggage condition',
    price: 99,
    category: 'PROOF',
  },
  {
    id: 'dedicated_support',
    number: 15,
    title: 'Premium 24/7 Dedicated Support',
    description: '24/7 priority luggage concierge agent',
    price: 149,
    category: 'SUPPORT',
  },
  {
    id: 'porter_assistance',
    number: 16,
    title: 'Porter Assistance',
    description: 'Help with luggage carrying at pickup/destination',
    price: 69,
    category: 'CONVENIENCE',
  },
]);

// Luggage Protection Sub-Category (Screens 17 & 18)
export const luggageProtectionAddons = Object.freeze([
  {
    id: 'prot_tamper_tag',
    title: 'Tamper-proof Tag',
    price: 99,
    description: 'High-security, tamper-proof tag with unique ID for safe tracking.',
    features: ['Unique ID', 'Tamper Evident', 'Trackable'],
  },
  {
    id: 'prot_lock_strap',
    title: 'Secure Lock Strap',
    price: 149,
    description: 'Heavy-duty strap with combination lock for extra security.',
    features: ['Strong Strap', '3-Digit Lock', 'Reusable'],
  },
  {
    id: 'prot_waterproof_wrap',
    title: 'Waterproof Wrap',
    price: 129,
    description: 'Protects luggage from rain, dust, spills and dirt.',
    features: ['Waterproof', 'Dustproof', 'Tear-resistant'],
  },
  {
    id: 'prot_fragile_handling',
    title: 'Premium Fragile Handling',
    price: 199,
    description: 'Special handling for delicate or fragile items.',
    features: ['Extra Care', 'Soft Handling', 'Priority'],
  },
  {
    id: 'prot_rfid_tag',
    title: 'RFID Baggage Tag',
    price: 249,
    description: 'Smart RFID tag for real-time tracking and enhanced visibility.',
    features: ['RFID Enabled', 'Real-time Tracking', 'Secure'],
  },
]);

// Airport Assistance Sub-Category (Screens 19 & 20)
export const airportAssistanceAddons = Object.freeze([
  {
    id: 'air_meet_assist',
    title: 'Meet & Assist',
    price: 499,
    description: 'Our representative will meet you at the airport and assist throughout your journey.',
    features: ['Personal Greeting', 'Guided Assistance', 'Hassle-free'],
  },
  {
    id: 'air_queue_support',
    title: 'Queue Support',
    price: 399,
    description: 'Get priority help at security, immigration or any other queue.',
    features: ['Priority Queue', 'Time Saver', 'Less Stress'],
  },
  {
    id: 'air_porter_help',
    title: 'Porter Help',
    price: 349,
    description: 'Professional porter to help with your luggage at the airport.',
    features: ['Luggage Handling', 'Trolley Support', 'Reliable'],
  },
  {
    id: 'air_fast_track_buggy',
    title: 'Fast Track Buggy',
    price: 399,
    description: 'Save time with a buggy transfer to your gate or check-in counter.',
    features: ['Priority Handling', 'Faster Transfer', 'Safe'],
  },
  {
    id: 'air_checkin_coord',
    title: 'Check-in Support Coordination',
    price: 499,
    description: 'Assistance with check-in process including documents and baggage.',
    features: ['Document Check', 'Baggage Support', 'Smooth Check-in'],
  },
]);

// 1. Luggage Types (Screen 13)
export const luggageTypes = Object.freeze([
  { id: 'SUITCASE_TROLLEY', title: 'Suitcase / Trolley' },
  { id: 'BACKPACK_DUFFEL', title: 'Backpack / Duffel Bag' },
  { id: 'BOX_CARTON', title: 'Box / Carton' },
  { id: 'SPORTS_EQUIPMENT', title: 'Sports Equipment' },
]);

// 2. Luggage Sizes (Screen 13)
export const luggageSizes = Object.freeze([
  { id: 'SMALL', title: 'Small', subtitle: 'Up to 55 cm' },
  { id: 'MEDIUM', title: 'Medium', subtitle: '56–75 cm' },
  { id: 'LARGE', title: 'Large', subtitle: 'Above 75 cm' },
]);

// 3. Time Slots (Screen 21)
export const pickupTimeSlots = Object.freeze([
  '8:00 – 10:00 AM',
  '10:00 – 12:00 PM',
  '12:00 – 2:00 PM',
  '2:00 – 4:00 PM',
]);

// 4. Delivery Deadlines (Screen 21)
export const deliveryDeadlines = Object.freeze([
  'Before 4:00 PM',
  'Before 6:00 PM',
  'End of Day',
]);

// 5. Delivery Speeds (Screen 22)
export const deliverySpeeds = Object.freeze([
  {
    id: 'STANDARD',
    title: 'Standard',
    desc: 'Reliable delivery within the day',
    priceTag: 'Included',
    price: 0,
  },
  {
    id: 'EXPRESS',
    title: 'Express',
    desc: 'Faster delivery within hours',
    priceTag: '+ ₹499',
    price: 499,
  },
  {
    id: 'PRECISE_TIME',
    title: 'Precise Time',
    desc: 'Deliver at your exact time',
    priceTag: '+ ₹699',
    price: 699,
  },
  {
    id: 'SCHEDULE_LATER',
    title: 'Schedule Later',
    desc: 'Deliver on a future date',
    priceTag: '+ ₹299',
    price: 299,
  },
]);

// 6. Payment Methods (Screen 25)
export const courierPaymentMethods = Object.freeze([
  {
    id: 'DELIVEZ_WALLET',
    title: 'Delivez Money (Wallet)',
    badge: 'Preferred',
    recommended: true,
    availableBalance: 1245.60,
  },
  { id: 'UPI', title: 'UPI' },
  { id: 'CARD', title: 'Credit / Debit Card' },
  { id: 'NET_BANKING', title: 'Net Banking' },
  { id: 'DIGITAL_WALLET', title: 'Digital Wallets (Paytm / PhonePe / G Pay)' },
  { id: 'CASH', title: 'Cash', note: 'Not recommended for airport-linked bookings' },
]);

// Backward-compatible types for legacy queries
export const serviceTypes = Object.freeze({
  BIKE_PRIORITY: {
    title: 'Bike Priority Delivery',
    description: 'Priority local delivery for urgent, time-sensitive packages.',
    eta: '1 - 3 hours',
    baseCharge: 120,
    available: true,
  },
  SAME_DAY: {
    title: 'Same Day Delivery',
    description: 'Delivery by the end of the same day within supported city limits.',
    eta: 'By 8 PM today',
    baseCharge: 150,
    available: true,
  },
  SURFACE_EXPRESS: {
    title: 'Surface Express',
    description: 'Affordable road delivery for non-urgent packages.',
    eta: '2 - 3 business days',
    baseCharge: 100,
    available: true,
  },
  NEXT_DAY: {
    title: 'Next Day Delivery',
    description: 'Cost-effective delivery by the end of the next business day.',
    eta: 'Next business day',
    baseCharge: 100,
    available: true,
  },
});

export const parcelSizes = Object.freeze({
  SMALL: { title: 'Small', description: 'Up to 2 kg' },
  MEDIUM: { title: 'Medium', description: '2 - 10 kg' },
  LARGE: { title: 'Large', description: '10 - 25 kg' },
});

export const packagingTypes = Object.freeze({
  STANDARD: { title: 'Delivez Standard Packaging', charge: 0 },
});

export const contentCategories = Object.freeze({
  CLOTHING_ACCESSORIES: { title: 'Clothing & Accessories' },
  DOCUMENTS: { title: 'Documents' },
  ELECTRONICS: { title: 'Electronics' },
  OTHERS: { title: 'Others' },
});

export const insuranceTypes = Object.freeze({
  FULL: { title: 'Insure Shipment', ratePercent: 0.75 },
  BASIC: { title: 'Basic Coverage', ratePercent: 0 },
  NONE: { title: 'No Insurance', ratePercent: 0 },
});

export const paymentMethods = courierPaymentMethods;


// ============================================================================
// COMPREHENSIVE COURIER DELIVERY SPECIFICATIONS (Matching Mobile Flutter App)
// ============================================================================

// 1. Package Content Categories (8 categories from Screen 1)
export const courierPackageCategories = Object.freeze([
  {
    id: 'DOCUMENTS',
    apiCode: 'DOCUMENTS',
    title: 'Documents',
    subtitle: 'Papers, files, certificates, books, etc.',
    icon: 'description_outlined',
    bgColor: '#FFF9E6',
    bgColorHex: '0xFFFFF9E6',
    iconColor: '#D97706',
    iconColorHex: '0xFFD97706',
  },
  {
    id: 'ELECTRONICS',
    apiCode: 'ELECTRONICS',
    title: 'Electronics',
    subtitle: 'Mobile, laptop, gadgets, accessories, etc.',
    icon: 'smartphone_outlined',
    bgColor: '#FFF1F2',
    bgColorHex: '0xFFFFF1F2',
    iconColor: '#E11D48',
    iconColorHex: '0xFFE11D48',
  },
  {
    id: 'CLOTHING_APPAREL',
    apiCode: 'CLOTHING_APPAREL',
    title: 'Clothing & Apparel',
    subtitle: 'Clothes, shoes, cap, fashion items, etc.',
    icon: 'checkroom_outlined',
    bgColor: '#EEF2FF',
    bgColorHex: '0xFFEEF2FF',
    iconColor: '#4F46E5',
    iconColorHex: '0xFF4F46E5',
  },
  {
    id: 'GIFTS_TOYS',
    apiCode: 'GIFTS_TOYS',
    title: 'Gifts & Toys',
    subtitle: 'Gift items, toys, decorative items, etc.',
    icon: 'card_giftcard_outlined',
    bgColor: '#FFFDF0',
    bgColorHex: '0xFFFFFDF0',
    iconColor: '#D97706',
    iconColorHex: '0xFFD97706',
  },
  {
    id: 'HEALTH_MEDICINE',
    apiCode: 'HEALTH_MEDICINE',
    title: 'Health & Medicine',
    subtitle: 'Medicines, supplements, medical supplies, etc.',
    icon: 'medication_outlined',
    bgColor: '#ECFDF5',
    bgColorHex: '0xFFECFDF5',
    iconColor: '#059669',
    iconColorHex: '0xFF059669',
  },
  {
    id: 'HOUSEHOLD_ITEMS',
    apiCode: 'HOUSEHOLD_ITEMS',
    title: 'Household Items',
    subtitle: 'Kitchenware, home decor, daily use items, etc.',
    icon: 'soup_kitchen_outlined',
    bgColor: '#FFF7ED',
    bgColorHex: '0xFFFFF7ED',
    iconColor: '#EA580C',
    iconColorHex: '0xFFEA580C',
  },
  {
    id: 'COMMERCIAL_GOODS',
    apiCode: 'COMMERCIAL_GOODS',
    title: 'Commercial Goods',
    subtitle: 'Samples, parts, raw materials, products, etc.',
    icon: 'inventory_2_outlined',
    bgColor: '#F0F9FF',
    bgColorHex: '0xFFF0F9FF',
    iconColor: '#0284C7',
    iconColorHex: '0xFF0284C7',
  },
  {
    id: 'OTHER',
    apiCode: 'OTHER',
    title: 'Others',
    subtitle: 'Other items not listed above.',
    icon: 'more_horiz_outlined',
    bgColor: '#F9FAFB',
    bgColorHex: '0xFFF9FAFB',
    iconColor: '#4B5563',
    iconColorHex: '0xFF4B5563',
  },
]);

// 2. Box Types by Weight (Screens 3 & 4)
export const courierBoxTypesByWeight: Record<string, Array<{
  id: string;
  title: string;
  dimensions: string;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  tag: string;
  capacity: string;
}>> = Object.freeze({
  '10 Kg': [
    {
      id: 'box_10kg_small',
      title: 'Small Box',
      dimensions: '30 × 20 × 20 cm',
      lengthCm: 30.0,
      widthCm: 20.0,
      heightCm: 20.0,
      tag: 'Best for Documents, Books, Electronics',
      capacity: 'Up to 10 Kg',
    },
    {
      id: 'box_10kg_medium',
      title: 'Medium Box',
      dimensions: '30 × 30 × 25 cm',
      lengthCm: 30.0,
      widthCm: 30.0,
      heightCm: 25.0,
      tag: 'Best for Clothing, Accessories, Home Items',
      capacity: 'Up to 10 Kg',
    },
    {
      id: 'box_10kg_large',
      title: 'Large Box',
      dimensions: '40 × 30 × 30 cm',
      lengthCm: 40.0,
      widthCm: 30.0,
      heightCm: 30.0,
      tag: 'Best for Shoes, Helmets, Small Appliances',
      capacity: 'Up to 10 Kg',
    },
  ],
  '15 Kg': [
    {
      id: 'box_15kg_medium',
      title: 'Medium Box',
      dimensions: '35 × 28 × 32 cm',
      lengthCm: 35.0,
      widthCm: 28.0,
      heightCm: 32.0,
      tag: 'Best for Clothes, Books, Home Items',
      capacity: 'Up to 15 Kg',
    },
    {
      id: 'box_15kg_large',
      title: 'Large Box',
      dimensions: '40 × 30 × 35 cm',
      lengthCm: 40.0,
      widthCm: 30.0,
      heightCm: 35.0,
      tag: 'Best for Appliances, Toys, Accessories',
      capacity: 'Up to 15 Kg',
    },
    {
      id: 'box_15kg_xlarge',
      title: 'Extra Large Box',
      dimensions: '45 × 32 × 40 cm',
      lengthCm: 45.0,
      widthCm: 32.0,
      heightCm: 40.0,
      tag: 'Best for Kitchen Items, Medium Appliances',
      capacity: 'Up to 15 Kg',
    },
  ],
  '25 Kg': [
    {
      id: 'box_25kg_medium',
      title: 'Medium Box',
      dimensions: '45 × 35 × 40 cm',
      lengthCm: 45.0,
      widthCm: 35.0,
      heightCm: 40.0,
      tag: 'Best for Clothing, Shoes, Books, Home Items',
      capacity: 'Up to 25 Kg',
    },
    {
      id: 'box_25kg_large',
      title: 'Large Box',
      dimensions: '50 × 40 × 45 cm',
      lengthCm: 50.0,
      widthCm: 40.0,
      heightCm: 45.0,
      tag: 'Best for Appliances, Toys, Accessories, Helmet',
      capacity: 'Up to 25 Kg',
    },
    {
      id: 'box_25kg_xlarge',
      title: 'Extra Large Box',
      dimensions: '60 × 45 × 50 cm',
      lengthCm: 60.0,
      widthCm: 45.0,
      heightCm: 50.0,
      tag: 'Best for Large Appliances, Bulk Items, Luggage',
      capacity: 'Up to 25 Kg',
    },
  ],
});

export const getBoxesForWeight = (weight: string) => {
  return courierBoxTypesByWeight[weight] || [];
};

// 3. Parcel Dimensions & Cards
export const courierParcelDimensions = Object.freeze({
  Small: { length: 30, width: 20, height: 10 },
  Medium: { length: 45, width: 35, height: 30 },
  Large: { length: 60, width: 45, height: 45 },
});

export const courierParcelTypes = Object.freeze([
  {
    id: 'SMALL',
    title: 'Small',
    weight: 'Up to 2 kg',
    dimensions: '30 × 20 × 10',
    lengthCm: 30,
    widthCm: 20,
    heightCm: 10,
    isCustom: false,
  },
  {
    id: 'MEDIUM',
    title: 'Medium',
    weight: '2 - 10 kg',
    dimensions: '45 × 35 × 30',
    lengthCm: 45,
    widthCm: 35,
    heightCm: 30,
    isCustom: false,
  },
  {
    id: 'LARGE',
    title: 'Large',
    weight: '10 - 25 kg',
    dimensions: '60 × 45 × 45',
    lengthCm: 60,
    widthCm: 45,
    heightCm: 45,
    isCustom: false,
  },
  {
    id: 'CUSTOM',
    title: 'Custom',
    weight: 'Enter size',
    dimensions: 'Define',
    isCustom: true,
  },
]);

// 4. Service Type Options (Local Delivery & Intercity Delivery)
export const courierLocalOptions = Object.freeze([
  {
    id: 'BIKE_PRIORITY',
    title: 'Bike Priority Delivery',
    badge: 'FASTEST',
    badgeColor: '#EF4444',
    badgeColorHex: '0xFFEF4444',
    badgeTextColor: '#FFFFFF',
    badgeTextColorHex: '0xFFFFFFFF',
    description: 'Lightning fast delivery by bike for urgent and time-sensitive shipments.',
    tags: [
      { icon: 'bolt', label: 'Fastest' },
      { icon: 'location_on_outlined', label: 'Real-time Tracking' },
      { icon: 'verified_user_outlined', label: 'High Priority' },
    ],
    deliveryTime: 'Delivery in 1 – 3 hours',
    price: '₹120',
    basePrice: 120.0,
    icon: 'two_wheeler',
  },
  {
    id: 'SAME_DAY',
    title: 'Same Day Delivery',
    badge: 'TODAY',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Delivered on the same day within city limits.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Same Day' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery by 8 PM today',
    price: '₹150',
    basePrice: 150.0,
    icon: 'local_shipping_outlined',
  },
  {
    id: 'HYBRID_DRONE',
    title: 'Hybrid Drone Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Next-gen delivery using drone & road hybrid network.',
    tags: [
      { icon: 'eco_outlined', label: 'Eco-friendly' },
      { icon: 'rocket_launch_outlined', label: 'Innovative' },
      { icon: 'verified_user_outlined', label: 'Secure' },
    ],
    deliveryTime: 'Delivery in 30 – 90 mins (if eligible)',
    price: '₹200',
    basePrice: 200.0,
    icon: 'flight_takeoff',
  },
  {
    id: 'NEXT_DAY_LOCAL',
    title: 'Next Day Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Cost-effective delivery for non-urgent shipments.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Next Day' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
    ],
    deliveryTime: 'Delivery by end of next day',
    price: '₹100',
    basePrice: 100.0,
    icon: 'local_shipping_sharp',
  },
]);

export const courierIntercityOptions = Object.freeze([
  {
    id: 'STANDARD_DELIVERY',
    title: 'Standard Delivery',
    badge: 'MOST POPULAR',
    badgeColor: '#EF4444',
    badgeColorHex: '0xFFEF4444',
    badgeTextColor: '#FFFFFF',
    badgeTextColorHex: '0xFFFFFFFF',
    description: 'Reliable delivery within 2 – 3 business days for non-urgent shipments.',
    tags: [
      { icon: 'verified_user_outlined', label: 'Reliable' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery in 2 – 3 business days',
    price: '₹100',
    basePrice: 100.0,
    icon: 'local_shipping',
  },
  {
    id: 'EXPRESS_DELIVERY',
    title: 'Express Delivery',
    badge: 'FAST',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Priority delivery within city or across major routes with faster transit.',
    tags: [
      { icon: 'bolt', label: 'Fast Delivery' },
      { icon: 'verified_user_outlined', label: 'High Priority' },
      { icon: 'home_outlined', label: 'Doorstep Delivery' },
    ],
    deliveryTime: 'Delivery in 24 – 48 hours',
    price: '₹180',
    basePrice: 180.0,
    icon: 'flash_on',
  },
  {
    id: 'PRECISE_TIME',
    title: 'Precise Time Delivery',
    badge: 'ON TIME, EVERY TIME',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Guaranteed delivery at your chosen exact time slot.',
    tags: [
      { icon: 'access_time', label: 'Time Guarantee' },
      { icon: 'calendar_today_outlined', label: 'Time Slot Choice' },
      { icon: 'verified_user_outlined', label: 'Priority Handling' },
    ],
    deliveryTime: 'Delivery at your selected time',
    price: '₹250',
    basePrice: 250.0,
    icon: 'edit_calendar_outlined',
  },
  {
    id: 'SCHEDULE_DELIVERY',
    title: 'Schedule Delivery',
    badge: null,
    badgeColor: null,
    badgeColorHex: null,
    badgeTextColor: null,
    badgeTextColorHex: null,
    description: 'Choose your preferred date and time for pickup and delivery.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Pick a Date' },
      { icon: 'access_time', label: 'Pick a Time' },
      { icon: 'notifications_none', label: 'Advance Booking' },
    ],
    deliveryTime: 'Deliver on your selected date & time',
    price: '₹130',
    basePrice: 130.0,
    icon: 'calendar_month',
  },
  {
    id: 'NEXT_DAY_INTERCITY',
    title: 'Next Day Delivery',
    badge: 'NEXT BUSINESS DAY',
    badgeColor: '#FEE2E2',
    badgeColorHex: '0xFFFEE2E2',
    badgeTextColor: '#EF4444',
    badgeTextColorHex: '0xFFEF4444',
    description: 'Cost-effective delivery with guaranteed next business day transit.',
    tags: [
      { icon: 'calendar_today_outlined', label: 'Next Business Day' },
      { icon: 'savings_outlined', label: 'Affordable' },
      { icon: 'verified_user_outlined', label: 'Reliable' },
    ],
    deliveryTime: 'Delivery by next business day',
    price: '₹120',
    basePrice: 120.0,
    icon: 'local_shipping_sharp',
  },
]);

// 5. Drop Options (Self Pickup & Self Drop)
export const courierDropOptions = Object.freeze([
  {
    index: 0,
    id: 'SELF_PICKUP',
    title: 'Self Pickup',
    badge: 'Save Time',
    price: '₹50',
    basePrice: 50.0,
    desc: 'You drop the parcel at our nearest Delivez location.',
    description: 'You drop the parcel at our nearest Delivez location.',
    tags: ['Quick Drop', 'Lower Cost'],
    icon: 'directions_run_outlined',
  },
  {
    index: 1,
    id: 'SELF_DROP',
    title: 'Self Drop',
    badge: 'Save Time',
    price: '₹40',
    basePrice: 40.0,
    desc: 'You drop the parcel at our destination hub.',
    description: 'You drop the parcel at our destination hub.',
    tags: ['Flexible', 'Lower Cost'],
    icon: 'storefront_outlined',
  },
]);

// 6. Insurance Options
export const courierInsuranceOptions = Object.freeze([
  {
    index: 0,
    id: 'INSURE_SHIPMENT',
    apiCode: 'INSURE_SHIPMENT',
    title: 'Insure Shipment',
    subtitle: 'Get full protection for your shipment.\nRecommended for valuable items.',
    description: 'Get full protection for your shipment.\nRecommended for valuable items.',
    icon: 'shield_outlined',
    isRecommended: true,
    ratePercent: 0.75,
  },
  {
    index: 1,
    id: 'BASIC_COVERAGE',
    apiCode: 'BASIC_COVERAGE',
    title: 'Basic Coverage',
    subtitle: 'Limited coverage as per carrier terms.\nCoverage up to ₹10,000',
    description: 'Limited coverage as per carrier terms.\nCoverage up to ₹10,000',
    icon: 'gpp_maybe_outlined',
    coverageLimit: 10000,
    isRecommended: false,
    ratePercent: 0,
  },
  {
    index: 2,
    id: 'NO_INSURANCE',
    apiCode: 'NO_INSURANCE',
    title: 'No Insurance',
    subtitle: 'I understand the risk of loss or damage\nand do not want insurance.',
    description: 'I understand the risk of loss or damage\nand do not want insurance.',
    icon: 'gpp_bad_outlined',
    coverageLimit: 0,
    isRecommended: false,
    ratePercent: 0,
  },
]);

export const getCourierDeliveryConfig = () => ({
  categories: courierPackageCategories,
  packageCategories: courierPackageCategories,
  package_categories: courierPackageCategories,
  boxTypes: courierBoxTypesByWeight,
  box_types: courierBoxTypesByWeight,
  parcelDimensions: courierParcelDimensions,
  parcel_dimensions: courierParcelDimensions,
  parcelTypes: courierParcelTypes,
  parcel_types: courierParcelTypes,
  localOptions: courierLocalOptions,
  local_options: courierLocalOptions,
  intercityOptions: courierIntercityOptions,
  intercity_options: courierIntercityOptions,
  serviceTypes: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  deliveryServices: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  delivery_services: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  dropOptions: courierDropOptions,
  drop_options: courierDropOptions,
  selfServiceOptions: courierDropOptions,
  self_service_options: courierDropOptions,
  insuranceOptions: courierInsuranceOptions,
  insurance_options: courierInsuranceOptions,
});


export const getCourierOptions = () => ({
  pricingVersion: PRICING_VERSION,
  currency: 'INR',
  // Flutter Mobile App Comprehensive Specifications
  categories: courierPackageCategories,
  packageCategories: courierPackageCategories,
  package_categories: courierPackageCategories,
  boxTypes: courierBoxTypesByWeight,
  box_types: courierBoxTypesByWeight,
  parcelDimensions: courierParcelDimensions,
  parcel_dimensions: courierParcelDimensions,
  parcelTypes: courierParcelTypes,
  parcel_types: courierParcelTypes,
  localOptions: courierLocalOptions,
  local_options: courierLocalOptions,
  intercityOptions: courierIntercityOptions,
  intercity_options: courierIntercityOptions,
  deliveryServices: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  delivery_services: {
    local: courierLocalOptions,
    intercity: courierIntercityOptions,
  },
  dropOptions: courierDropOptions,
  drop_options: courierDropOptions,
  selfServiceOptions: courierDropOptions,
  self_service_options: courierDropOptions,
  insuranceOptions: courierInsuranceOptions,
  insurance_options: courierInsuranceOptions,
  services: Object.values(courierServices),
  addons: courierAddons,
  luggageProtectionAddons,
  airportAssistanceAddons,
  luggageTypes,
  luggageSizes,
  pickupTimeSlots,
  deliveryDeadlines,
  deliverySpeeds,
  paymentMethods: courierPaymentMethods,
  serviceTypes: Object.entries(serviceTypes).map(([id, val]) => ({ id, ...val })),
  parcelSizes: Object.entries(parcelSizes).map(([id, val]) => ({ id, ...val })),
  packagingTypes: Object.entries(packagingTypes).map(([id, val]) => ({ id, ...val })),
  contentCategories: Object.entries(contentCategories).map(([id, val]) => ({ id, ...val })),
  insuranceTypes: Object.entries(insuranceTypes).map(([id, val]) => ({ id, ...val })),
  limits: {
    maxWeightPerBagKg: 32,
    maxDimensionSumCm: 158,
    idealBookingBufferHours: 4,
  },
});


export const PROMO_CODES: Record<string, { discountPercent: number; maxDiscount: number }> = {
  DELIVEZ10: { discountPercent: 10, maxDiscount: 235 },
  WELCOME50: { discountPercent: 15, maxDiscount: 300 },
};

export const getAddonsList = () => [
  ...courierAddons,
  ...luggageProtectionAddons,
  ...airportAssistanceAddons,
];
