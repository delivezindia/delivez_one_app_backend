const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

console.log('Writing Return Pickup frontend files...');

// 1. services/returnPickupService.js
const serviceCode = `import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

export const DEFAULT_RETURN_PICKUP_OPTIONS = {
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
    { id: 'DAMAGED', name: 'Damaged / Defective', description: 'Faulty or broken item needing replacement' },
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
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
    {
      id: 'RETURN_AUTHORIZATION',
      title: 'Return Authorization (If any)',
      description: 'Return request or authorization document / barcode',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
    {
      id: 'REPAIR_RECEIPT',
      title: 'Repair Receipt / Job Card',
      description: 'Upload repair receipt or service job card',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
    {
      id: 'WARRANTY_DOC',
      title: 'Warranty Document (If any)',
      description: 'Upload warranty card or proof of purchase',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
    {
      id: 'QR_BARCODE',
      title: 'QR Code / Barcode',
      description: 'Upload QR code or return label barcode screenshot',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
    {
      id: 'PICKUP_AUTH',
      title: 'Pickup Authorization Letter',
      description: 'Authorization letter or third-party consent document',
      badge: 'Optional',
      required: false,
      acceptedFormats: 'JPG, PNG, PDF (Max 5MB)',
    },
  ],
}

function authorizedRequest(path, options = {}) {
  const token = getUserAccessToken()
  if (!token) {
    throw new ApiError('Please log in to continue.', 401, null)
  }
  return apiRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: \`Bearer \${token}\`,
    },
  })
}

export async function fetchReturnPickupOptions() {
  try {
    const response = await apiRequest('/return-pickup/options')
    return response?.data || DEFAULT_RETURN_PICKUP_OPTIONS
  } catch (err) {
    console.warn('Using default return pickup options fallback:', err)
    return DEFAULT_RETURN_PICKUP_OPTIONS
  }
}

export async function fetchReturnPickupQuote(details) {
  try {
    const response = await apiRequest('/return-pickup/quote', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return response.data.quote
  } catch (err) {
    const serviceRate =
      details.deliveryService === 'EXPRESS'
        ? 149
        : details.deliveryService === 'PRECISE_TIME'
        ? 199
        : details.deliveryService === 'APPOINTMENT_BASED'
        ? 99
        : 89

    const basePickupCharge = 49
    const distanceCharge = 20
    const handlingCharge = 10
    const protectionCharge = details.shipmentProtection !== false ? 19 : 0
    const rawSubtotal = basePickupCharge + distanceCharge + handlingCharge + serviceRate + protectionCharge

    let discountAmount = 0
    if (details.couponCode && details.couponCode.trim().toUpperCase() === 'DELIVEZ10') {
      discountAmount = Math.min(50, Math.round(rawSubtotal * 0.1 * 100) / 100)
    }

    const taxableAmount = Math.max(0, rawSubtotal - discountAmount)
    const taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100

    return {
      currency: 'INR',
      basePickupCharge,
      distanceCharge,
      handlingCharge,
      deliveryServiceCharge: serviceRate,
      protectionCharge,
      discountAmount,
      taxAmount,
      totalAmount,
      deliveryServiceName: 'Standard Delivery',
    }
  }
}

export async function createReturnPickupBooking(details, idempotencyKey) {
  const response = await authorizedRequest('/return-pickup', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify(details),
  })
  return response.data.booking
}

export async function fetchReturnPickupBookings({ page = 1, limit = 10, status = 'ALL', search = '' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
    search,
  })
  const response = await authorizedRequest(\`/return-pickup?\${query.toString()}\`)
  return response.data
}

export async function fetchReturnPickupBookingById(id) {
  const response = await authorizedRequest(\`/return-pickup/\${id}\`)
  return response.data.booking
}

export async function trackReturnPickupBooking(id) {
  const response = await apiRequest(\`/return-pickup/track/\${id}\`)
  return response.data
}

export async function verifyReturnPickupOtp(id, { type, otp }) {
  const response = await apiRequest(\`/return-pickup/\${id}/verify-otp\`, {
    method: 'POST',
    body: JSON.stringify({ type, otp }),
  })
  return response.data
}

export async function cancelReturnPickupBooking(id, reason = 'Cancelled by user') {
  const response = await authorizedRequest(\`/return-pickup/\${id}/cancel\`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
  return response.data
}

export async function submitReturnPickupFeedback(id, { rating, reviewText }) {
  const response = await authorizedRequest(\`/return-pickup/\${id}/feedback\`, {
    method: 'POST',
    body: JSON.stringify({ rating, reviewText }),
  })
  return response.data
}

export async function updateReturnPickupStatus(id, { status, hubLocation }) {
  const response = await apiRequest(\`/return-pickup/track/\${id}/status\`, {
    method: 'PATCH',
    body: JSON.stringify({ status, hubLocation }),
  })
  return response.data
}
`;

ensureDir(path.join(webRoot, 'src', 'features', 'return-pickup', 'services'));
fs.writeFileSync(path.join(webRoot, 'src', 'features', 'return-pickup', 'services', 'returnPickupService.js'), serviceCode);
console.log('✓ returnPickupService.js written');

// 2. Update sandboxPaymentService.js
const sandboxPaymentPath = path.join(webRoot, 'src', 'features', 'payments', 'services', 'sandboxPaymentService.js');
let sandboxPaymentContent = fs.readFileSync(sandboxPaymentPath, 'utf-8');
if (!sandboxPaymentContent.includes('return-pickup')) {
  sandboxPaymentContent = sandboxPaymentContent.replace(
    /switch\s*\(serviceSlug\)\s*\{/,
    `switch (serviceSlug) {\n    case 'return-pickup':\n    case 'returns':\n      return '/return-pickup'`
  );
  fs.writeFileSync(sandboxPaymentPath, sandboxPaymentContent);
  console.log('✓ sandboxPaymentService.js updated');
}

console.log('Done writing baseline services.');
