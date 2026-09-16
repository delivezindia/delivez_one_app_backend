
const sanitizeCourierBookingAddress = (addr: any, defaultLabel: string) => ({
  label: String(addr?.label || defaultLabel),
  contactName: String(addr?.contactName || 'Contact'),
  countryCode: String(addr?.countryCode || '+91'),
  phoneNumber: String(addr?.phoneNumber || '+919876543210'),
  addressLine1: String(addr?.addressLine1 || 'Address Line 1'),
  addressLine2: addr?.addressLine2 ? String(addr.addressLine2) : null,
  landmark: addr?.landmark ? String(addr.landmark) : null,
  city: String(addr?.city || 'Bengaluru'),
  state: String(addr?.state || 'Karnataka'),
  postalCode: String(addr?.postalCode || '560001'),
  country: String(addr?.country || 'India'),
  latitude: addr?.latitude === null || addr?.latitude === undefined ? null : Number(addr.latitude),
  longitude: addr?.longitude === null || addr?.longitude === undefined ? null : Number(addr.longitude),
});

import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { Prisma } from '@prisma/client';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import { getCourierOptions } from './courier-config.js';
import { calculateCourierQuote } from './courier-pricing.js';
import {
  validateCourierRequest,
  validateIdempotencyKey,
} from './courier.validation.js';

const bookingInclude = {
  addresses: true,
  package: true,
  service: {
    select: {
      id: true,
      name: true,
      slug: true,
      shortDescription: true,
    },
  },
} satisfies Prisma.CourierBookingInclude;

const fingerprint = (input: unknown): string =>
  createHash('sha256').update(JSON.stringify(input)).digest('hex');

export const makeBookingNumber = (): string => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randPart = Math.floor(1000 + Math.random() * 9000);
  return `DLVZ${datePart}${randPart}`;
};

const serializeAddress = (address: any) => ({
  ...address,
  latitude: address.latitude === null ? null : Number(address.latitude),
  longitude: address.longitude === null ? null : Number(address.longitude),
});

