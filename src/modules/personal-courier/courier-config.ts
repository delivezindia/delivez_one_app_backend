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

export const getCourierOptions = () => ({
  pricingVersion: PRICING_VERSION,
  currency: 'INR',
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
