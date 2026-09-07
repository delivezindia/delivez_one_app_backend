export interface GiftCategoryOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  tagline: string;
}

export interface GiftProductOption {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  weight?: string;
  serves?: string;
  image: string;
  badge?: string;
  occasionTag: string;
}

export interface GiftDeliveryTypeOption {
  id: string;
  name: string;
  description: string;
  eta: string;
  baseCharge: number;
  badge?: string;
}

export interface PremiumSetupOption {
  id: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
  inclusions?: string[];
  icon: string;
}

export interface GiftAddonOption {
  id: string;
  title: string;
  description: string;
  price: number;
  badge?: string;
  icon: string;
}

export interface GreetingCardOption {
  id: string;
  name: string;
  theme: string;
  previewUrl: string;
  icon: string;
}

export interface GiftCouponOption {
  code: string;
  title: string;
  description: string;
  discountPercent?: number;
  flatDiscount?: number;
  maxDiscount?: number;
  minOrderAmount?: number;
}

export interface GiftDeliveryConfig {
  categories: GiftCategoryOption[];
  products: GiftProductOption[];
  deliveryTypes: GiftDeliveryTypeOption[];
  timeSlots: string[];
  premiumSetups: PremiumSetupOption[];
  addons: GiftAddonOption[];
  greetingCards: GreetingCardOption[];
  coupons: GiftCouponOption[];
  packagingCharge: number;
}

export const GIFT_DELIVERY_CONFIG: GiftDeliveryConfig = {
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
    // Cakes
    {
      id: 'cake-choc-truffle',
      categoryId: 'CAKES',
      name: 'Chocolate Truffle Cake',
      description: 'Premium cake for every celebration with rich Belgian ganache.',
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
      description: 'Classic chocolate sponge layered with cherries and vanilla cream.',
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
      description: 'Velvety smooth red sponge layered with rich cream cheese frosting.',
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
      description: 'Fluffy vanilla sponge loaded with kiwi, seasonal strawberries, and peaches.',
      price: 649,
      rating: 4.4,
      reviewsCount: 76,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Celebration',
    },
    {
      id: 'cake-alphonso-mango',
      categoryId: 'CAKES',
      name: 'Alphonso Mango Cake',
      description: 'Infused with 100% natural Alphonso mango compote and white chocolate.',
      price: 699,
      rating: 4.5,
      reviewsCount: 64,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },
    {
      id: 'cake-butterscotch',
      categoryId: 'CAKES',
      name: 'Butterscotch Crunch Cake',
      description: 'Caramel crunch praline with golden butterscotch sponge and cream.',
      price: 649,
      rating: 4.3,
      reviewsCount: 52,
      weight: '1 kg',
      serves: '6 - 8 People',
      image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },

    // Flowers
    {
      id: 'flower-red-roses-12',
      categoryId: 'FLOWERS',
      name: '12 Red Roses Love Bouquet',
      description: 'Handpicked Dutch red roses wrapped in eco craft paper with red ribbon.',
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
      description: 'Vibrant yellow Asiatic lilies paired with fresh white carnations.',
      price: 699,
      rating: 4.7,
      reviewsCount: 85,
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Celebration',
    },
    {
      id: 'flower-orchids-box',
      categoryId: 'FLOWERS',
      name: 'Royal Purple Orchids Box',
      description: 'Exotic purple Dendrobium orchids arranged in a luxury round gift box.',
      price: 899,
      rating: 4.9,
      reviewsCount: 62,
      image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Special Occasion',
    },

    // Hampers
    {
      id: 'hamper-grand-celebration',
      categoryId: 'HAMPERS',
      name: 'Grand Celebration Gourmet Box',
      description: 'Artisan cookies, roasted nuts, sparkling grape beverage & chocolates.',
      price: 1499,
      rating: 4.8,
      reviewsCount: 48,
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80',
      badge: 'Luxury',
      occasionTag: 'Festival',
    },
    {
      id: 'hamper-sweet-treats',
      categoryId: 'HAMPERS',
      name: 'Sweet Delights Hamper',
      description: 'Assorted premium chocolates, dry fruits and celebration message card.',
      price: 999,
      rating: 4.7,
      reviewsCount: 95,
      image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },

    // Chocolates
    {
      id: 'choc-ferrero-pralines',
      categoryId: 'CHOCOLATES',
      name: 'Ferrero Rocher & Artisan Pralines',
      description: '16-piece Ferrero Rocher luxury box with assorted Belgian dark chocolates.',
      price: 549,
      rating: 4.8,
      reviewsCount: 120,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      badge: 'Sweet Tooth',
      occasionTag: 'Celebration',
    },
    {
      id: 'choc-handmade-assorted',
      categoryId: 'CHOCOLATES',
      name: 'Handmade Truffle Box (12 pcs)',
      description: 'Caramel, hazelnut, espresso and berry infused dark and milk chocolates.',
      price: 699,
      rating: 4.7,
      reviewsCount: 88,
      image: 'https://images.unsplash.com/photo-1526081347589-7fa3cb41b4b2?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },

    // Soft Toys
    {
      id: 'toy-teddy-3ft',
      categoryId: 'SOFT_TOYS',
      name: 'Fluffy Giant Huggable Teddy (3 ft)',
      description: 'Super soft plush beige teddy bear wearing a stylish red satin bow.',
      price: 799,
      rating: 4.6,
      reviewsCount: 54,
      image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Birthday',
    },

    // Personalized
    {
      id: 'pers-photo-frame',
      categoryId: 'PERSONALIZED',
      name: 'Custom Engraved Wooden Frame',
      description: 'Laser engraved wooden frame with your custom photo and warm message.',
      price: 599,
      rating: 4.8,
      reviewsCount: 92,
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Anniversary',
    },

    // Plants
    {
      id: 'plant-peace-lily',
      categoryId: 'PLANTS',
      name: 'Peace Lily in Ceramic Pot',
      description: 'Air purifying flowering Peace Lily plant in an elegant white ceramic vase.',
      price: 499,
      rating: 4.7,
      reviewsCount: 78,
      image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80',
      occasionTag: 'Housewarming',
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
      description: 'Delivered precisely between 11:00 PM - 12:00 AM for birthday/anniversary surprise.',
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
      description: 'Elegant wrapping paper with satin ribbon and decorative bow.',
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
};

export const getGiftDeliveryOptions = (): GiftDeliveryConfig => GIFT_DELIVERY_CONFIG;