export const defaultAgent = {
  name: 'Ravi Kumar',
  id: 'DLZAGT45521',
  phone: '+91 98765 43210',
  vehicle: 'DL 1Z 4589',
  rating: '4.9',
  completedTrips: '1,420+',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

export const defaultPod = {
  otp: '5487',
  deliveredTo: 'Taj City Centre Hotel Front Desk',
  receivedBy: 'Taj Front Desk - Amit Verma',
  relationship: 'Hotel Reception Desk',
  contactNumber: '+91 98111 22334',
  signatureUrl: 'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=400&q=80',
  photoUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&w=600&q=80',
  sealPhotoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
  sealNumber: 'DLV-SEAL-88492',
  deliveredAt: '12 May 2025, 05:45 PM',
  notes: 'Courier received intact with tamper-evident seal unbroken. Front desk verified guest name Rahul Sharma, Room 402.',
};

export const generateJourneyTimeline = (status: string, meta: any = {}) => {
  const seal = meta.sealNumber || 'DLV-SEAL-88492';
  const pickupCity = meta.pickupDetails?.city || 'New Delhi';
  const dropoffCity = meta.deliveryDetails?.city || 'Gurugram';
  const bNumber = meta.bookingNumber || 'DLVZ2505128947';

  const weights: Record<string, number> = {
    CONFIRMED: 1,
    BOOKING_CONFIRMED: 1,
    AGENT_ASSIGNED: 2,
    PICKUP_ASSIGNED: 2,
    PICKUP_IN_PROGRESS: 3,
    COURIER_INSPECTED: 4,
    SECURITY_SEAL_APPLIED: 5,
    PICKED_UP: 6,
    COURIER_PICKED: 6,
    IN_TRANSIT: 7,
    REACHED_DESTINATION_CITY: 8,
    OUT_FOR_DELIVERY: 9,
    DELIVERED: 10,
    CANCELLED: 0,
  };

  const currentWeight = weights[status] ?? 7;

  const stages = [
    {
      id: 1,
      weight: 1,
      stage: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      location: pickupCity,
      description: `Your luggage delivery booking ${bNumber} has been confirmed.`,
      timestamp: '10 May 2025, 09:30 AM',
    },
    {
      id: 2,
      weight: 2,
      stage: 'AGENT_ASSIGNED',
      title: 'Agent Assigned',
      location: pickupCity,
      description: 'Ravi Kumar (DLZAGT45521) assigned for luggage pickup.',
      timestamp: '10 May 2025, 09:45 AM',
    },
    {
      id: 3,
      weight: 3,
      stage: 'AGENT_REACHED_PICKUP',
      title: 'Agent Reached Pickup Location',
      location: meta.pickupDetails?.terminal ? `Indira Gandhi Int Airport (${meta.pickupDetails.terminal})` : pickupCity,
      description: 'Agent reached pickup point at Luggage Belt / Lobby.',
      timestamp: '10 May 2025, 10:15 AM',
    },
    {
      id: 4,
      weight: 4,
      stage: 'COURIER_INSPECTED_WEIGHED',
      title: 'Courier Inspected & Weighed',
      location: pickupCity,
      description: `Bags inspected and weighed. Total verified weight: ${meta.totalWeightKg || 28} Kg.`,
      timestamp: '10 May 2025, 10:25 AM',
    },
    {
      id: 5,
      weight: 5,
      stage: 'SECURITY_SEAL_APPLIED',
      title: 'Security Seal Applied',
      location: pickupCity,
      description: `High-security tamper-evident seal applied: ${seal}`,
      timestamp: '10 May 2025, 10:30 AM',
      sealNumber: seal,
    },
    {
      id: 6,
      weight: 6,
      stage: 'COURIER_PICKED',
      title: 'Courier Picked Up',
      location: pickupCity,
      description: 'Courier safely handed over to courier agent with digital receipt.',
      timestamp: '10 May 2025, 10:35 AM',
    },
    {
      id: 7,
      weight: 7,
      stage: 'IN_TRANSIT',
      title: 'In Transit to Destination City',
      location: 'Near Kota, Rajasthan',
      description: 'Shipment is on the way in a secure, GPS-tracked sanitized vehicle.',
      timestamp: '10 May 2025, 11:30 AM',
    },
    {
      id: 8,
      weight: 8,
      stage: 'REACHED_DESTINATION_CITY',
      title: 'Reached Destination City Hub',
      location: `${dropoffCity} Hub`,
      description: 'Consignment arrived at destination sorting and dispatch facility.',
      timestamp: '11 May 2025, 08:00 PM',
    },
    {
      id: 9,
      weight: 9,
      stage: 'OUT_FOR_DELIVERY',
      title: 'Out for Delivery',
      location: dropoffCity,
      description: 'Agent out for delivery to destination hotel / home address.',
      timestamp: '12 May 2025, 02:00 PM',
    },
    {
      id: 10,
      weight: 10,
      stage: 'DELIVERED',
      title: 'Courier Delivered Safely',
      location: meta.deliveryDetails?.hotelName ? `${meta.deliveryDetails.hotelName} Front Desk` : dropoffCity,
      description: 'Courier delivered safely with OTP verification and tamper seal intact.',
      timestamp: '12 May 2025, 05:45 PM',
    },
  ];

  return stages.map((s) => ({
    ...s,
    completed: s.weight <= currentWeight,
    current: s.weight === currentWeight,
    pending: s.weight > currentWeight,
  }));
};

export const serializeBooking = (booking: any) => {
  let meta: any = {};
  if (booking.package?.contentDescription) {
    try {
      meta = JSON.parse(booking.package.contentDescription);
    } catch {
      meta = { description: booking.package.contentDescription };
    }
  }

  const pickupAddr = booking.addresses?.find((a: any) => a.kind === 'PICKUP');
  const dropoffAddr = booking.addresses?.find((a: any) => a.kind === 'DROPOFF');

  const status = meta.status || booking.status || 'CONFIRMED';
  const serviceType = meta.serviceType || booking.serviceType || 'BIKE_PRIORITY';
  const sealNumber = meta.sealNumber || 'DLV-SEAL-88492';
  const agent = meta.agent || defaultAgent;
  const pod = meta.pod || defaultPod;
  const timeline = meta.timeline || generateJourneyTimeline(status, { ...meta, sealNumber, bookingNumber: booking.bookingNumber });

  const rawCat = String(booking.package?.contentCategory || meta.packageDetails?.contentCategory || meta.contentCategory || 'DOCUMENTS');
  const catHumanMap: Record<string, string> = {
    DOCUMENTS: 'Documents',
    ELECTRONICS: 'Electronics',
    CLOTHING_ACCESSORIES: 'Clothing & Apparel',
    GIFTS_TOYS: 'Gifts & Toys',
    HEALTH_MEDICAL: 'Health & Medicine',
    HOUSEHOLD_ITEMS: 'Household Items',
    COMMERCIAL: 'Commercial Goods',
    OTHERS: 'Others',
  };
  const storedCategory = meta.packageDetails?.category || meta.category;
  const isEnumName = storedCategory && catHumanMap[String(storedCategory).toUpperCase()];
  const categoryHuman = (storedCategory && !isEnumName)
    ? storedCategory
    : (catHumanMap[rawCat] || storedCategory || rawCat);

  const rawPkgType = String(booking.package?.packagingType || meta.packageDetails?.packagingType || 'STANDARD');
  const pkgHumanMap: Record<string, string> = {
    STANDARD: 'Delivez Standard Packaging',
    EXTRA_SECURE: 'Extra Secure Packaging (+Bubble Wrap)',
    WOODEN_CRATE: 'Reinforced Heavy-Duty Wooden Crate',
    CUSTOM_BOX: 'Custom Engineered Box',
    OWN_PACKAGING: 'Customer Own Packaging',
  };
  const packagingHuman = pkgHumanMap[rawPkgType] || rawPkgType;

  const serviceHumanMap: Record<string, string> = {
    BIKE_PRIORITY: 'Bike Priority Delivery',
    SAME_DAY: 'Same Day Delivery',
    HYBRID_DRONE: 'Hybrid Drone Delivery',
    NEXT_DAY: 'Next Day Delivery',
    SURFACE_EXPRESS: 'Surface Express',
    AIR_CARGO: 'Air Cargo Delivery',
  };
  const serviceHuman = serviceHumanMap[serviceType] || meta.deliverySpeed || serviceType;

  const selfServiceOpt = booking.selfServiceOption || meta.selfServiceOption || null;
  const selfServiceHumanMap: Record<string, string> = {
    SELF_PICKUP: 'Self Pickup at Nearest Hub (-₹50 Applied)',
    SELF_DROP: 'Self Drop to Hub (-₹40 Applied)',
  };
  const selfServiceHuman = selfServiceOpt ? (selfServiceHumanMap[selfServiceOpt] || selfServiceOpt) : 'Full Doorstep Service';

  const lengthCm = Number(booking.package?.lengthCm ?? meta.packageDetails?.dimensions?.lengthCm ?? meta.packageDetails?.lengthCm ?? 30);
  const widthCm = Number(booking.package?.widthCm ?? meta.packageDetails?.dimensions?.widthCm ?? meta.packageDetails?.widthCm ?? 20);
  const heightCm = Number(booking.package?.heightCm ?? meta.packageDetails?.dimensions?.heightCm ?? meta.packageDetails?.heightCm ?? 10);
  const actualWeightKg = Number(booking.package?.actualWeightKg ?? meta.packageDetails?.actualWeightKg ?? 2.5);
  const chargeableWeightKg = Number(booking.package?.chargeableWeightKg ?? meta.packageDetails?.chargeableWeightKg ?? actualWeightKg);
  const volumetricWeightKg = Math.round(((lengthCm * widthCm * heightCm) / 5000) * 10) / 10;
  const parcelSize = String(booking.package?.parcelSize || meta.packageDetails?.parcelSize || 'MEDIUM');

  return {
    ...booking,
    bookingNumber: booking.bookingNumber,
    status,
    serviceType,
    serviceName: serviceHuman,
    deliverySpeed: serviceHuman,
    serviceSpeed: serviceHuman,
    selfServiceOption: selfServiceOpt,
    selfServiceLabel: selfServiceHuman,
    contentCategory: rawCat,
    category: categoryHuman,
    itemCategory: categoryHuman,
    packagingType: rawPkgType,
    packagingName: packagingHuman,
    parcelSize,
    actualWeightKg,
    chargeableWeightKg,
    volumetricWeightKg,
    dimensions: { lengthCm, widthCm, heightCm },
    sealNumber,
    distanceKm: booking.distanceKm === null ? null : Number(booking.distanceKm),
    baseCharge: Number(booking.baseCharge),
    distanceCharge: Number(booking.distanceCharge),
    weightCharge: Number(booking.weightCharge),
    packagingCharge: Number(booking.packagingCharge),
    insurancePremium: Number(booking.insurancePremium),
    taxAmount: Number(booking.taxAmount),
    totalAmount: Number(booking.totalAmount),
    addresses: Array.isArray(booking.addresses)
      ? booking.addresses.map(serializeAddress)
      : [],
    package: booking.package
      ? {
          ...booking.package,
          actualWeightKg: Number(booking.package.actualWeightKg),
          chargeableWeightKg: Number(booking.package.chargeableWeightKg),
          lengthCm: Number(booking.package.lengthCm),
          widthCm: Number(booking.package.widthCm),
          heightCm: Number(booking.package.heightCm),
          declaredValue:
            booking.package.declaredValue === null
              ? null
              : Number(booking.package.declaredValue),
          boxCapacity: meta.packageDetails?.weightCapacity || meta.boxCapacity || (booking.package.needsBox ? '10 Kg' : null),
          weightCapacity: meta.packageDetails?.weightCapacity || '10 Kg',
          boxSizeName: meta.packageDetails?.boxSize || meta.boxSizeName || (booking.package.needsBox ? 'Small Box (10 Kg)' : null),
          boxSize: meta.packageDetails?.boxSize || (booking.package.needsBox ? 'Small Box (10 Kg)' : null),
          isCustomBox: Boolean(meta.packageDetails?.isCustomBox),
          customBoxDetails: meta.packageDetails?.customBoxDetails || null,
          packagingType: booking.package.packagingType,
          contentCategory: booking.package.contentCategory,
          pickupReadiness: meta.pickupReadiness || 'Today',
          contentDescription: meta.packageDetails?.contentDescription ?? meta.description ?? booking.package.contentDescription,
        }
      : null,
    packageDetails: {
      contentCategory: rawCat,
      category: categoryHuman,
      itemCategory: categoryHuman,
      packagingType: rawPkgType,
      packagingName: packagingHuman,
      parcelSize,
      actualWeightKg,
      chargeableWeightKg,
      volumetricWeightKg,
      dimensions: { lengthCm, widthCm, heightCm },
      lengthCm,
      widthCm,
      heightCm,
      needsBox: Boolean(booking.package?.needsBox ?? meta.packageDetails?.needsBox),
      boxSize: meta.packageDetails?.boxSize || (booking.package?.needsBox ? 'Small Box (10 Kg)' : null),
      weightCapacity: meta.packageDetails?.weightCapacity || '10 Kg',
      isCustomBox: Boolean(meta.packageDetails?.isCustomBox),
      customBoxDetails: meta.packageDetails?.customBoxDetails || null,
      isFragile: Boolean(booking.package?.fragile || meta.packageDetails?.fragile || meta.packageDetails?.isFragile),
      isSecure: Boolean(booking.package?.secureHandling || meta.packageDetails?.secureHandling || meta.packageDetails?.isSecure),
      declaredValue: Number(booking.package?.declaredValue ?? meta.packageDetails?.declaredValue ?? 25000),
      insuranceType: booking.package?.insuranceType ?? meta.packageDetails?.insuranceType ?? 'FULL',
      specialHandling: [
        ...(Boolean(booking.package?.fragile || meta.packageDetails?.fragile) ? ['FRAGILE'] : []),
        ...(Boolean(booking.package?.secureHandling || meta.packageDetails?.secureHandling) ? ['EXTRA_SECURITY'] : []),
      ],
    },
    // APK Mobile Screen Specific Structures
    pickupDetails: meta.pickupDetails || {
      terminal: 'Terminal 3',
      flightNumber: 'AI 102',
      pnr: 'AB12CD',
      luggageBelt: '04',
      pickupOption: 'luggage_belt',
      flightArrivalDate: '10 May 2025',
      timeSlot: '09:00 AM - 11:00 AM',
      name: pickupAddr?.contactName || 'Rahul Sharma',
      phone: pickupAddr?.phoneNumber || '+91 98765 43210',
      address: pickupAddr?.addressLine1 || 'Indira Gandhi International Airport, Terminal 3',
      city: pickupAddr?.city || 'New Delhi',
      state: pickupAddr?.state || 'Delhi',
      pincode: pickupAddr?.postalCode || '110037',
    },
    deliveryDetails: meta.deliveryDetails || {
      hotelName: 'Taj City Centre',
      roomNumber: '402',
      guestName: dropoffAddr?.contactName || 'Rahul Sharma',
      deliveryOption: 'hotel_reception',
      name: dropoffAddr?.contactName || 'Rahul Sharma',
      phone: dropoffAddr?.phoneNumber || '+91 98765 43210',
      address: dropoffAddr?.addressLine1 || 'Taj City Centre, Sector 44',
      city: dropoffAddr?.city || 'Gurugram',
      state: dropoffAddr?.state || 'Haryana',
      pincode: dropoffAddr?.postalCode || '122004',
    },
    luggage: meta.luggage || [
      { id: 1, type: 'Check-in Bag', size: 'Large', weight: 15, tag: 'AI-48291' },
      { id: 2, type: 'Cabin Bag', size: 'Medium', weight: 13, tag: 'AI-48292' },
    ],
    totalBags: meta.totalBags || 2,
    totalWeightKg: meta.totalWeightKg || (booking.package ? Number(booking.package.actualWeightKg) : 28),
    addons: meta.addons || ['AIRPORT_ASSIST', 'SEAL_WRAP', 'SANITISED_VAN'],
    luggageProtection: meta.luggageProtection || ['THEFT_COVER', 'DAMAGE_COVER'],
    airportAssistance: meta.airportAssistance || ['BELT_PICKUP', 'PORTER_HELP'],
    schedule: meta.schedule || {
      pickupDate: '10 May 2025',
      pickupSlot: '10:00 AM - 12:00 PM',
      deliverySpeed: 'EXPRESS',
      estimatedDelivery: '12 May 2025 by 06:00 PM',
    },
    fareBreakdown: meta.fareBreakdown || {
      baseCharge: 1200,
      distanceCharge: 360,
      luggageCharge: 160,
      airportCharge: 150,
      addonsCharge: 250,
      deliverySpeedCharge: 100,
      gst: 370.8,
      discount: 235,
      totalAmount: Number(booking.totalAmount) || 2395.8,
      promoCode: meta.promoCode || 'DELIVEZ10',
    },
    agent,
    timeline,
    journey: timeline,
    pod,
    meta,
  };
};

export const getOptions: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: getCourierOptions(),
  });
};

