import type { RequestHandler } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/app-error.js';

function humanizeStatus(status: string = ''): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function calculateStepIndex(status: string): number {
  const upper = String(status || '').toUpperCase();
  if (['DELIVERED', 'COMPLETED', 'STORE_DELIVERED'].includes(upper)) return 3;
  if (['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'REACHED_DESTINATION_CITY', 'ON_THE_WAY', 'AT_DESTINATION', 'RETURN_IN_TRANSIT'].includes(upper)) return 2;
  if (['PICKED_UP', 'LUGGAGE_PICKED', 'ITEM_VERIFIED', 'GIFT_PACKED', 'PACKAGE_INSPECTED', 'ARRIVED_AT_PICKUP'].includes(upper)) return 1;
  return 0; // Booked / Confirmed / Assigned
}

export const getCurrentUserRecentOrders: RequestHandler = async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError({
      message: 'Authentication required. Please provide a valid Bearer token.',
      statusCode: 401,
      code: 'UNAUTHORIZED'
    });
  }

  const userId = user.id;
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim().toUpperCase() : 'ALL';
  const serviceFilter = typeof req.query.serviceType === 'string' ? req.query.serviceType.trim().toLowerCase() : 'ALL';

  // Fetch orders in parallel across all 6 services belonging to this user
  const [courier, luggage, vault, confidential, forgot, ret, gift] = await Promise.all([
    // 1. Personal Courier
    (serviceFilter === 'ALL' || serviceFilter === 'courier' || serviceFilter === 'personal-courier')
      ? prisma.courierBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { addresses: true, package: true },
        })
      : [],

    // 2. Luggage Delivery
    (serviceFilter === 'ALL' || serviceFilter === 'luggage' || serviceFilter === 'luggage-delivery' || serviceFilter === 'airport-luggage')
      ? prisma.luggageDeliveryBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [],

    // 3. Vault Courier
    (serviceFilter === 'ALL' || serviceFilter === 'vault' || serviceFilter === 'confidential' || serviceFilter === 'confidential-delivery')
      ? prisma.vaultCourierBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { pickup: true, delivery: true, item: true, contacts: true },
        })
      : [],

    // 4. Confidential Courier
    (serviceFilter === 'ALL' || serviceFilter === 'vault' || serviceFilter === 'confidential' || serviceFilter === 'confidential-courier')
      ? prisma.confidentialCourierBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: { addresses: true },
        })
      : [],

    // 5. Forgot Something
    (serviceFilter === 'ALL' || serviceFilter === 'forgot' || serviceFilter === 'forgot-something' || serviceFilter === 'fetch')
      ? prisma.forgotSomethingBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [],

    // 6. Return Pickup
    (serviceFilter === 'ALL' || serviceFilter === 'return' || serviceFilter === 'return-pickup' || serviceFilter === 'returns')
      ? prisma.returnPickupBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [],

    // 7. Gift Delivery
    (serviceFilter === 'ALL' || serviceFilter === 'gift' || serviceFilter === 'gift-delivery' || serviceFilter === 'gifts')
      ? prisma.giftDeliveryBooking.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      : [],
  ]);

  const allOrders: any[] = [];

  // Map Courier
  courier.forEach((c: any) => {
    const pickupAddr = c.addresses?.find((a: any) => a.kind === 'PICKUP') || c.addresses?.[0];
    const dropoffAddr = c.addresses?.find((a: any) => a.kind === 'DROPOFF') || c.addresses?.[1];
    allOrders.push({
      id: c.id,
      bookingNumber: c.bookingNumber,
      serviceKey: 'personal-courier',
      serviceName: 'Personal Courier',
      status: c.status,
      statusDisplay: humanizeStatus(c.status),
      isActive: !['DELIVERED', 'CANCELLED'].includes(c.status),
      amount: Number(c.totalAmount || 0),
      paymentMethod: c.paymentMethod || 'ONLINE',
      paymentStatus: c.paymentStatus || 'PAID',
      pickup: {
        city: pickupAddr?.city || 'Origin',
        address: pickupAddr?.addressLine1 || '',
        contactName: pickupAddr?.contactName || user.fullName,
        contactPhone: pickupAddr?.phoneNumber || user.mobileNumber,
      },
      delivery: {
        city: dropoffAddr?.city || 'Destination',
        address: dropoffAddr?.addressLine1 || '',
        contactName: dropoffAddr?.contactName || 'Recipient',
        contactPhone: dropoffAddr?.phoneNumber || '',
      },
      itemSummary: c.package?.packagingType ? ('Package (' + c.package.packagingType + ')') : 'Personal Courier Consignment',
      assignedPartner: 'Assigned Courier Partner',
      partnerPhone: '',
      currentStepIndex: calculateStepIndex(c.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: c.createdAt,
    });
  });

  // Map Luggage
  luggage.forEach((l: any) => {
    const pickup = (l.pickupDetails as any) || {};
    const delivery = (l.deliveryDetails as any) || {};
    const flight = (l.flightDetails as any) || {};
    const items = Array.isArray(l.luggageItems) ? (l.luggageItems as any[]) : [];
    const bagCount = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0) || 1;
    allOrders.push({
      id: l.id,
      bookingNumber: l.bookingNumber,
      serviceKey: 'luggage-delivery',
      serviceName: 'Luggage Delivery',
      status: l.status,
      statusDisplay: humanizeStatus(l.status),
      isActive: !['DELIVERED', 'CANCELLED'].includes(l.status),
      amount: Number(l.totalAmount || 0),
      paymentMethod: l.paymentMethod || 'ONLINE',
      paymentStatus: l.paymentStatus || 'PAID',
      routeType: l.routeType || 'doorstep_to_airport',
      pickup: {
        city: pickup.city || 'Origin City',
        address: pickup.address || pickup.full_address || '',
        contactName: pickup.contact?.full_name || pickup.contactName || user.fullName,
        contactPhone: pickup.contact?.mobile || pickup.contactPhone || user.mobileNumber,
      },
      delivery: {
        city: delivery.city || 'Destination City',
        address: delivery.address || delivery.full_address || '',
        contactName: delivery.contact?.full_name || delivery.contactName || 'Hotel / Terminal Desk',
        contactPhone: delivery.contact?.mobile || delivery.contactPhone || '',
        terminal: delivery.terminal || flight.terminal || '',
        flightNumber: flight.flight_number || flight.flightNumber || '',
      },
      itemSummary: bagCount + ' Luggage Bag' + (bagCount > 1 ? 's' : '') + (flight.flight_number ? (' • Flight ' + flight.flight_number) : ''),
      assignedPartner: (l.driverDetails as any)?.name || 'Assigned Luggage Executive',
      partnerPhone: (l.driverDetails as any)?.phone || '',
      currentStepIndex: calculateStepIndex(l.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: l.createdAt,
    });
  });

  // Map Vault
  vault.forEach((v: any) => {
    allOrders.push({
      id: v.id,
      bookingNumber: v.bookingNumber,
      serviceKey: 'confidential-delivery',
      serviceName: 'Delivez Vault (Confidential)',
      status: v.status,
      statusDisplay: humanizeStatus(v.status),
      isActive: !['delivered', 'cancelled', 'DELIVERED', 'CANCELLED'].includes(v.status),
      amount: Number(v.totalAmount || 0),
      paymentMethod: 'ONLINE',
      paymentStatus: v.paymentStatus || 'paid',
      pickup: {
        city: v.pickup?.city || 'Origin',
        address: v.pickup?.address || '',
        contactName: v.contacts?.pickupContactName || user.fullName,
        contactPhone: v.contacts?.pickupContactPhone || user.mobileNumber,
      },
      delivery: {
        city: v.delivery?.city || 'Destination',
        address: v.delivery?.address || '',
        contactName: v.contacts?.deliveryContactName || 'Authorized Recipient',
        contactPhone: v.contacts?.deliveryContactPhone || '',
      },
      itemSummary: v.item?.documentType ? ('Confidential ' + v.item.documentType) : 'Vault Security Pouch',
      assignedPartner: 'Armored Vault Escort',
      partnerPhone: '',
      currentStepIndex: calculateStepIndex(v.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: v.createdAt,
    });
  });

  // Map Forgot Something
  forgot.forEach((f: any) => {
    allOrders.push({
      id: f.id,
      bookingNumber: f.bookingNumber,
      serviceKey: 'forgot-something',
      serviceName: 'Forgot Something Retrieval',
      status: f.status,
      statusDisplay: humanizeStatus(f.status),
      isActive: !['DELIVERED', 'CANCELLED'].includes(f.status),
      amount: Number(f.totalAmount || 0),
      paymentMethod: f.paymentMethod || 'ONLINE',
      paymentStatus: f.paymentStatus || 'PAID',
      pickup: {
        city: f.pickupCity || 'Origin',
        address: f.pickupAddressLine || '',
        contactName: f.pickupContactName || user.fullName,
        contactPhone: f.pickupPhoneNumber || user.mobileNumber,
      },
      delivery: {
        city: f.dropoffCity || 'Destination',
        address: f.dropoffAddressLine || '',
        contactName: f.dropoffRecipientName || user.fullName,
        contactPhone: f.dropoffPhoneNumber || user.mobileNumber,
      },
      itemSummary: f.itemName + ' (' + f.itemCategory + ')',
      assignedPartner: f.partnerName || 'Retrieval Rider',
      partnerPhone: f.partnerPhone || '',
      currentStepIndex: calculateStepIndex(f.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: f.createdAt,
    });
  });

  // Map Return Pickup
  ret.forEach((r: any) => {
    allOrders.push({
      id: r.id,
      bookingNumber: r.bookingNumber,
      serviceKey: 'return-pickup',
      serviceName: 'Return & Exchange Pickup',
      status: r.status,
      statusDisplay: humanizeStatus(r.status),
      isActive: !['DELIVERED', 'CANCELLED', 'STORE_DELIVERED'].includes(r.status),
      amount: Number(r.totalAmount || 0),
      paymentMethod: r.paymentMethod || 'ONLINE',
      paymentStatus: r.paymentStatus || 'PAID',
      pickup: {
        city: r.pickupCity || 'Origin',
        address: r.pickupAddressLine || '',
        contactName: r.pickupContactName || user.fullName,
        contactPhone: r.pickupPhoneNumber || user.mobileNumber,
      },
      delivery: {
        city: r.returnCity || 'Vendor Hub',
        address: r.returnStoreAddress || '',
        contactName: r.destinationName || r.pickupStoreName || 'Merchant Warehouse',
        contactPhone: '',
      },
      itemSummary: r.itemCategory + ' Return (' + r.returnType + ')',
      assignedPartner: r.partnerName || 'Pickup Partner',
      partnerPhone: r.partnerPhone || '',
      currentStepIndex: calculateStepIndex(r.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: r.createdAt,
    });
  });

  // Map Gift Delivery
  gift.forEach((g: any) => {
    allOrders.push({
      id: g.id,
      bookingNumber: g.bookingNumber,
      serviceKey: 'gift-delivery',
      serviceName: 'Gift & Surprise Delivery',
      status: g.status,
      statusDisplay: humanizeStatus(g.status),
      isActive: !['DELIVERED', 'CANCELLED'].includes(g.status),
      amount: Number(g.totalAmount || 0),
      paymentMethod: g.paymentMethod || 'ONLINE',
      paymentStatus: g.paymentStatus || 'PAID',
      pickup: {
        city: g.pickupCity || 'Florist / Bakery',
        address: g.pickupStoreAddress || '',
        contactName: 'Delivez Partner Store',
        contactPhone: '',
      },
      delivery: {
        city: g.deliveryCity || 'Destination',
        address: g.deliveryAddress || '',
        contactName: g.recipientName || 'Gift Recipient',
        contactPhone: g.recipientPhone || '',
      },
      itemSummary: (g.productName || 'Gift Box') + ' (' + g.categoryName + ')',
      assignedPartner: g.partnerName || 'Celebration Rider',
      partnerPhone: g.partnerPhone || '',
      currentStepIndex: calculateStepIndex(g.status),
      steps: ['Booked', 'Picked Up', 'In Transit', 'Delivered'],
      createdAt: g.createdAt,
    });
  });

  // Deduplicate and Sort all orders by newest first
  const seen = new Set();
  const dedupedOrders: any[] = [];
  for (const ord of allOrders) {
    const key = ord.bookingNumber || ord.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    dedupedOrders.push(ord);
  }
  dedupedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter by status if specified
  let filtered = dedupedOrders;
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((o) => {
      const u = String(o.status).toUpperCase();
      return u === statusFilter || u.includes(statusFilter);
    });
  }

  // Identify the most recent active order or top latest order
  const activeOrder = dedupedOrders.find((o) => o.isActive) || null;
  const recentOrder = activeOrder || dedupedOrders[0] || null;

  const total = filtered.length;
  const paginatedOrders = filtered.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    status: 'success',
    data: {
      recentOrder,
      hasActiveOrder: Boolean(activeOrder),
      orders: paginatedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
};

export const getCurrentUserLatestActiveOrder: RequestHandler = async (req, res, next) => {
  req.query.limit = '1';
  return getCurrentUserRecentOrders(req, res, next);
};
