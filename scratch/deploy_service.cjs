const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';

// 1. Service File
const serviceDir = path.join(webRoot, 'src/features/gift-delivery/services');
fs.mkdirSync(serviceDir, { recursive: true });

const serviceCode = `import { apiRequest, ApiError } from '@/services/api/apiClient.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'

export const DEFAULT_GIFT_DELIVERY_OPTIONS = {
  packagingCharge: 20.0,
  categories: [
    {
      id: 'CAKES',
      name: 'Cakes',
      description: 'Perfect for every celebration.',
      icon: 'Cake',
      tagline: 'Delicious handcrafted celebration cakes',
    },
    {
      id: 'FLOWERS',
      name: 'Flowers',
      description: 'Express your feelings beautifully.',
      icon: 'Flower2',
      tagline: 'Fresh aromatic hand-tied bouquets',
    },
    {
      id: 'HAMPERS',
      name: 'Hampers',
      description: 'Premium hampers for everyone.',
      icon: 'Gift',
      tagline: 'Curated luxury gift hampers',
    },
    {
      id: 'CHOCOLATES',
      name: 'Chocolates',
      description: 'Delicious treats to make them smile.',
      icon: 'Cookie',
      tagline: 'Artisan hand-crafted chocolates',
    },
    {
      id: 'PERSONALIZED',
      name: 'Personalized',
      description: 'Add a personal touch to your gift.',
      icon: 'Sparkles',
      tagline: 'Custom made gifts with memories',
    },
    {
      id: 'SOFT_TOYS',
      name: 'Soft Toys',
      description: 'Cuddles that deliver happiness.',
      icon: 'Heart',
      tagline: 'Plush & adorable huggable toys',
    },
    {
      id: 'BEAUTY_PERFUMES',
      name: 'Beauty & Perfumes',
      description: 'For someone special.',
      icon: 'Sparkle',
      tagline: 'Premium luxury scents and pampering',
    },
    {
      id: 'PLANTS',
      name: 'Plants',
      description: 'Green gifts for a lasting impression.',
      icon: 'Leaf',
      tagline: 'Purifying indoor potted plants',
    },
    {
      id: 'MORE',
      name: 'More Categories',
      description: 'Explore more amazing gifts.',
      icon: 'Layers',
      tagline: 'Unique surprises & celebratory gifts',
    },
  ],
  products: [
    {
      id: 'cake-choc-truffle',
      categoryId: 'CAKES',
      name: 'Chocolate Truffle Cake',
      description: 'Premium cake for every celebration with rich Belgian ganache',
      price: 699,
      rating: 4.6,
      reviewsCount: 125,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
      badge: 'Bestseller',
      occasionTag: 'Birthday',
    },
    {
      id: 'cake-black-forest',
      categoryId: 'CAKES',
      name: 'Black Forest Cake',
      description: 'Classic chocolate sponge layered with cherries and cream',
      price: 699,
      rating: 4.5,
      reviewsCount: 98,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },
    {
      id: 'cake-red-velvet',
      categoryId: 'CAKES',
      name: 'Red Velvet Heart Cake',
      description: 'Velvety smooth red cake with cream cheese frosting',
      price: 749,
      rating: 4.7,
      reviewsCount: 110,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&auto=format&fit=crop&q=80',
      badge: 'Popular',
      occasionTag: 'Anniversary',
    },
    {
      id: 'cake-fresh-fruit',
      categoryId: 'CAKES',
      name: 'Fresh Fruit Cream Cake',
      description: 'Fluffy sponge loaded with seasonal fresh fruits',
      price: 649,
      rating: 4.4,
      reviewsCount: 76,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Celebration',
    },
    {
      id: 'flower-red-roses-12',
      categoryId: 'FLOWERS',
      name: '12 Red Roses Love Bouquet',
      description: 'Handpicked Dutch red roses wrapped with ribbon',
      price: 599,
      rating: 4.8,
      reviewsCount: 140,
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&auto=format&fit=crop&q=80',
      badge: 'Romantic Choice',
      occasionTag: 'Anniversary',
    },
    {
      id: 'flower-yellow-lilies',
      categoryId: 'FLOWERS',
      name: 'Sunshine Lilies & Carnations',
      description: 'Vibrant yellow lilies paired with fresh white carnations',
      price: 699,
      rating: 4.7,
      reviewsCount: 85,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Celebration',
    },
    {
      id: 'hamper-grand-celebration',
      categoryId: 'HAMPERS',
      name: 'Grand Celebration Gourmet Box',
      description: 'Artisan cookies, roasted nuts, chocolates and sparkling cider',
      price: 1499,
      rating: 4.8,
      reviewsCount: 48,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      badge: 'Luxury',
      occasionTag: 'Festival',
    },
    {
      id: 'choc-ferrero-pralines',
      categoryId: 'CHOCOLATES',
      name: 'Ferrero Rocher & Artisan Pralines',
      description: '16-piece Ferrero Rocher luxury box with dark chocolates',
      price: 549,
      rating: 4.8,
      reviewsCount: 120,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      badge: 'Sweet Tooth',
      occasionTag: 'Celebration',
    },
    {
      id: 'toy-teddy-3ft',
      categoryId: 'SOFT_TOYS',
      name: 'Fluffy Giant Huggable Teddy (3 ft)',
      description: 'Plush cuddly beige teddy bear wearing red satin bow',
      price: 799,
      rating: 4.6,
      reviewsCount: 54,
      image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },
  ],
  deliveryTypes: [
    {
      id: 'STANDARD',
      name: 'Standard Delivery',
      description: 'Delivered within 24 - 48 hrs.',
      eta: 'Delivery in 24 - 48 hrs',
      baseCharge: 49,
      badge: 'Affordable',
    },
    {
      id: 'EXPRESS',
      name: 'Express Delivery',
      description: 'Delivered within 3 - 6 hrs.',
      eta: 'Delivery in 3 - 6 hrs',
      baseCharge: 99,
      badge: 'Popular',
    },
    {
      id: 'PRECISE_TIME',
      name: 'Precise Time Delivery',
      description: 'Delivered at your selected exact time slot.',
      eta: 'Delivered at chosen time slot',
      baseCharge: 149,
      badge: 'NEW',
    },
    {
      id: 'MIDNIGHT',
      name: 'Midnight Delivery',
      description: 'Delivered precisely between 11:00 PM - 12:00 AM.',
      eta: '11:00 PM - 12:00 AM Midnight',
      baseCharge: 199,
      badge: 'Surprise',
    },
  ],
  timeSlots: [
    '9:00 AM - 12:00 PM (Morning)',
    '12:00 PM - 3:00 PM (Afternoon)',
    '3:00 PM - 6:00 PM (Evening)',
    '6:00 PM - 9:00 PM (Night)',
    '11:00 PM - 12:00 AM (Midnight Special)',
  ],
  premiumSetups: [
    {
      id: 'HANDWRITTEN_CARD',
      title: 'Handwritten Message Card',
      description: 'We handwrite your special message on a premium card.',
      price: 79,
      badge: 'Popular',
      icon: 'FileEdit',
    },
    {
      id: 'ANONYMOUS_SENDER',
      title: 'Anonymous Sender',
      description: 'Your name will be hidden. Gift will be from "A Secret Admirer".',
      price: 49,
      badge: 'New',
      icon: 'EyeOff',
    },
    {
      id: 'PHOTO_PROOF',
      title: 'Photo Proof of Delivery',
      description: "We'll click & share a photo after successful delivery.",
      price: 39,
      badge: 'Most Popular',
      icon: 'Camera',
    },
    {
      id: 'PREMIUM_SETUP',
      title: 'Premium Setup',
      description: 'Luxury decoration with balloons, flowers & premium arrangement at the delivery location.',
      price: 299,
      badge: 'Best Value',
      icon: 'Sparkles',
      inclusions: [
        'Balloons & Décor',
        'Premium Table Setup',
        'Fresh Flowers',
        'Greeting Board',
        'LED Lights',
        'Themed Decoration',
      ],
    },
  ],
  addons: [
    {
      id: 'PREMIUM_WRAP',
      title: 'Premium Gift Wrap',
      description: 'Elegant wrapping paper with satin ribbon and bow.',
      price: 49,
      badge: 'Most Popular',
      icon: 'Gift',
    },
    {
      id: 'GREETING_CARD',
      title: 'Greeting Card',
      description: 'Add a personalized printed card with your warm message.',
      price: 29,
      icon: 'Mail',
    },
    {
      id: 'HANDWRITTEN_CARD_ADDON',
      title: 'Handwritten Message Card',
      description: 'Calligraphy hand-written message for personal touch.',
      price: 49,
      icon: 'PenTool',
    },
    {
      id: 'ANONYMOUS_SENDER_ADDON',
      title: 'Anonymous Sender',
      description: 'Sender identity hidden until recipient opens gift.',
      price: 39,
      icon: 'EyeOff',
    },
    {
      id: 'VIDEO_REACTION',
      title: 'Video Reaction Recording',
      description: "Capture the recipient's reaction video at delivery.",
      price: 79,
      icon: 'Video',
    },
    {
      id: 'PHOTO_PROOF_ADDON',
      title: 'Photo Proof of Delivery',
      description: 'Instant photo confirmation sent to your WhatsApp/SMS.',
      price: 39,
      icon: 'Camera',
    },
    {
      id: 'PARTY_POPPER',
      title: 'Celebration Party Popper',
      description: 'Sparkling colorful confetti popper for celebratory moment.',
      price: 29,
      icon: 'Sparkle',
    },
    {
      id: 'CANDLES_SET',
      title: 'Celebration Candles (Set of 10)',
      description: 'Gold & silver metallic sparkling cake candles.',
      price: 19,
      icon: 'Flame',
    },
  ],
  greetingCards: [
    {
      id: 'card-bday-1',
      name: 'Happy Birthday Celebration',
      theme: 'Birthday',
      previewUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300&auto=format&fit=crop&q=80',
      icon: 'Cake',
    },
    {
      id: 'card-anniv-1',
      name: 'Happy Anniversary Together',
      theme: 'Anniversary',
      previewUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop&q=80',
      icon: 'Heart',
    },
    {
      id: 'card-love-1',
      name: 'Just for You with Love',
      theme: 'Love',
      previewUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&auto=format&fit=crop&q=80',
      icon: 'Smile',
    },
    {
      id: 'card-congrats-1',
      name: 'Congratulations & Cheer',
      theme: 'Congratulations',
      previewUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
      icon: 'Award',
    },
  ],
  coupons: [
    {
      code: 'GIFTLOVE',
      title: '10% OFF Special',
      description: 'Get 10% discount on gifts up to ₹60',
      discountPercent: 10,
      maxDiscount: 60,
    },
    {
      code: 'DELIVEZ10',
      title: '10% OFF',
      description: 'Get 10% discount on all gift deliveries up to ₹50',
      discountPercent: 10,
      maxDiscount: 50,
    },
    {
      code: 'FIRSTGIFT',
      title: '₹40 OFF First Gift',
      description: 'Flat ₹40 discount on your first gift order',
      flatDiscount: 40,
    },
    {
      code: 'SWEET100',
      title: '₹100 OFF Celebrations',
      description: 'Flat ₹100 discount on orders above ₹999',
      flatDiscount: 100,
      minOrderAmount: 999,
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

export async function fetchGiftDeliveryOptions() {
  try {
    const response = await apiRequest('/gift-delivery/options')
    return response?.data || DEFAULT_GIFT_DELIVERY_OPTIONS
  } catch (err) {
    console.warn('Using default gift delivery options fallback:', err)
    return DEFAULT_GIFT_DELIVERY_OPTIONS
  }
}

export async function fetchGiftDeliveryQuote(details) {
  try {
    const response = await apiRequest('/gift-delivery/quote', {
      method: 'POST',
      body: JSON.stringify(details),
    })
    return response.data.quote
  } catch (err) {
    const unitPrice = Number(details.productPrice) || 699
    const qty = Number(details.productQuantity) || 1
    const itemTotal = unitPrice * qty

    const deliveryCharge =
      details.deliveryType === 'EXPRESS'
        ? 99
        : details.deliveryType === 'PRECISE_TIME'
        ? 149
        : details.deliveryType === 'MIDNIGHT'
        ? 199
        : 49

    const packagingCharge = 20

    let addonsTotal = 0
    if (details.hasHandwrittenCard) addonsTotal += 79
    if (details.isAnonymousSender) addonsTotal += 49
    if (details.hasPhotoProof) addonsTotal += 39
    if (details.hasVideoReaction) addonsTotal += 79
    if (details.hasPremiumWrap) addonsTotal += 49
    if (details.hasPremiumSetup) addonsTotal += 299

    const rawSubtotal = itemTotal + deliveryCharge + packagingCharge + addonsTotal
    let discountAmount = 0
    if (details.couponCode?.trim().toUpperCase() === 'GIFTLOVE') {
      discountAmount = Math.min(60, Math.round(rawSubtotal * 0.1))
    } else if (details.couponCode?.trim().toUpperCase() === 'DELIVEZ10') {
      discountAmount = Math.min(50, Math.round(rawSubtotal * 0.1))
    }

    const taxableServices = deliveryCharge + packagingCharge + addonsTotal
    const taxAmount = Math.round(taxableServices * 0.18 * 100) / 100
    const totalAmount = Math.round((rawSubtotal - discountAmount + taxAmount) * 100) / 100

    return {
      currency: 'INR',
      itemTotal,
      deliveryCharge,
      packagingCharge,
      addonsTotal,
      discountAmount,
      taxAmount,
      totalAmount,
      deliveryTypeName: details.deliveryType || 'Standard Delivery',
      breakdown: [
        { key: 'ITEM_TOTAL', label: 'Item Total', amount: itemTotal },
        { key: 'DELIVERY_CHARGE', label: 'Delivery Charges', amount: deliveryCharge },
        { key: 'PACKAGING_CHARGE', label: 'Packaging Charges', amount: packagingCharge },
        { key: 'TAX_GST', label: 'Taxes (GST)', amount: taxAmount },
      ],
    }
  }
}

export async function createGiftDeliveryBooking(details, idempotencyKey) {
  const response = await authorizedRequest('/gift-delivery', {
    method: 'POST',
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {},
    body: JSON.stringify(details),
  })
  return response.data.booking
}

export async function fetchGiftDeliveryBookings({ page = 1, limit = 10, status = 'ALL', search = '' } = {}) {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
    search,
  })
  const response = await authorizedRequest(\`/gift-delivery?\${query.toString()}\`)
  return response.data
}

export async function fetchGiftDeliveryBookingById(id) {
  const response = await authorizedRequest(\`/gift-delivery/\${id}\`)
  return response.data.booking
}

export async function trackGiftDeliveryBooking(id) {
  const response = await apiRequest(\`/gift-delivery/track/\${id}\`)
  return response.data
}

export async function verifyGiftDeliveryOtp(id, { otp }) {
  const response = await apiRequest(\`/gift-delivery/\${id}/verify-otp\`, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  })
  return response.data
}

export async function cancelGiftDeliveryBooking(id, reason = 'Cancelled by customer') {
  const response = await authorizedRequest(\`/gift-delivery/\${id}/cancel\`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
  return response.data
}

export async function rescheduleGiftDeliveryBooking(id, details) {
  const response = await authorizedRequest(\`/gift-delivery/\${id}/reschedule\`, {
    method: 'POST',
    body: JSON.stringify(details),
  })
  return response.data
}

export async function fetchGiftDeliveryInvoice(id) {
  const response = await authorizedRequest(\`/gift-delivery/\${id}/invoice\`)
  return response.data.invoice
}

export async function submitGiftDeliveryFeedback(id, { rating, reviewText }) {
  const response = await authorizedRequest(\`/gift-delivery/\${id}/feedback\`, {
    method: 'POST',
    body: JSON.stringify({ rating, reviewText }),
  })
  return response.data
}

export async function updateGiftDeliveryStatus(id, { status, hubLocation }) {
  const response = await apiRequest(\`/gift-delivery/track/\${id}/status\`, {
    method: 'PATCH',
    body: JSON.stringify({ status, hubLocation }),
  })
  return response.data
}
`;

fs.writeFileSync(path.join(serviceDir, 'giftDeliveryService.js'), serviceCode, 'utf8');
console.log('Created giftDeliveryService.js successfully');