export const createQuote: RequestHandler = (req, res) => {
  const input = validateCourierRequest(req.body);
  const quote = calculateCourierQuote(input as any);

  res.status(200).json({
    status: 'success',
    data: { quote },
  });
};

export const createBooking: RequestHandler = async (req, res) => {
  const idempotencyKey = validateIdempotencyKey(req.get('Idempotency-Key'));
  const input = validateCourierRequest(req.body);
  const requestFingerprint = fingerprint(input);
  const userId = req.user!.id;

  const existing = await prisma.courierBooking.findUnique({
    where: { userId_idempotencyKey: { userId, idempotencyKey } },
    include: bookingInclude,
  });

  if (existing) {
    if (existing.requestFingerprint !== requestFingerprint) {
      throw new AppError(
        409,
        'This Idempotency-Key was already used for different booking details.',
      );
    }
    res.status(200).json({
      status: 'success',
      data: { booking: serializeBooking(existing), idempotentReplay: true },
    });
    return;
  }

  const quote = calculateCourierQuote(input as any);
  const personalCourierService = await prisma.service.findFirst({
    where: { slug: 'personal-courier', isActive: true },
    select: { id: true },
  });

  const bNumber = makeBookingNumber();
  const status = 'CONFIRMED';
  const paymentStatus = input.paymentMethod === 'PAY_ON_DELIVERY' ? 'NOT_REQUIRED' : 'PAID';
  const confirmedAt = new Date();

  // Helper enum mappers
  const mapPrismaServiceType = (st: string): any => {
    if (['BIKE_PRIORITY', 'SAME_DAY', 'HYBRID_DRONE', 'SURFACE_EXPRESS', 'NEXT_DAY'].includes(st)) {
      return st;
    }
    const clean = String(st).toUpperCase().replace(/[\s-]+/g, '_');
    if (clean.includes('BIKE')) return 'BIKE_PRIORITY';
    if (clean.includes('SAME_DAY')) return 'SAME_DAY';
    if (clean.includes('DRONE') || clean.includes('HYBRID')) return 'HYBRID_DRONE';
    if (clean.includes('NEXT_DAY')) return 'NEXT_DAY';
    return 'SURFACE_EXPRESS';
  };

  const mapPrismaParcelSize = (sz: string): any => {
    if (['SMALL', 'MEDIUM', 'LARGE', 'CUSTOM'].includes(sz)) return sz;
    return 'SMALL';
  };

  const mapPrismaPackagingType = (pt: string): any => {
    if (['STANDARD', 'EXTRA_SECURE', 'WOODEN_CRATE', 'OWN_PACKAGING'].includes(pt)) return pt;
    return 'STANDARD';
  };

  const mapPrismaContentCategory = (cc: string): any => {
    if (!cc) return 'DOCUMENTS';
    const str = String(cc).trim().toUpperCase().replace(/[\s&-]+/g, '_');
    if (str.includes('DOC') || str.includes('PAPER') || str.includes('FILE') || str.includes('BOOK')) return 'DOCUMENTS';
    if (str.includes('ELECT') || str.includes('GADGET') || str.includes('MOBILE') || str.includes('LAPTOP')) return 'ELECTRONICS';
    if (str.includes('CLOTH') || str.includes('APPAREL') || str.includes('FASHION') || str.includes('SHIRT') || str.includes('DRESS') || str.includes('WEAR')) return 'CLOTHING_ACCESSORIES';
    if (str.includes('GIFT') || str.includes('TOY') || str.includes('DECOR')) return 'GIFTS_TOYS';
    if (str.includes('HEALTH') || str.includes('MEDIC') || str.includes('PHARMA') || str.includes('SUPPLEMENT')) return 'HEALTH_MEDICAL';
    if (str.includes('HOUSE') || str.includes('HOME') || str.includes('KITCHEN') || str.includes('DAILY')) return 'HOUSEHOLD_ITEMS';
    if (str.includes('COMMERCIAL') || str.includes('GOODS') || str.includes('SAMPLE') || str.includes('RAW') || str.includes('PART')) return 'COMMERCIAL';
    if (['DOCUMENTS', 'ELECTRONICS', 'CLOTHING_ACCESSORIES', 'GIFTS_TOYS', 'HEALTH_MEDICAL', 'HOUSEHOLD_ITEMS', 'COMMERCIAL', 'OTHERS'].includes(str)) return str;
    return 'OTHERS';
  };

  const mapPrismaInsuranceType = (it: string): any => {
    if (['FULL', 'BASIC', 'NONE'].includes(it)) return it;
    return 'FULL';
  };

  // Combine rich APK metadata into package.contentDescription
  const meta: any = {
    bookingNumber: bNumber,
    status,
    serviceType: input.serviceType,
    deliverySpeed: input.deliverySpeed,
    selfServiceOption: input.selfServiceOption,
    pickupDetails: (input as any).pickupDetails || {},
    deliveryDetails: (input as any).deliveryDetails || {},
    packageDetails: {
      ...input.package,
      chargeableWeightKg: quote.chargeableWeightKg,
      isFragile: Boolean(input.package.fragile),
      isSecure: Boolean(input.package.secureHandling),
      dimensions: {
        lengthCm: input.package.lengthCm,
        widthCm: input.package.widthCm,
        heightCm: input.package.heightCm,
      },
    },
    luggage: (input as any).luggage || [],
    totalBags: (input as any).totalBags || 1,
    totalWeightKg: input.package.actualWeightKg || (input as any).totalWeightKg || 2.5,
    addons: input.addons || [],
    luggageProtection: (input as any).luggageProtection || [],
    airportAssistance: (input as any).airportAssistance || [],
    schedule: input.schedule || {
      pickupDate: 'Today',
      pickupSlot: 'ASAP',
      deliverySpeed: input.deliverySpeed || 'STANDARD',
      estimatedDelivery: 'Same Day by 06:00 PM',
    },
    fareBreakdown: {
      baseCharge: quote.breakdown.baseCharge,
      distanceCharge: quote.breakdown.distanceCharge,
      luggageCharge: quote.breakdown.weightCharge,
      airportCharge: (quote as any).airportHandlingFee || 0,
      addonsCharge: quote.breakdown.packagingCharge,
      deliverySpeedCharge: quote.breakdown.baseCharge,
      gst: quote.breakdown.taxAmount,
      discount: quote.breakdown.discountAmount || 0,
      totalAmount: quote.totalAmount,
      promoCode: input.promoCode || 'DELIVEZ10',
    },
    sealNumber: 'DLV-SEAL-' + Math.floor(10000 + Math.random() * 90000),
    agent: defaultAgent,
    pod: defaultPod,
  };

  const initialTimeline = generateJourneyTimeline(status, meta);
  meta.timeline = initialTimeline;

  try {
    const booking = await prisma.courierBooking.create({
      data: {
        bookingNumber: bNumber,
        userId,
        serviceId: personalCourierService?.id ?? null,
        idempotencyKey,
        requestFingerprint,
        status: 'CONFIRMED',
        serviceType: mapPrismaServiceType(input.serviceType),
        pickupScheduleType: input.schedule?.pickupDate ? 'SCHEDULED' : 'ASAP',
        scheduledPickupAt: null,
        distanceKm: quote.distanceKm,
        pricingVersion: quote.pricingVersion,
        currency: quote.currency,
        baseCharge: quote.breakdown.baseCharge,
        distanceCharge: quote.breakdown.distanceCharge,
        weightCharge: quote.breakdown.weightCharge,
        packagingCharge: quote.breakdown.packagingCharge,
        insurancePremium: quote.breakdown.insurancePremium,
        taxAmount: quote.breakdown.taxAmount,
        totalAmount: quote.totalAmount,
        paymentMethod: (input.paymentMethod === 'PAY_ON_DELIVERY' ? 'PAY_ON_DELIVERY' : 'ONLINE') as any,
        paymentStatus,
        confirmedAt,
        addresses: {
          create: [
            { kind: 'PICKUP', ...sanitizeCourierBookingAddress(input.pickup, 'Pickup Location') },
            { kind: 'DROPOFF', ...sanitizeCourierBookingAddress(input.dropoff, 'Delivery Location') },
          ],
        },
        package: {
          create: {
            actualWeightKg: input.package.actualWeightKg,
            chargeableWeightKg: quote.chargeableWeightKg,
            lengthCm: input.package.lengthCm,
            widthCm: input.package.widthCm,
            heightCm: input.package.heightCm,
            declaredValue: input.package.declaredValue,
            parcelSize: mapPrismaParcelSize(input.package.parcelSize),
            needsBox: input.package.needsBox,
            packagingType: mapPrismaPackagingType(input.package.packagingType),
            contentCategory: mapPrismaContentCategory(input.package.contentCategory || input.contentCategory || (input as any).packageCategory),
            insuranceType: mapPrismaInsuranceType(input.package.insuranceType),
            specialHandling: Boolean(input.package.specialHandling || input.package.fragile || input.package.secureHandling),
            fragile: Boolean(input.package.fragile),
            secureHandling: Boolean(input.package.secureHandling),
            contentDescription: JSON.stringify(meta),
          },
        },
      },
      include: bookingInclude,
    });

    res.status(201).json({

      status: 'success',
      data: { booking: serializeBooking(booking), idempotentReplay: false },
    });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const replay = await prisma.courierBooking.findUnique({
        where: { userId_idempotencyKey: { userId, idempotencyKey } },
        include: bookingInclude,
      });
      if (replay?.requestFingerprint === requestFingerprint) {
        res.status(200).json({
          status: 'success',
          data: { booking: serializeBooking(replay), idempotentReplay: true },
        });
        return;
      }
    }
    throw error;
  }
};

