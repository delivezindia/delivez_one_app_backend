export interface ReturnPickupTypeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ReturnDestinationTypeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface RecentStoreOption {
  id: string;
  name: string;
  category: string;
  verified: boolean;
  address: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface ReturnDeliveryServiceOption {
  id: string;
  name: string;
  description: string;
  eta: string;
  badge?: string;
  baseCharge: number;
}

export interface CouponOption {
  code: string;
  title: string;
  description: string;
  discountPercent?: number;
  flatDiscount?: number;
  maxDiscount?: number;
}

export interface ReturnPickupConfig {
  returnTypes: ReturnPickupTypeOption[];
  destinationTypes: ReturnDestinationTypeOption[];
  recentStores: RecentStoreOption[];
  itemCategories: Array<{ id: string; name: string }>;
  itemConditions: Array<{ id: string; name: string; description: string }>;
  specialHandlingOptions: Array<{ id: string; label: string }>;
  deliveryServices: ReturnDeliveryServiceOption[];
  pickupTimeSlots: string[];
  documentTypes: Array<{
    id: string;
    title: string;
    description: string;
    badge?: string;
    required: boolean;
    acceptedFormats: string;
    acceptMimeTypes: string[];
    maxSizeBytes: number;
  }>;
  coupons: CouponOption[];
  uploadLimits: {
    maxFileSizeBytes: number;
    maxFiles: number;
    acceptedMimeTypes: string[];
  };
}

export const RETURN_PICKUP_CONFIG: ReturnPickupConfig = {
  returnTypes: [
    {
      id: 'RETURN_ITEM',
      name: 'Return an Item',
      description: 'Send an item back to the seller or store.',
      icon: 'Undo2',
    },
    {
      id: 'EXCHANGE_ITEM',
      name: 'Exchange Item',
      description: 'Return the item and get an exchange.',
      icon: 'Repeat',
    },
    {
      id: 'REPAIR_SERVICE',
      name: 'Repair / Service',
      description: 'Send the product to a service centre for repair.',
      icon: 'Wrench',
    },
    {
      id: 'WARRANTY_RETURN',
      name: 'Warranty Return',
      description: 'Send the item for warranty inspection or replacement.',
      icon: 'ShieldCheck',
    },
    {
      id: 'RENTAL_RETURN',
      name: 'Rental Return',
      description: 'Return rented product(s) at the end of the rental period.',
      icon: 'CalendarDays',
    },
    {
      id: 'SEND_BACK_TO_PERSON',
      name: 'Send Back to Someone',
      description: 'Send an item back to another person.',
      icon: 'UserCheck',
    },
    {
      id: 'OTHER',
      name: 'Other Return',
      description: 'Other types of returns or requests.',
      icon: 'MoreHorizontal',
    },
  ],

  destinationTypes: [
    {
      id: 'ONLINE_STORE',
      name: 'Online Store',
      description: 'Return to online seller or marketplace (Amazon, Flipkart, etc.)',
      icon: 'ShoppingCart',
    },
    {
      id: 'LOCAL_STORE',
      name: 'Local Store',
      description: 'Return to local retail store',
      icon: 'Store',
    },
    {
      id: 'BRAND_STORE',
      name: 'Brand Store',
      description: 'Return to brand outlet or store (Zara, Apple, Nike)',
      icon: 'Tag',
    },
    {
      id: 'SERVICE_CENTRE',
      name: 'Service Centre',
      description: 'Send to service or repair centre',
      icon: 'Building',
    },
    {
      id: 'WAREHOUSE',
      name: 'Warehouse',
      description: 'Return to company warehouse',
      icon: 'Home',
    },
    {
      id: 'ANOTHER_PERSON',
      name: 'Another Person',
      description: 'Send back to another person',
      icon: 'User',
    },
    {
      id: 'OTHER',
      name: 'Other',
      description: 'Any other return destination',
      icon: 'MapPin',
    },
  ],

  recentStores: [
    {
      id: 'store-amazon',
      name: 'Amazon India',
      category: 'ONLINE_STORE',
      verified: true,
      address: {
        line1: 'Amazon Fulfillment Center, Hosur Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
      },
    },
    {
      id: 'store-flipkart',
      name: 'Flipkart',
      category: 'ONLINE_STORE',
      verified: true,
      address: {
        line1: 'Flipkart Logistics Hub, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
      },
    },
    {
      id: 'store-abc-electronics',
      name: 'ABC Electronics Returns Centre',
      category: 'SERVICE_CENTRE',
      verified: true,
      address: {
        line1: 'No. 24, 5th Cross, HSR Layout Sector 1',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560102',
      },
    },
    {
      id: 'store-myntra',
      name: 'Myntra Returns Hub',
      category: 'ONLINE_STORE',
      verified: true,
      address: {
        line1: 'AKR Tech Park, Kudlu Gate',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560068',
      },
    },
  ],

  itemCategories: [
    { id: 'ELECTRONICS', name: 'Electronics & Gadgets' },
    { id: 'CLOTHING_APPAREL', name: 'Clothing & Apparel' },
    { id: 'FOOTWEAR', name: 'Footwear & Shoes' },
    { id: 'HOME_KITCHEN', name: 'Home & Kitchen Appliances' },
    { id: 'BOOKS_STATIONERY', name: 'Books & Stationery' },
    { id: 'BEAUTY_PERSONAL_CARE', name: 'Beauty & Personal Care' },
    { id: 'SPORTS_FITNESS', name: 'Sports & Fitness Equipment' },
    { id: 'AUTO_PARTS', name: 'Automotive & Hardware Parts' },
    { id: 'OTHER', name: 'Other Item' },
  ],

  itemConditions: [
    { id: 'NEW_UNUSED', name: 'New / Unused', description: 'Original tags & packaging intact' },
    { id: 'USED_GOOD', name: 'Used - Good', description: 'Minor signs of use with accessories' },
    {
      id: 'DAMAGED',
      name: 'Damaged / Defective',
      description: 'Faulty or broken item needing replacement',
    },
  ],

  specialHandlingOptions: [
    { id: 'FRAGILE', label: 'Fragile' },
    { id: 'HANDLE_WITH_CARE', label: 'Handle with care' },
    { id: 'KEEP_DRY', label: 'Keep Dry' },
    { id: 'HIGH_VALUE', label: 'High Value Item' },
  ],

  deliveryServices: [
    {
      id: 'STANDARD',
      name: 'Standard Delivery',
      description: 'Affordable and reliable delivery within committed timeline.',
      eta: 'Delivery in 2 - 4 Working Days',
      badge: 'Recommended',
      baseCharge: 89,
    },
    {
      id: 'EXPRESS',
      name: 'Express Delivery',
      description: 'Faster delivery with priority handling.',
      eta: 'Delivery in 24 - 48 Hours',
      baseCharge: 149,
    },
    {
      id: 'PRECISE_TIME',
      name: 'Precise Time Delivery',
      description: 'Choose a specific 2-hour time slot for delivery.',
      eta: 'Delivery on selected time slot',
      badge: 'NEW',
      baseCharge: 199,
    },
    {
      id: 'APPOINTMENT_BASED',
      name: 'Appointment Based Delivery',
      description: 'Schedule your delivery for a future date as per your convenience.',
      eta: 'Delivery on your chosen date',
      baseCharge: 99,
    },
  ],

  pickupTimeSlots: [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
    '7:00 PM - 9:00 PM',
  ],

  documentTypes: [
    {
      id: 'INVOICE_ORDER_PROOF',
      title: 'Invoice / Order Proof',
      description: 'Upload invoice or order confirmation screenshot',
      badge: 'Recommended',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    {
      id: 'RETURN_AUTHORIZATION',
      title: 'Return Authorization (If any)',
      description: 'Return request or authorization document / barcode',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    {
      id: 'REPAIR_RECEIPT',
      title: 'Repair Receipt / Job Card',
      description: 'Upload repair receipt or service job card',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    {
      id: 'WARRANTY_DOC',
      title: 'Warranty Document (If any)',
      description: 'Upload warranty card or proof of purchase',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    {
      id: 'QR_BARCODE',
      title: 'QR Code / Barcode',
      description: 'Upload QR code or return label barcode screenshot',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
    {
      id: 'PICKUP_AUTH',
      title: 'Pickup Authorization Letter',
      description: 'Authorization letter or third-party consent document',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 10MB)',
      acceptMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
      maxSizeBytes: 10 * 1024 * 1024,
    },
  ],

  coupons: [
    {
      code: 'DELIVEZ10',
      title: '10% OFF',
      description: 'Get 10% discount on all return pickups up to ₹50',
      discountPercent: 10,
      maxDiscount: 50,
    },
    {
      code: 'SAVE20',
      title: '20% OFF Express',
      description: 'Save 20% on express return pickups up to ₹80',
      discountPercent: 20,
      maxDiscount: 80,
    },
    {
      code: 'FIRSTRETURN',
      title: '₹40 OFF First Return',
      description: 'Flat ₹40 discount on your return booking',
      flatDiscount: 40,
    },
    {
      code: 'FREESHIP',
      title: 'Free Protection Cover',
      description: 'Complimentary ₹19 shipment protection cover discount',
      flatDiscount: 19,
    },
  ],

  uploadLimits: {
    maxFileSizeBytes: 10 * 1024 * 1024,
    maxFiles: 10,
    acceptedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
};

export const getReturnPickupOptions = (): ReturnPickupConfig => RETURN_PICKUP_CONFIG;
