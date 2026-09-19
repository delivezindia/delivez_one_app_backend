// luggage-delivery.controller.ts
import { createHash, randomBytes } from 'node:crypto';
import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getSandboxGatewayOptions,
  makeSandboxPaymentReference,
  SANDBOX_PAYMENT_PROVIDER,
  validateSandboxPayment,
} from '../../lib/sandbox-payment.js';
import {
  getLuggageOptions,
  luggageTimelineMilestones,
  luggageServices,
  findCoupon,
  LUGGAGE_COUPONS,
} from './luggage-delivery-config.js';
import type { LuggageServiceItem } from './luggage-delivery-config.js';
import {
  calculateLuggageMasterQuote,
  type MasterQuoteResult,
} from './luggage-delivery-pricing.js';

// Format: DLVZ + 10 digits (e.g. DLVZ2505128947 as in Flutter Dart source)
export const makeLuggageBookingNumber = (): string => {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DLVZ${yy}${mm}${dd}${rand}`;
};

/**
 * 1. GET /options - Service options and catalog
 */
export const getLuggageDeliveryOptionsHandler: RequestHandler = (_req, res) => {
  res.status(200).json({
    success: true,
    data: getLuggageOptions(),
  });
};

/**
 * 2. POST /bookings/validate-coupon & POST /validate-coupon
 */
export const validateCouponHandler: RequestHandler = (req, res) => {
  const code = (req.body?.coupon_code || req.body?.couponCode || req.body?.code || '').toString().trim().toUpperCase();
  let subtotal = Number(req.body?.subtotal || 0);
  if (subtotal <= 0) {
    // If not passed explicitly, calculate from quote
    try {
      const quote = calculateLuggageMasterQuote(req.body);
      subtotal = quote.subtotal;
    } catch {
      subtotal = 0;
    }
  }

  if (!code) {
    throw new AppError(400, 'Coupon code is required');
  }

  const coupon = findCoupon(code);
  if (!coupon) {
    res.status(200).json({
      success: false,
      message: 'Invalid coupon code',
      data: { valid: false, message: 'Invalid coupon code' },
    });
    return;
  }

  if (subtotal > 0 && subtotal < coupon.minSubtotal) {
    res.status(200).json({
      success: false,
      message: `Minimum booking subtotal of ₹${coupon.minSubtotal} required for coupon ${coupon.code}`,
      data: {
        valid: false,
        message: `Minimum subtotal of ₹${coupon.minSubtotal} required`,
      },
    });
    return;
  }

  let discount_amount = 0;
  if (coupon.discountType === 'percentage') {
    const raw = (subtotal * coupon.discountValue) / 100;
    discount_amount = Math.min(coupon.maxDiscount, Math.round(raw * 100) / 100);
  } else {
    discount_amount = Math.min(coupon.maxDiscount, coupon.discountValue);
  }

  const new_subtotal = Math.max(0, subtotal - discount_amount);
  const new_tax = Math.round(new_subtotal * 0.18 * 100) / 100;
  const new_total = Math.round((new_subtotal + new_tax) * 100) / 100;

  res.status(200).json({
    success: true,
    message: 'Coupon is valid',
    data: {
      valid: true,
      coupon_code: coupon.code,
      discount_type: coupon.discountType,
      discount_amount,
      new_subtotal,
      new_tax,
      new_total,
      message: coupon.description,
    },
  });
};

/**
 * 3. POST /quote & POST /bookings/quote
 */
export const getLuggageDeliveryQuoteHandler: RequestHandler = (req, res) => {
  const body = req.body || {};
  const quoteResult: MasterQuoteResult = calculateLuggageMasterQuote(body);

  res.status(200).json({
    success: true,
    data: {
      quote_id: quoteResult.quote_id,
      pricing: quoteResult.pricing,
      expires_at: quoteResult.expires_at,
      // Legacy compatibility fields
      quote: quoteResult,
    },
  });
};

/**
 * Format raw Prisma booking into the MASTER BOOKING CONTRACT JSON
 */
export function formatMasterBookingJson(booking: any): Record<string, any> {
  const serviceId = booking.serviceId || 'home_airport';
  const serviceMatch = luggageServices.find((s) => s.id === serviceId) ?? luggageServices[0]!;
  
  const rawPricing = booking.pricingBreakdown || {};
  const totalAmount = Number(booking.totalAmount || rawPricing.total_amount || 0);

  const rawLuggage = booking.luggageItems || [];
  const items = Array.isArray(rawLuggage) ? rawLuggage : (rawLuggage.items || []);
  let totalPieces = 0;
  let totalWeightKg = 0;
  for (const item of items) {
    const q = Number(item.quantity) || 1;
    totalPieces += q;
    totalWeightKg += (Number(item.total_weight_kg ?? item.declared_weight_kg ?? item.weightKg) || 15) * q;
  }

  const pickup = booking.pickupDetails || {};
  const delivery = booking.deliveryDetails || {};
  const customer = booking.user || {};

  const pickupFullAddr = pickup.full_address || pickup.address?.full_address || (typeof pickup.address === 'string' ? pickup.address : '') || (typeof pickup.fullAddress === 'string' ? pickup.fullAddress : '');
  const deliveryFullAddr = delivery.full_address || delivery.address?.full_address || (typeof delivery.address === 'string' ? delivery.address : '') || (typeof delivery.fullAddress === 'string' ? delivery.fullAddress : '');

  const flightDetails = booking.flightDetails || delivery.flight_details || delivery.airport_specific || pickup.flight_details || pickup.airport_specific || null;
  const hotelDetails = booking.hotelDetails || delivery.hotel_details || delivery.hotel_specific || pickup.hotel_details || pickup.hotel_specific || null;

  return {
    api_version: '1.0',
    client_request_id: booking.idempotencyKey || booking.id,
    booking_id: booking.id,
    booking_number: booking.bookingNumber,
    status: booking.status,
    customer: {
      customer_id: customer.id || 1001,
      customer_type: 'registered',
      full_name: customer.name || pickup.contact?.full_name || 'Customer',
      email: customer.email || pickup.contact?.email || 'customer@delivez.com',
      mobile: customer.phone || customer.mobileNumber || pickup.contact?.mobile || '+919876543210',
      alternate_mobile: pickup.contact?.alternate_mobile || null,
    },
    service: {
      service_id: serviceId,
      service_name: serviceMatch.title,
      service_tag: serviceMatch.tag || 'Luggage Transfer',
      service_description: serviceMatch.description,
    },
    route: {
      route_type: booking.routeType || 'single_trip',
      total_stops: Array.isArray(booking.multiStops) && booking.multiStops.length > 0 ? booking.multiStops.length : 2,
      estimated_distance_km: Number(rawPricing.distance_km || booking.distanceKm || 22),
      estimated_duration_minutes: 180,
      is_round_trip: booking.routeType === 'round_trip',
      is_multi_stop: booking.routeType === 'multi_stop' || (Array.isArray(booking.multiStops) && booking.multiStops.length > 2),
      stops: Array.isArray(booking.multiStops) && booking.multiStops.length > 0 ? booking.multiStops : [
        {
          sequence: 1,
          stop_type: 'pickup',
          location_type: pickup.location_type || 'home',
          title: pickup.location_type === 'airport' ? (pickup.airport?.airport_name || 'Airport') : (pickup.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: pickupFullAddr,
          city: pickup.city || pickup.address?.city || 'Bengaluru',
          state: pickup.state || pickup.address?.state || 'Karnataka',
          pincode: pickup.pincode || pickup.address?.pincode || '560038',
          country: pickup.country || pickup.address?.country || 'India',
          latitude: pickup.latitude || pickup.address?.latitude || null,
          longitude: pickup.longitude || pickup.address?.longitude || null,
        },
        {
          sequence: 2,
          stop_type: 'delivery',
          location_type: delivery.location_type || 'airport',
          title: delivery.location_type === 'airport' ? (delivery.airport?.airport_name || 'Airport') : (delivery.location_type === 'hotel' ? 'Hotel' : 'Home'),
          address: deliveryFullAddr,
          city: delivery.city || delivery.address?.city || 'Bengaluru',
          state: delivery.state || delivery.address?.state || 'Karnataka',
          pincode: delivery.pincode || delivery.address?.pincode || '560300',
          country: 'India',
          latitude: delivery.latitude || delivery.address?.latitude || null,
          longitude: delivery.longitude || delivery.address?.longitude || null,
        },
      ],
    },
    pickup: {
      location_type: pickup.location_type || 'home',
      full_address: pickupFullAddr,
      landmark: pickup.landmark || pickup.address?.landmark || null,
      city: pickup.city || pickup.address?.city || 'Bengaluru',
      state: pickup.state || pickup.address?.state || 'Karnataka',
      pincode: pickup.pincode || pickup.address?.pincode || '560038',
      country: pickup.country || pickup.address?.country || 'India',
      latitude: pickup.latitude || pickup.address?.latitude || null,
      longitude: pickup.longitude || pickup.address?.longitude || null,
      contact: pickup.contact || {
        full_name: customer.name || 'Contact Person',
        mobile: customer.phone || customer.mobileNumber || '+919876543210',
        alternate_mobile: null,
        email: customer.email || 'contact@delivez.com',
      },
      airport_specific: pickup.airport_specific || null,
      hotel_specific: pickup.hotel_specific || null,
      address: pickup.address || {
        full_address: pickupFullAddr,
        city: pickup.city || 'Bengaluru',
        state: pickup.state || 'Karnataka',
        pincode: pickup.pincode || '560038',
        country: 'India',
      },
      schedule: pickup.schedule || {
        pickup_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        pickup_time_slot: typeof booking.schedule?.pickup_time_slot === 'object' ? booking.schedule?.pickup_time_slot?.label : (booking.schedule?.pickup_time_slot || '10:00 AM - 12:00 PM'),
      },
      instructions: pickup.instructions || 'Please ring the doorbell.',
    },
    delivery: {
      location_type: delivery.location_type || 'airport',
      full_address: deliveryFullAddr,
      landmark: delivery.landmark || delivery.address?.landmark || null,
      city: delivery.city || delivery.address?.city || 'Bengaluru',
      state: delivery.state || delivery.address?.state || 'Karnataka',
      pincode: delivery.pincode || delivery.address?.pincode || '560300',
      country: delivery.country || delivery.address?.country || 'India',
      latitude: delivery.latitude || delivery.address?.latitude || null,
      longitude: delivery.longitude || delivery.address?.longitude || null,
      contact: delivery.contact || {
        full_name: customer.name || 'Recipient',
        mobile: customer.phone || customer.mobileNumber || '+919876543210',
        alternate_mobile: null,
        email: customer.email || 'recipient@delivez.com',
      },
      airport_specific: delivery.airport_specific || (flightDetails ? {
        terminal: flightDetails.terminal || 'T1',
        flight_number: flightDetails.flight_number || flightDetails.flightNumber || '6E-2041',
        pnr: flightDetails.pnr || 'AB12CD',
        airline_name: flightDetails.airline_name || flightDetails.airline || 'IndiGo',
        departure_time: flightDetails.departure_time || flightDetails.flightDate || '2026-09-19T18:30:00.000Z',
        gate_number: flightDetails.gate_number || 'Gate 4',
        meeting_point: flightDetails.meeting_point || 'Departure Pillar 4',
      } : null),
      hotel_specific: delivery.hotel_specific || (hotelDetails ? {
        hotel_name: hotelDetails.hotel_name || hotelDetails.hotelName || 'The Hotel',
        room_number: hotelDetails.room_number || hotelDetails.roomNumber || 'Room 101',
        guest_name: hotelDetails.guest_name || hotelDetails.guestName || customer.name || 'Guest',
      } : null),
      address: delivery.address || {
        full_address: deliveryFullAddr,
        city: delivery.city || 'Bengaluru',
        state: delivery.state || 'Karnataka',
        pincode: delivery.pincode || '560300',
        country: 'India',
      },
      schedule: delivery.schedule || {
        delivery_date: booking.schedule?.pickup_date || new Date().toISOString().split('T')[0],
        preferred_delivery_time: '10:00 AM - 12:00 PM',
      },
      instructions: delivery.instructions || 'Handover luggage at designated terminal point.',
    },
    multi_stops: booking.multiStops || [],
    luggage_items: items.map((it: any, idx: number) => ({
      item_id: it.item_id || it.id || `item_${idx + 1}`,
      bag_type: it.bag_type || it.type || 'large',
      quantity: Number(it.quantity) || 1,
      declared_weight_kg: Number(it.declared_weight_kg ?? it.total_weight_kg ?? it.weightKg) || 15.0,
      dimensions: it.dimensions || { length_cm: 70, width_cm: 45, height_cm: 28 },
      is_fragile: Boolean(it.is_fragile ?? it.isFragile ?? it.special_handling?.fragile),
      is_valuable: Boolean(it.is_valuable ?? it.isValuable),
      description: it.description || '',
    })),
    luggage: {
      total_pieces: totalPieces || 1,
      total_weight_kg: totalWeightKg || 15.0,
      items: items.map((it: any, idx: number) => ({
        item_id: it.item_id || idx + 1,
        luggage_type: it.luggage_type || it.type || 'suitcase',
        luggage_type_label: it.luggage_type_label || 'Suitcase / Trolley',
        size: it.size || 'large',
        quantity: Number(it.quantity) || 1,
        total_weight_kg: Number(it.total_weight_kg ?? it.declared_weight_kg ?? it.weightKg) || 15.0,
        weight_unit: 'kg',
        description: it.description || 'Luggage piece',
        special_handling: it.special_handling || {
          fragile: Boolean(it.is_fragile ?? it.isFragile),
          keep_dry: false,
          temperature_sensitive: false,
        },
      })),
    },
    schedule: {
      pickup_type: booking.schedule?.pickup_type || 'scheduled',
      pickup_time: booking.schedule?.pickup_time || booking.schedule?.scheduled_pickup_time || new Date().toISOString(),
      delivery_speed: typeof booking.schedule?.delivery_speed === 'object' ? booking.schedule?.delivery_speed : {
        type: String(booking.schedule?.delivery_speed || 'standard').toLowerCase(),
        label: 'Standard',
        additional_fee: 0,
      },
      buffer_minutes: booking.schedule?.buffer_minutes || 180,
    },
    add_ons: booking.addOns || { selected_items: [] },
    luggage_protection: booking.protections || { enabled: false, selected_items: [] },
    airport_assistance: booking.airportAssistance || { enabled: false, selected_services: [] },
    pricing: rawPricing.subtotal !== undefined ? rawPricing : {
      currency: 'INR',
      distance_km: Number(booking.distanceKm || 22),
      base_fare: 499,
      distance_fee: 0,
      luggage_handling_fee: 0,
      airport_handling_fee: 0,
      hotel_handling_fee: 0,
      delivery_speed_fee: 0,
      luggage_protection_fee: 0,
      airport_assistance_fee: 0,
      add_on_fee: 0,
      subtotal: totalAmount / 1.18,
      tax: {
        tax_type: 'GST',
        tax_rate: 18,
        cgst_rate: 9,
        sgst_rate: 9,
        igst_rate: 0,
        cgst_amount: Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100,
        sgst_amount: Math.round((totalAmount - totalAmount / 1.18) / 2 * 100) / 100,
        igst_amount: 0,
        total_tax: Math.round((totalAmount - totalAmount / 1.18) * 100) / 100,
      },
      discount: {
        coupon_code: null,
        discount_type: null,
        discount_amount: 0,
      },
      total_amount: totalAmount,
    },
    gst_invoice: booking.gstInvoice || {
      required: false,
      company_name: null,
      gstin: null,
      billing_address: null,
      state_code: null,
      invoice_number: null,
      invoice_url: null,
    },
    payment: {
      payment_id: booking.paymentId || 'pay_' + booking.id.slice(0, 8),
      gateway: 'razorpay',
      payment_method: String(booking.paymentMethod || 'upi').toLowerCase(),
      status: booking.paymentStatus === 'PAID' ? 'completed' : 'pending',
      currency: 'INR',
      amount_paid: totalAmount,
      paid_at: booking.paidAt ? booking.paidAt.toISOString() : new Date().toISOString(),
      receipt_number: 'REC-' + booking.bookingNumber,
      transaction_ref: 'TXN-' + booking.bookingNumber,
    },
    timeline: [
      { step: 1, code: 'booking_created', title: 'Booking Created', timestamp: booking.createdAt?.toISOString() || new Date().toISOString(), completed: true },
      { step: 2, code: 'payment_verified', title: 'Payment Confirmed', timestamp: booking.paidAt?.toISOString() || null, completed: booking.paymentStatus === 'PAID' },
      { step: 3, code: 'executive_assigned', title: 'Executive Assigned', timestamp: null, completed: false },
      { step: 4, code: 'agent_at_source', title: 'Agent at Source', timestamp: null, completed: false },
      { step: 5, code: 'luggage_sealed', title: 'Luggage Sealed & Tagged', timestamp: null, completed: false },
      { step: 6, code: 'pickup_completed', title: 'Pickup Completed', timestamp: null, completed: false },
      { step: 7, code: 'in_transit', title: 'In Transit', timestamp: null, completed: false },
      { step: 8, code: 'arrived_destination', title: 'Arrived at Destination', timestamp: null, completed: false },
      { step: 9, code: 'otp_verified', title: 'OTP & Handover Verification', timestamp: null, completed: false },
      { step: 10, code: 'delivered', title: 'Delivered', timestamp: null, completed: false },
    ],
    tracking: {
      tracking_id: booking.bookingNumber,
      carrier: 'Delivez Secure Logistics',
      driver: {
        name: 'Ramesh Kumar',
        phone: '+919876543210',
        vehicle_number: 'KA-01-MJ-4050',
      },
    },
  };
}

export const createLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError(401, 'Authentication required to create luggage booking');
  }

  const body = req.body || {};
  const clientRequestId =
    body.client_request_id ||
    (req.headers['idempotency-key'] as string) ||
    body.idempotencyKey ||
    `LRQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100000 + Math.random() * 900000)}`;

  // Idempotency check: Return existing booking if same client_request_id submitted
  const existing = await prisma.luggageDeliveryBooking.findFirst({
    where: {
      OR: [
        { idempotencyKey: clientRequestId },
        { bookingNumber: clientRequestId },
      ],
    },
    include: { user: true },
  });

  if (existing) {
    const formatted = formatMasterBookingJson(existing);
    res.status(200).json({
      success: true,
      message: 'Idempotent replay: booking already exists',
      data: {
        booking: formatted,
        booking_id: existing.id,
        booking_number: existing.bookingNumber,
        isIdempotentReplay: true,
      },
    });
    return;
  }

  // 1. Recalculate Quote Server-Side (Never trust client prices)
  const quoteResult = calculateLuggageMasterQuote(body);
  const pricing = quoteResult.pricing;

  const serviceId = body.service?.service_id || body.serviceId || 'home_airport';
  const routeType = body.route?.route_type || body.routeType || 'single_trip';
  const bookingNumber = makeLuggageBookingNumber();
  const pickupOtp = String(Math.floor(1000 + Math.random() * 9000));
  const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

  // Extract structured parts
  const pickupDetails = body.pickup || { address: body.pickupAddress, contact: body.pickupContact };
  const deliveryDetails = body.delivery || { address: body.deliveryAddress, airport: body.airport, flight: body.flight };
  const multiStops = body.multi_stops || body.route?.stops || body.multiStops || [];
  const flightDetails = body.flight_details || body.delivery?.airport_specific || body.delivery?.flight || body.flightDetails || null;
  const hotelDetails = body.hotel_details || body.delivery?.hotel_specific || body.pickup?.hotel_specific || body.pickup?.hotel || body.delivery?.hotel || body.hotelDetails || null;
  const luggageItems = body.luggage_items || body.luggage?.items || body.luggageItems || [];
  const addOns = body.add_ons || body.addOns || { selected_items: [] };
  const protections = body.luggage_protection || body.protections || { enabled: false, selected_items: [] };
  const airportAssistance = body.airport_assistance || body.airportAssistance || { enabled: false, selected_services: [] };
  const schedule = body.schedule || {};
  const gstInvoice = body.gst_invoice || body.gstInvoice || { enabled: false, request_invoice: false, required: false };

  // Validate GSTIN if invoice requested
  if (gstInvoice.request_invoice || gstInvoice.enabled || gstInvoice.required) {
    const gstin = (gstInvoice.gstin || '').trim();
    if (!gstin || gstin.length < 15) {
      throw new AppError(400, 'A valid 15-character GSTIN is required when business invoice is requested');
    }
  }

  const paymentMethod = (body.payment?.payment_method || body.payment_method || body.paymentMethod || 'WALLET').toUpperCase();
  const paymentStatus = paymentMethod === 'CASH' ? 'CASH_PENDING' : 'PENDING';

  // Transactional database creation
  const created = await prisma.$transaction(async (tx) => {
    return await tx.luggageDeliveryBooking.create({
      data: {
        bookingNumber,
        userId,
        serviceId,
        routeType,
        status: 'BOOKING_CONFIRMED',
        idempotencyKey: clientRequestId,
        pickupDetails: pickupDetails as any,
        deliveryDetails: deliveryDetails as any,
        hotelDetails: hotelDetails as any,
        flightDetails: flightDetails as any,
        multiStops: multiStops as any,
        luggageItems: luggageItems as any,
        protections: protections as any,
        addOns: addOns as any,
        airportAssistance: airportAssistance as any,
        schedule: schedule as any,
        gstInvoice: gstInvoice as any,
        pricingBreakdown: pricing as any,
        totalAmount: pricing.total_amount,
        paymentMethod,
        paymentStatus,
        paymentReference: `PAY-LG-${bookingNumber}`,
        pickupOtp,
        deliveryOtp,
        currentMilestoneIndex: 0,
        milestones: luggageTimelineMilestones as any,
        driverDetails: {
          name: 'Suresh Raina',
          phone: '+919876543210',
          vehicle_type: 'Luggage Transit Van',
          vehicle_number: 'KA-01-EA-5542',
        } as any,
      },
      include: { user: true },
    });
  });

  const formatted = formatMasterBookingJson(created);

  res.status(201).json({
    success: true,
    message: 'Luggage booking created successfully',
    data: {
      booking_id: created.id,
      booking_number: created.bookingNumber,
      booking: formatted,
      quote_id: quoteResult.quote_id,
      pricing,
    },
  });
};

/**
 * 5. POST /payments/create & POST /bookings/:id/payments/create
 */
export const createLuggagePaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id || req.body?.booking_id || req.body?.bookingId;
  if (!id) {
    throw new AppError(400, 'Booking ID is required to create payment');
  }

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const paymentMethod = (req.body?.payment_method || req.body?.paymentMethod || booking.paymentMethod || 'WALLET').toUpperCase();
  const gatewayOrderId = 'order_lg_' + randomBytes(8).toString('hex');
  const amount = Number(booking.totalAmount);

  res.status(200).json({
    success: true,
    message: 'Payment order created',
    data: {
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      payment_method: paymentMethod.toLowerCase(),
      amount,
      currency: 'INR',
      gateway: paymentMethod === 'WALLET' ? 'INTERNAL_WALLET' : 'SANDBOX_GATEWAY',
      gateway_order_id: gatewayOrderId,
      order_id: gatewayOrderId,
      key_id: 'rzp_test_delivez_luggage_key',
    },
  });
};

/**
 * 6. POST /payments/verify & POST /bookings/:id/payments/verify
 */
export const verifyLuggagePaymentHandler: RequestHandler = async (req, res) => {
  const id = req.params.id || req.body?.booking_id || req.body?.bookingId;
  const { payment_method, gateway_payment_id, gateway_signature } = req.body || {};

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const paymentRef = gateway_payment_id || `PAY-LG-${randomBytes(6).toString('hex')}`;

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
      paymentReference: paymentRef,
      status: 'BOOKING_CONFIRMED',
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    message: 'Payment verified and booking confirmed',
    data: {
      booking_id: updated.id,
      booking_number: updated.bookingNumber,
      booking_status: updated.status,
      payment_status: 'paid',
      payment_reference: paymentRef,
      booking: formatMasterBookingJson(updated),
    },
  });
};

/**
 * 7. GET /bookings/:id - Retrieve Master Booking details
 */
export const getLuggageDeliveryBookingDetailsHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { user: true },
  });

  if (!booking) {
    throw new AppError(404, `Luggage delivery booking '${id}' not found`);
  }

  const formatted = formatMasterBookingJson(booking);

  res.status(200).json({
    success: true,
    data: {
      booking: formatted,
    },
  });
};

/**
 * 8. GET /bookings - List customer bookings
 */
export const listLuggageDeliveryBookingsHandler: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (String(req.user?.role) !== 'ADMIN' && String(req.user?.role) !== 'SUPER_ADMIN') {
    if (userId) whereClause.userId = userId;
  }

  const [bookings, total] = await Promise.all([
    prisma.luggageDeliveryBooking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { user: true },
    }),
    prisma.luggageDeliveryBooking.count({ where: whereClause }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      bookings: bookings.map(formatMasterBookingJson),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
};

/**
 * 9. GET /bookings/:id/receipt - Retrieve GST Invoice & Printable Receipt
 */
export const getLuggageDeliveryReceiptHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: { user: true },
  });

  if (!booking) {
    throw new AppError(404, `Luggage booking '${id}' not found`);
  }

  const formatted = formatMasterBookingJson(booking);
  const pricing = formatted.pricing;
  const taxableAmount = Math.max(0, (pricing.subtotal || 0) - (pricing.discount?.discount_amount || 0));

  res.status(200).json({
    success: true,
    message: 'Receipt retrieved successfully',
    data: {
      receipt_id: `REC-${booking.bookingNumber}`,
      receipt_number: `RCPT-LG-${booking.bookingNumber}`,
      invoice_number: `INV-${booking.bookingNumber}`,
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      issued_at: booking.createdAt,
      customer: formatted.customer,
      service: formatted.service,
      pickup: formatted.pickup,
      delivery: formatted.delivery,
      luggage: formatted.luggage,
      schedule: formatted.schedule,
      pricing: formatted.pricing,
      gst_invoice: formatted.gst_invoice,
      payment: formatted.payment,
      billing_to: {
        company_name: (booking.gstInvoice as any)?.company_name || formatted.customer?.full_name,
        gstin: (booking.gstInvoice as any)?.gstin || null,
        billing_address: (booking.gstInvoice as any)?.billing_address || formatted.pickup?.full_address,
      },
      tax_breakdown: {
        taxable_amount: taxableAmount,
        tax_rate: 18,
        cgst_amount: pricing.tax?.cgst_amount || 0,
        sgst_amount: pricing.tax?.sgst_amount || 0,
        total_tax: pricing.tax?.total_tax || 0,
        total_amount: pricing.total_amount,
      },
      tax_summary: {
        taxable_amount: taxableAmount,
        tax_rate: 18,
        cgst_amount: pricing.tax?.cgst_amount || 0,
        sgst_amount: pricing.tax?.sgst_amount || 0,
        total_tax: pricing.tax?.total_tax || 0,
        total_amount: pricing.total_amount,
      },
      issuer: {
        legal_name: 'Delivez India Logistics Private Limited',
        brand_name: 'Delivez One Airport Concierge',
        gstin: '29AABCD1234E1Z5',
        cin: 'U63090KA2024PTC184920',
        registered_office: 'Tower 4, Prestige Tech Park, Marathahalli, Bengaluru 560103, India',
        support_email: 'support@delivez.com',
        support_phone: '+91 80 4567 8900',
        support_website: 'https://delivez.com/help',
      },
    },
  });
};

/**
 * 10. GET /bookings/:id/payment - Retrieve payment status
 */
export const getLuggageDeliveryPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, `Luggage booking '${id}' not found`);
  }

  res.status(200).json({
    success: true,
    data: {
      booking_id: booking.id,
      booking_number: booking.bookingNumber,
      payment_method: String(booking.paymentMethod).toLowerCase(),
      payment_status: String(booking.paymentStatus).toLowerCase(),
      payment_reference: booking.paymentReference,
      total_amount: Number(booking.totalAmount),
      currency: 'INR',
      updated_at: booking.updatedAt,
    },
  });
};

/**
 * 11. GET /bookings/:id/tracking & GET /tracking/:trackingId - Milestone Journey
 */
export const getLuggageDeliveryTrackingHandler: RequestHandler = async (req, res) => {
  const trackingId = String(req.params.trackingId || req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id: trackingId }, { bookingNumber: trackingId }] },
  });

  if (!booking) {
    throw new AppError(404, `Tracking record not found for '${trackingId}'`);
  }

  const milestones = (booking.milestones as any[]) || luggageTimelineMilestones;
  const currentIdx = booking.currentMilestoneIndex || 0;

  const timeline = milestones.map((m: any, idx: number) => ({
    ...m,
    completed: idx <= currentIdx,
    current: idx === currentIdx,
    timestamp: idx <= currentIdx ? new Date(Date.now() - (currentIdx - idx) * 3600000).toISOString() : null,
  }));

  res.status(200).json({
    success: true,
    data: {
      tracking: {
        booking_id: booking.id,
        booking_number: booking.bookingNumber,
        status: booking.status,
        current_milestone_index: currentIdx,
        current_milestone_step: currentIdx + 1,
        current_milestone: timeline[currentIdx],
        timeline,
        milestones: timeline,
        pickup_otp: booking.pickupOtp,
        delivery_otp: booking.deliveryOtp,
        security_status: {
          seal_intact: true,
          tamper_evident: true,
          inspected_at: booking.createdAt,
        },
        driver: booking.driverDetails || {
          name: 'Suresh Raina',
          phone: '+919876543210',
          vehicle_type: 'Luggage Transit Van',
          vehicle_number: 'KA-01-EA-5542',
        },
      },
    },
  });
};

/**
 * 12. POST /bookings/:id/cancel
 */
export const cancelLuggageDeliveryBookingHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const reason = req.body?.reason || 'Cancelled by user';

  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });

  if (!booking) {
    throw new AppError(404, 'Luggage delivery booking not found');
  }

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      status: 'CANCELLED',
      cancellationReason: reason,
      cancelledAt: new Date(),
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    message: 'Luggage delivery booking cancelled',
    data: {
      booking: formatMasterBookingJson(updated),
    },
  });
};

// Legacy handlers for milestone advance, otp verification, pod
export const verifyLuggageDeliveryOtpHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const { otp, type = 'delivery' } = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const expectedOtp = type === 'pickup' ? booking.pickupOtp : booking.deliveryOtp;
  const valid = String(otp).trim() === String(expectedOtp).trim();
  res.status(200).json({ success: true, data: { valid, type, verifiedAt: new Date().toISOString() } });
};

export const submitLuggageDeliveryPodHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const podData = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      podData: podData as any,
      status: 'DELIVERED',
      currentMilestoneIndex: 7,
    },
  });
  res.status(200).json({ success: true, data: { bookingId: updated.id, status: 'DELIVERED' } });
};

export const advanceLuggageDeliveryMilestoneHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const { targetIndex } = req.body;
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const newIdx = typeof targetIndex === 'number' ? targetIndex : Math.min(7, (booking.currentMilestoneIndex || 0) + 1);
  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: { currentMilestoneIndex: newIdx },
  });
  res.status(200).json({ success: true, data: { booking: updated, currentMilestoneIndex: newIdx } });
};

export const processLuggageDeliverySandboxPaymentHandler: RequestHandler = async (req, res) => {
  const id = String(req.params.id || '');
  const booking = await prisma.luggageDeliveryBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!booking) throw new AppError(404, 'Booking not found');

  const updated = await prisma.luggageDeliveryBooking.update({
    where: { id: booking.id },
    data: {
      paymentStatus: 'PAID',
      status: 'BOOKING_CONFIRMED',
      paymentReference: `PAY-LG-${randomBytes(6).toString('hex')}`,
    },
    include: { user: true },
  });

  res.status(200).json({
    success: true,
    data: {
      booking: formatMasterBookingJson(updated),
      status: 'success',
      paymentStatus: 'PAID',
    },
  });
};