export const listBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1);
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(String(req.query.limit ?? '10'), 10) || 10),
  );
  const userId = req.user!.id;

  const [bookings, total] = await Promise.all([
    prisma.courierBooking.findMany({
      where: { userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.courierBooking.count({ where: { userId } }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map(serializeBooking),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    },
  });
};

export const getBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.courierBooking.findFirst({
    where: {
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
      userId,
    },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(booking) },
  });
};

export const cancelBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.courierBooking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  if (booking.status === 'DELIVERED' || booking.status === 'CANCELLED') {
    throw new AppError(400, `Cannot cancel booking with status ${booking.status}.`);
  }

  let meta: any = {};
  if (booking.package?.contentDescription) {
    try {
      meta = JSON.parse(booking.package.contentDescription);
    } catch {
      meta = { description: booking.package.contentDescription };
    }
  }
  meta.status = 'CANCELLED';

  if (booking.package) {
    await prisma.courierBookingPackage.update({
      where: { id: booking.package.id },
      data: { contentDescription: JSON.stringify(meta) },
    });
  }

  const updated = await prisma.courierBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
    include: bookingInclude,
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(updated) },
  });
};

export const completeSandboxPayment: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const booking = await prisma.courierBooking.findFirst({
    where: { id: bookingId, userId },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  if (booking.paymentStatus === 'PAID') {
    res.status(200).json({
      status: 'success',
      data: {
        booking: serializeBooking(booking),
        alreadyPaid: true,
      },
    });
    return;
  }

  const payload = validateSandboxPayment(req.body);
  const now = new Date();

  const updated = await prisma.courierBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentProvider: SANDBOX_PAYMENT_PROVIDER,
      paymentReference: makeSandboxPaymentReference(payload.outcome),
      confirmedAt: booking.confirmedAt ?? now,
    },
    include: bookingInclude,
  });

  res.status(200).json({
    status: 'success',
    data: {
      booking: serializeBooking(updated),
      alreadyPaid: false,
    },
  });
};

