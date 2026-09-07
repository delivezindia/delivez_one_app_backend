export interface ForgotSomethingCategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ForgotSomethingLocationTypeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ForgotSomethingHandoverConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ForgotSomethingSpeedConfig {
  id: string;
  name: string;
  eta: string;
  priceFormatted: string;
  baseFee: number;
  icon: string;
  recommended?: boolean;
}

export interface ForgotSomethingSecurityToggleConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultChecked: boolean;
  fee: number;
}

export const ITEM_CATEGORIES: ForgotSomethingCategoryConfig[] = [
  { id: 'KEYS', name: 'Keys', description: 'House, car, or office keys', icon: 'Key' },
  { id: 'LAPTOP', name: 'Laptop', description: 'Work/personal laptop or tablet', icon: 'Laptop' },
  { id: 'PHONE', name: 'Phone', description: 'Smartphone or mobile device', icon: 'Smartphone' },
  { id: 'DOCUMENTS', name: 'Documents', description: 'Important papers, certificates, files', icon: 'FileText' },
  { id: 'BAG', name: 'Bag', description: 'Backpack, handbag, briefcase', icon: 'ShoppingBag' },
  { id: 'CHARGER', name: 'Charger', description: 'Phone/laptop charger, power bank', icon: 'Plug' },
  { id: 'WALLET', name: 'Wallet', description: 'Wallet, purse, cardholder', icon: 'Wallet' },
  { id: 'GLASSES', name: 'Glasses', description: 'Spectacles, sunglasses', icon: 'Glasses' },
  { id: 'CLOTHING', name: 'Clothing', description: 'Jacket, coat, suit, clothes', icon: 'Shirt' },
  { id: 'HEADPHONES', name: 'Headphones', description: 'Earphones, earbuds, headphones', icon: 'Headphones' },
  { id: 'BOOK_DIARY', name: 'Book / Diary', description: 'Notebook, journal, textbooks', icon: 'BookOpen' },
  { id: 'OTHER', name: 'Other Item', description: 'Any other item you forgot', icon: 'Package' },
];

export const LOCATION_TYPES: ForgotSomethingLocationTypeConfig[] = [
  { id: 'HOME', name: 'At Home', description: 'From your home', icon: 'Home' },
  { id: 'OFFICE', name: 'At Work / Office', description: 'From your office', icon: 'Building2' },
  { id: 'HOTEL', name: 'At a Hotel', description: 'From your hotel', icon: 'Hotel' },
  { id: 'RESTAURANT', name: 'At a Restaurant', description: 'From a restaurant / café', icon: 'Utensils' },
  { id: 'VEHICLE', name: 'In a Vehicle', description: 'From taxi, cab or personal vehicle', icon: 'Car' },
  { id: 'SOMEONES_PLACE', name: "At Someone's Place", description: 'From friend or family member', icon: 'Users' },
  { id: 'OTHER', name: 'Somewhere Else', description: 'From any other place', icon: 'MapPin' },
];

export const HANDOVER_OPTIONS: ForgotSomethingHandoverConfig[] = [
  { id: 'RECEPTION', name: 'Reception / Front Desk', description: 'Item will be collected from reception or front desk.', icon: 'Building' },
  { id: 'SECURITY_GUARD', name: 'Security Guard', description: 'Our partner will collect it from the security desk.', icon: 'ShieldCheck' },
  { id: 'COLLEAGUE_STAFF', name: 'Colleague / Staff Member', description: 'A trusted colleague or staff member will hand it over.', icon: 'User' },
  { id: 'LOST_AND_FOUND', name: 'Lost & Found / Store', description: 'Item is with lost & found or store keeper.', icon: 'Archive' },
  { id: 'SOMEONE_ELSE', name: 'Someone Else', description: 'Another person (friend, family member, etc.)', icon: 'Users' },
  { id: 'CUSTOM_CONTACT', name: 'Add New Contact', description: 'Add a new contact who can hand over the item.', icon: 'UserPlus' },
];

export const SPEED_OPTIONS: ForgotSomethingSpeedConfig[] = [
  { id: 'INSTANT', name: 'Instant Pickup', eta: '15–30 mins', priceFormatted: '₹149', baseFee: 149, icon: 'Bike', recommended: true },
  { id: 'EXPRESS', name: 'Express', eta: '30–60 mins', priceFormatted: '₹119', baseFee: 119, icon: 'Rocket' },
  { id: 'SAME_DAY', name: 'Same-Day', eta: '2–6 hrs', priceFormatted: '₹89', baseFee: 89, icon: 'Truck' },
  { id: 'PRECISE_TIME', name: 'Precise Time Delivery', eta: 'Select Time', priceFormatted: '₹99', baseFee: 99, icon: 'Clock' },
];

export const TIME_SLOTS: string[] = [
  'ASAP',
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const SECURITY_TOGGLES: ForgotSomethingSecurityToggleConfig[] = [
  {
    id: 'pickupOtpRequired',
    name: 'Pickup OTP Verification',
    description: 'Verify identity during pickup.',
    icon: 'Smartphone',
    defaultChecked: true,
    fee: 0,
  },
  {
    id: 'deliveryOtpRequired',
    name: 'Delivery OTP Verification',
    description: 'Verify identity during delivery.',
    icon: 'ShieldCheck',
    defaultChecked: true,
    fee: 0,
  },
  {
    id: 'photoAtPickup',
    name: 'Photo at Pickup',
    description: 'Capture photo at the time of pickup.',
    icon: 'Camera',
    defaultChecked: false,
    fee: 0,
  },
  {
    id: 'photoAtDelivery',
    name: 'Photo at Delivery',
    description: 'Capture photo at the time of delivery.',
    icon: 'Camera',
    defaultChecked: true,
    fee: 0,
  },
  {
    id: 'tamperProofPackaging',
    name: 'Tamper-proof Packaging',
    description: 'Secure tamper-evident packaging.',
    icon: 'PackageCheck',
    defaultChecked: true,
    fee: 39,
  },
  {
    id: 'receiverSignature',
    name: 'Receiver Signature',
    description: 'Collect signature upon delivery.',
    icon: 'PenTool',
    defaultChecked: false,
    fee: 0,
  },
  {
    id: 'callBeforeArrival',
    name: 'Call Before Arrival',
    description: 'Call the receiver before arriving.',
    icon: 'PhoneCall',
    defaultChecked: false,
    fee: 0,
  },
];

export const ITEM_TAGS: string[] = ['Fragile', 'High Value', 'Urgent', 'Small Item'];

export function getForgotSomethingOptions() {
  return {
    itemCategories: ITEM_CATEGORIES,
    locationTypes: LOCATION_TYPES,
    handoverOptions: HANDOVER_OPTIONS,
    speedOptions: SPEED_OPTIONS,
    timeSlots: TIME_SLOTS,
    securityToggles: SECURITY_TOGGLES,
    itemTags: ITEM_TAGS,
    defaultPartner: {
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      vehicle: 'TVS Apache - KA 01 AB 1234',
      rating: 4.9,
      tripsCompleted: 1420,
    },
    trustPoints: [
      'Verified & police-checked delivery partners',
      'Dual-party secure OTP handoff',
      'Tamper-evident void seal packaging',
      'Real-time live milestone telemetry',
      'Money-back item safety guarantee',
    ],
  };
}