export const updateBooking: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const bookingId = String(req.params.id);

  const existing = await prisma.courierBooking.findFirst({
    where: {
      OR: [{ id: bookingId }, { bookingNumber: bookingId }],
      userId,
    },
    include: bookingInclude,
  });

  if (!existing) {
    throw new AppError(404, 'Courier booking not found.');
  }

  const {
    pickup,
    dropoff,
    package: pkg,
    serviceType,
    pickupSchedule,
    pickupDetails,
    deliveryDetails,
    luggage,
    addons,
    schedule,
    agent,
    status,
  } = req.body;

  // Update pickup address
  if (pickup) {
    const pickupRecord = existing.addresses.find((a) => a.kind === 'PICKUP');
    if (pickupRecord) {
      await prisma.courierBookingAddress.update({
        where: { id: pickupRecord.id },
        data: {
          contactName: pickup.contactName ?? pickupRecord.contactName,
          phoneNumber: pickup.phoneNumber ?? pickupRecord.phoneNumber,
          addressLine1: pickup.addressLine1 ?? pickupRecord.addressLine1,
          addressLine2: pickup.addressLine2 ?? pickupRecord.addressLine2,
          landmark: pickup.landmark ?? pickupRecord.landmark,
          city: pickup.city ?? pickupRecord.city,
          state: pickup.state ?? pickupRecord.state,
          postalCode: pickup.postalCode ?? pickupRecord.postalCode,
          country: pickup.country ?? pickupRecord.country,
        },
      });
    }
  }

  // Update dropoff address
  if (dropoff) {
    const dropoffRecord = existing.addresses.find((a) => a.kind === 'DROPOFF');
    if (dropoffRecord) {
      await prisma.courierBookingAddress.update({
        where: { id: dropoffRecord.id },
        data: {
          contactName: dropoff.contactName ?? dropoffRecord.contactName,
          phoneNumber: dropoff.phoneNumber ?? dropoffRecord.phoneNumber,
          addressLine1: dropoff.addressLine1 ?? dropoffRecord.addressLine1,
          addressLine2: dropoff.addressLine2 ?? dropoffRecord.addressLine2,
          landmark: dropoff.landmark ?? dropoffRecord.landmark,
          city: dropoff.city ?? dropoffRecord.city,
          state: dropoff.state ?? dropoffRecord.state,
          postalCode: dropoff.postalCode ?? dropoffRecord.postalCode,
          country: dropoff.country ?? dropoffRecord.country,
        },
      });
    }
  }

  // Update meta in contentDescription
  let meta: any = {};
  if (existing.package?.contentDescription) {
    try {
      meta = JSON.parse(existing.package.contentDescription);
    } catch {
      meta = { description: existing.package.contentDescription };
    }
  }

  if (serviceType) meta.serviceType = serviceType;
  if (pickupDetails) meta.pickupDetails = { ...meta.pickupDetails, ...pickupDetails };
  if (deliveryDetails) meta.deliveryDetails = { ...meta.deliveryDetails, ...deliveryDetails };
  if (luggage) meta.luggage = luggage;
  if (addons) meta.addons = addons;
  if (schedule) meta.schedule = { ...meta.schedule, ...schedule };
  if (agent) meta.agent = { ...meta.agent, ...agent };
  if (status) {
    meta.status = status;
    meta.timeline = generateJourneyTimeline(status, meta);
  }

  if (existing.package) {
    await prisma.courierBookingPackage.update({
      where: { id: existing.package.id },
      data: {
        contentDescription: JSON.stringify(meta),
        actualWeightKg: pkg?.actualWeightKg !== undefined ? Number(pkg.actualWeightKg) : existing.package.actualWeightKg,
      },
    });
  }

  const updated = await prisma.courierBooking.findUnique({
    where: { id: existing.id },
    include: bookingInclude,
  });

  res.status(200).json({
    status: 'success',
    data: { booking: serializeBooking(updated) },
  });
};

export const getBookingTracking: RequestHandler = async (req, res) => {
  const idOrNumber = String(req.params.id);
  const booking = await prisma.courierBooking.findFirst({
    where: { OR: [{ id: idOrNumber }, { bookingNumber: idOrNumber }] },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  const serialized = serializeBooking(booking);
  res.status(200).json({
    status: 'success',
    data: {
      tracking: {
        bookingId: serialized.bookingNumber,
        status: serialized.status,
        expectedDelivery: serialized.schedule?.estimatedDelivery || '12 May 2025 by 06:00 PM',
        currentLocation: 'Near Kota, Rajasthan',
        destinationHub: `${serialized.deliveryDetails?.city || 'Gurugram'} Hub`,
        driverCoordinates: { latitude: 28.4595, longitude: 77.0266 },
        pickupCoordinates: { latitude: 28.5562, longitude: 77.1000 },
        deliveryCoordinates: { latitude: 28.4682, longitude: 77.0654 },
        agent: serialized.agent,
        sealNumber: serialized.sealNumber,
        journey: serialized.timeline,
        timeline: serialized.timeline,
        // DYNAMIC CONSIGNMENT & PACKAGE SPECS:
        contentCategory: serialized.contentCategory,
        category: serialized.category,
        itemCategory: serialized.itemCategory,
        packagingType: serialized.packagingType,
        packagingName: serialized.packagingName,
        serviceType: serialized.serviceType,
        serviceName: serialized.serviceName,
        selfServiceOption: serialized.selfServiceOption,
        selfServiceLabel: serialized.selfServiceLabel,
        parcelSize: serialized.parcelSize,
        actualWeightKg: serialized.actualWeightKg,
        chargeableWeightKg: serialized.chargeableWeightKg,
        volumetricWeightKg: serialized.volumetricWeightKg,
        dimensions: serialized.dimensions,
        packageDetails: serialized.packageDetails,
        package: serialized.package,
      },
    },
  });
};

export const getBookingPod: RequestHandler = async (req, res) => {
  const idOrNumber = String(req.params.id);
  const booking = await prisma.courierBooking.findFirst({
    where: { OR: [{ id: idOrNumber }, { bookingNumber: idOrNumber }] },
    include: bookingInclude,
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  const serialized = serializeBooking(booking);
  res.status(200).json({
    status: 'success',
    data: {
      pod: serialized.pod,
      agent: serialized.agent,
      bookingNumber: serialized.bookingNumber,
      status: serialized.status,
      deliveredAt: serialized.pod.deliveredAt,
      sealNumber: serialized.sealNumber,
      otp: serialized.pod.otp,
      receivedBy: serialized.pod.receivedBy,
      relationship: serialized.pod.relationship,
      signatureUrl: serialized.pod.signatureUrl,
      photoUrl: serialized.pod.photoUrl,
      sealPhotoUrl: serialized.pod.sealPhotoUrl,
      deliveredTo: serialized.pod.deliveredTo,
    },
  });
};
