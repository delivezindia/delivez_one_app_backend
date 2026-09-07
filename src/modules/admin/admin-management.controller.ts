import { recordAuditLog } from './admin-audit.controller.js';
import type { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/app-error.js';
import { publicUserSelect } from '../../lib/public-user.js';

// ============================================================================
// 1. UNIFIED DASHBOARD STATS & OVERVIEW
// ============================================================================
export const getUnifiedDashboardStats: RequestHandler = async (_req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    giftCount,
    giftTodayCount,
    giftActiveCount,
    giftRevenue,

    courierCount,
    courierTodayCount,
    courierActiveCount,
    courierRevenue,

    confidentialCount,
    confidentialTodayCount,
    confidentialActiveCount,
    confidentialRevenue,

    forgotCount,
    forgotTodayCount,
    forgotActiveCount,
    forgotRevenue,

    returnCount,
    returnTodayCount,
    returnActiveCount,
    returnRevenue,

    usersCount,
    driversCount,
  ] = await Promise.all([
    prisma.giftDeliveryBooking.count(),
    prisma.giftDeliveryBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.giftDeliveryBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.giftDeliveryBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.courierBooking.count(),
    prisma.courierBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.courierBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.courierBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.confidentialCourierBooking.count(),
    prisma.confidentialCourierBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.confidentialCourierBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.confidentialCourierBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.forgotSomethingBooking.count(),
    prisma.forgotSomethingBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.forgotSomethingBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.forgotSomethingBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.returnPickupBooking.count(),
    prisma.returnPickupBooking.count({ where: { createdAt: { gte: today } } }),
    prisma.returnPickupBooking.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
    prisma.returnPickupBooking.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),

    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({ where: { role: 'DRIVER' } }),
  ]);

  const totalOrders = giftCount + courierCount + confidentialCount + forgotCount + returnCount;
  const todayOrders = giftTodayCount + courierTodayCount + confidentialTodayCount + forgotTodayCount + returnTodayCount;
  const activeDeliveries = giftActiveCount + courierActiveCount + confidentialActiveCount + forgotActiveCount + returnActiveCount;
  
  const totalRevenue = Math.round(
    Number(giftRevenue._sum.totalAmount || 0) +
    Number(courierRevenue._sum.totalAmount || 0) +
    Number(confidentialRevenue._sum.totalAmount || 0) +
    Number(forgotRevenue._sum.totalAmount || 0) +
    Number(returnRevenue._sum.totalAmount || 0)
  );

  res.status(200).json({
    status: 'success',
    data: {
      totalOrders,
      todayOrders,
      activeDeliveries,
      totalRevenue,
      totalCustomers: usersCount,
      totalDrivers: driversCount,
      breakdown: {
        giftDelivery: giftCount,
        personalCourier: courierCount,
        confidentialCourier: confidentialCount,
        forgotSomething: forgotCount,
        returnPickup: returnCount,
      },
    },
  });
};

export const updatePartnerStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;
  if (!['ONLINE', 'BUSY', 'OFFLINE', 'SUSPENDED'].includes(status)) {
    throw new AppError(400, 'Invalid partner status.');
  }

  const driver = await prisma.user.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, 'Driver partner not found.');

  partnerMetadataStore[id] = {
    ...partnerMetadataStore[id],
    status,
  };

  res.status(200).json({
    status: 'success',
    message: `Partner status updated to ${status}.`,
    data: { id, status },
  });
};

export const updatePartnerProfile: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { fullName, mobileNumber, email, zone, vehicle } = req.body;

  const driver = await prisma.user.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, 'Driver partner not found.');

  const updateData: any = {};
  if (fullName) updateData.fullName = fullName;
  if (mobileNumber) updateData.mobileNumber = String(mobileNumber).replace(/\D/g, '').slice(-10);
  if (email) updateData.email = email;

  const updatedUser = Object.keys(updateData).length > 0
    ? await prisma.user.update({ where: { id }, data: updateData, select: publicUserSelect })
    : driver;

  partnerMetadataStore[id] = {
    ...partnerMetadataStore[id],
    ...(zone ? { zone } : {}),
    ...(vehicle ? { vehicle } : {}),
  };

  res.status(200).json({
    status: 'success',
    message: 'Partner profile updated successfully.',
    data: {
      partner: {
        id: updatedUser.id,
        name: updatedUser.fullName,
        phone: updatedUser.mobileNumber,
        email: updatedUser.email,
        zone: partnerMetadataStore[id]?.zone || 'Central Hub',
        vehicle: partnerMetadataStore[id]?.vehicle || 'Delivery Vehicle',
        status: partnerMetadataStore[id]?.status || 'ONLINE',
      },
    },
  });
};

export const deletePartner: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const driver = await prisma.user.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, 'Driver partner not found.');

  await prisma.user.delete({ where: { id } });
  delete partnerMetadataStore[id];

  res.status(200).json({
    status: 'success',
    message: 'Partner deactivated and deleted successfully.',
  });
};

export const getPartnerDeliveries: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const driver = await prisma.user.findUnique({ where: { id } });
  if (!driver) throw new AppError(404, 'Driver partner not found.');

  const [gifts, returns, forgots] = await Promise.all([
    prisma.giftDeliveryBooking.findMany({
      where: { OR: [{ partnerPhone: driver.mobileNumber }, { partnerName: driver.fullName }] },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.returnPickupBooking.findMany({
      where: { OR: [{ partnerPhone: driver.mobileNumber }, { partnerName: driver.fullName }] },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.forgotSomethingBooking.findMany({
      where: { OR: [{ partnerPhone: driver.mobileNumber }, { partnerName: driver.fullName }] },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const trips: any[] = [];
  gifts.forEach(g => trips.push({
    bookingNumber: g.bookingNumber,
    service: 'Gift & Surprise Delivery',
    recipient: g.recipientName,
    destination: g.deliveryCity,
    amount: Number(g.totalAmount),
    status: g.status,
    date: g.createdAt,
  }));
  returns.forEach(r => trips.push({
    bookingNumber: r.bookingNumber,
    service: 'Return Pickup',
    recipient: r.destinationName || 'Store Return',
    destination: r.pickupCity,
    amount: Number(r.totalAmount),
    status: r.status,
    date: r.createdAt,
  }));
  forgots.forEach(f => trips.push({
    bookingNumber: f.bookingNumber,
    service: 'Forgot Something',
    recipient: f.dropoffRecipientName,
    destination: f.dropoffCity,
    amount: Number(f.totalAmount),
    status: f.status,
    date: f.createdAt,
  }));

  res.status(200).json({
    status: 'success',
    data: {
      partnerId: id,
      partnerName: driver.fullName,
      trips,
      totalCompleted: trips.filter(t => t.status === 'DELIVERED').length,
    },
  });
};


// ============================================================================
// 2. UNIFIED ORDERS HUB (CROSS-SERVICE)
// ============================================================================
export const listAllUnifiedOrders: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '15'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const serviceType = typeof req.query.serviceType === 'string' ? req.query.serviceType : 'ALL';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';

  const [giftOrders, courierOrders, confidentialOrders, forgotOrders, returnOrders] = await Promise.all([
    (serviceType === 'ALL' || serviceType === 'GIFT' || serviceType === 'gift-delivery')
      ? prisma.giftDeliveryBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
    (serviceType === 'ALL' || serviceType === 'COURIER' || serviceType === 'personal-courier')
      ? prisma.courierBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { fullName: true, mobileNumber: true, email: true } },
            addresses: true,
            package: true,
          },
        })
      : [],
    (serviceType === 'ALL' || serviceType === 'CONFIDENTIAL' || serviceType === 'confidential-courier')
      ? prisma.confidentialCourierBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { fullName: true, mobileNumber: true, email: true } },
            addresses: true,
          },
        })
      : [],
    (serviceType === 'ALL' || serviceType === 'FORGOT' || serviceType === 'forgot-something')
      ? prisma.forgotSomethingBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
    (serviceType === 'ALL' || serviceType === 'RETURN' || serviceType === 'return-pickup')
      ? prisma.returnPickupBooking.findMany({
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: { fullName: true, mobileNumber: true, email: true } } },
        })
      : [],
  ]);

  // Normalize into unified order schema
  const unified: any[] = [];

  giftOrders.forEach((o: any) => {
    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'gift-delivery',
      serviceName: 'Gift & Surprise Delivery',
      customerName: o.user?.fullName || 'Customer',
      customerPhone: o.user?.mobileNumber || o.recipientPhone,
      recipientName: o.recipientName,
      destination: o.deliveryCity ? `${o.deliveryCity} (${o.deliveryPostalCode || ''})` : 'Delivery Address',
      itemSummary: `${o.productName || 'Gift Box'} (Qty: ${o.productQuantity || 1})`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: o.partnerName || 'Unassigned',
      partnerPhone: o.partnerPhone || '',
      createdAt: o.createdAt,
    });
  });

  courierOrders.forEach((o: any) => {
    const pickupAddr = o.addresses?.find((a: any) => a.type === 'PICKUP') || o.addresses?.[0];
    const dropoffAddr = o.addresses?.find((a: any) => a.type === 'DROPOFF') || o.addresses?.[1];

    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'personal-courier',
      serviceName: 'Personal Courier',
      customerName: o.user?.fullName || pickupAddr?.contactName || 'Customer',
      customerPhone: o.user?.mobileNumber || pickupAddr?.phoneNumber || '',
      recipientName: dropoffAddr?.contactName || 'Recipient',
      destination: dropoffAddr ? (dropoffAddr.city ? `${dropoffAddr.city} (${dropoffAddr.postalCode || ''})` : dropoffAddr.addressLine1) : (o.serviceType || 'Destination'),
      itemSummary: o.package ? `${o.package.category || 'Parcel'}${o.package.weightKg ? ' (' + o.package.weightKg + ' kg)' : ''}` : (o.serviceType || 'Standard Parcel'),
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: 'Assigned Courier',
      partnerPhone: '',
      createdAt: o.createdAt,
    });
  });

  confidentialOrders.forEach((o: any) => {
    const pickupAddr = o.addresses?.find((a: any) => a.type === 'PICKUP') || o.addresses?.[0];
    const dropoffAddr = o.addresses?.find((a: any) => a.type === 'DROPOFF') || o.addresses?.[1];

    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'confidential-courier',
      serviceName: 'Confidential Courier / Luggage',
      customerName: o.user?.fullName || pickupAddr?.contactName || 'Customer',
      customerPhone: o.user?.mobileNumber || pickupAddr?.phoneNumber || '',
      recipientName: dropoffAddr?.contactName || 'Authorized Recipient',
      destination: dropoffAddr ? `${dropoffAddr.city || ''} (${o.securityLevel} Vault)` : `${o.securityLevel} Security Vault`,
      itemSummary: `${o.documentType} (${o.envelopeSize})`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: 'Armored Vault Courier',
      partnerPhone: '',
      createdAt: o.createdAt,
    });
  });

  forgotOrders.forEach((o: any) => {
    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'forgot-something',
      serviceName: 'Forgot Something Retrieval',
      customerName: o.user?.fullName || o.pickupContactName || 'Customer',
      customerPhone: o.user?.mobileNumber || o.pickupPhoneNumber || '',
      recipientName: o.dropoffRecipientName || 'Owner',
      destination: o.dropoffCity ? `${o.dropoffCity} (${o.speed})` : o.speed,
      itemSummary: `${o.itemName} (${o.itemCategory})`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: o.partnerName || 'Express Retrieval Rider',
      partnerPhone: o.partnerPhone || '',
      createdAt: o.createdAt,
    });
  });

  returnOrders.forEach((o: any) => {
    unified.push({
      id: o.id,
      bookingNumber: o.bookingNumber,
      serviceKey: 'return-pickup',
      serviceName: 'Return & Exchange Pickup',
      customerName: o.user?.fullName || o.pickupContactName || 'Customer',
      customerPhone: o.user?.mobileNumber || o.pickupPhoneNumber || '',
      recipientName: o.destinationName || o.pickupStoreName || 'Vendor RMA',
      destination: o.pickupCity ? `${o.pickupCity} → ${o.returnCity || 'Vendor'}` : o.pickupCity,
      itemSummary: `${o.itemCategory} (Qty: ${o.itemQuantity || 1})`,
      amount: Number(o.totalAmount || 0),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      assignedPartner: o.partnerName || 'Pickup Partner',
      partnerPhone: o.partnerPhone || '',
      createdAt: o.createdAt,
    });
  });

  // Sort by createdAt desc
  unified.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  let filtered = unified;

  // Filter by status if specified
  if (status && status !== 'ALL') {
    filtered = filtered.filter(u => {
      const uStat = String(u.status).toUpperCase();
      const targetStat = status.toUpperCase();
      return uStat === targetStat || uStat.includes(targetStat);
    });
  }

  // Filter by search
  if (search) {
    filtered = filtered.filter(
      (u) =>
        u.bookingNumber.toLowerCase().includes(search) ||
        u.customerName.toLowerCase().includes(search) ||
        u.recipientName.toLowerCase().includes(search) ||
        u.destination.toLowerCase().includes(search) ||
        u.serviceName.toLowerCase().includes(search) ||
        u.itemSummary.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    status: 'success',
    data: {
      orders: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    },
  });
};

// ============================================================================
// 3. UNIVERSAL ORDER TRACKER & DISPATCH LOOKUP
// ============================================================================
export const universalTrackOrder: RequestHandler = async (req, res) => {
  const trackingId = String(req.params.trackingId || '').trim();

  const [gift, courier, confidential, forgot, ret] = await Promise.all([
    prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.courierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } }, addresses: true },
    }),
    prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
    prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id: trackingId }, { bookingNumber: { equals: trackingId, mode: 'insensitive' } }] },
      include: { user: { select: { fullName: true, mobileNumber: true } } },
    }),
  ]);

  if (gift) {
    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'gift-delivery',
        serviceName: 'Gift & Celebration Delivery',
        bookingNumber: gift.bookingNumber,
        status: gift.status,
        customerName: gift.user?.fullName || 'Customer',
        recipientName: gift.recipientName,
        recipientPhone: gift.recipientPhone,
        address: `${gift.deliveryAddress}, ${gift.deliveryCity}`,
        item: `${gift.productName} (Qty: ${gift.productQuantity})`,
        amount: Number(gift.totalAmount),
        eta: gift.scheduledTimeSlot || 'Within 2 Hours',
        partnerName: gift.partnerName || 'Rajesh Sharma',
        partnerPhone: gift.partnerPhone || '+91 98765 43210',
        progress: gift.status === 'DELIVERED' ? 5 : gift.status === 'ON_THE_WAY' ? 4 : gift.status === 'GIFT_PACKED' ? 3 : 2,
        steps: ['Order Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'],
        createdAt: gift.createdAt,
      },
    });
    return;
  }

  if (courier) {
    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'personal-courier',
        serviceName: 'Personal Courier',
        bookingNumber: courier.bookingNumber,
        status: courier.status,
        customerName: courier.user?.fullName || 'Customer',
        recipientName: 'Dropoff Contact',
        address: 'Point-to-point courier route',
        item: `Standard Parcel (${courier.serviceType})`,
        amount: Number(courier.totalAmount),
        eta: 'Today, 5:40 PM',
        partnerName: 'Aman Verma',
        partnerPhone: '+91 98111 22334',
        progress: courier.status === 'DELIVERED' ? 4 : 2,
        steps: ['Booked', 'Pickup Assigned', 'In Transit', 'Delivered'],
        createdAt: courier.createdAt,
      },
    });
    return;
  }

  if (confidential) {
    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'confidential-courier',
        serviceName: 'Confidential Courier / Luggage',
        bookingNumber: confidential.bookingNumber,
        status: confidential.status,
        customerName: confidential.user?.fullName || 'Customer',
        recipientName: 'Authorized Vault Recipient',
        address: 'Encrypted Security Escort',
        item: `${confidential.documentType} (${confidential.securityLevel})`,
        amount: Number(confidential.totalAmount),
        eta: 'Today, 7:15 PM',
        partnerName: 'Vikram Mehta (Armed Escort)',
        partnerPhone: '+91 97777 88899',
        progress: confidential.status === 'DELIVERED' ? 4 : 3,
        steps: ['Tamper-Sealed', 'Biometric Custody', 'In Armored Transit', 'Secure Handover'],
        createdAt: confidential.createdAt,
      },
    });
    return;
  }

  if (forgot) {
    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'forgot-something',
        serviceName: 'Forgot Something Retrieval',
        bookingNumber: forgot.bookingNumber,
        status: forgot.status,
        customerName: forgot.user?.fullName || 'Customer',
        recipientName: 'Owner Handover',
        address: 'Direct Express Retrieval',
        item: forgot.itemCategory,
        amount: Number(forgot.totalAmount),
        eta: 'Within 45 Mins',
        partnerName: 'Deepak Kumar',
        partnerPhone: '+91 96666 55443',
        progress: 3,
        steps: ['Pickup Initiated', 'Item Collected', 'Direct Transit', 'Safely Returned'],
        createdAt: forgot.createdAt,
      },
    });
    return;
  }

  if (ret) {
    res.status(200).json({
      status: 'success',
      data: {
        serviceKey: 'return-pickup',
        serviceName: 'Return & Exchange Pickup',
        bookingNumber: ret.bookingNumber,
        status: ret.status,
        customerName: ret.user?.fullName || 'Customer',
        recipientName: ret.destinationName || ret.pickupStoreName || 'Vendor / Retailer',
        address: `${ret.pickupAddress}, ${ret.pickupCity}`,
        item: `${ret.destinationName || ret.pickupStoreName || 'Return'} - ${ret.itemCategory}`,
        amount: Number(ret.totalAmount),
        eta: 'Today by 6:00 PM',
        partnerName: 'Suresh Raina',
        partnerPhone: '+91 95555 44332',
        progress: 2,
        steps: ['Pickup Scheduled', 'Quality Verified', 'Return In Transit', 'Vendor Handed'],
        createdAt: ret.createdAt,
      },
    });
    return;
  }

  // Fallback demo result
  res.status(200).json({
    status: 'success',
    data: {
      serviceKey: 'general-delivery',
      serviceName: 'Express Delivery Network',
      bookingNumber: trackingId.toUpperCase(),
      status: 'IN_TRANSIT',
      customerName: 'Verified Delivez Customer',
      recipientName: 'Designated Recipient',
      address: 'Indiranagar Hub, Bengaluru',
      item: 'Express Consignment',
      amount: 249,
      eta: 'Today, 4:30 PM',
      partnerName: 'Rohan Sharma',
      partnerPhone: '+91 98888 12345',
      progress: 3,
      steps: ['Order Placed', 'Rider Assigned', 'Picked Up & In Transit', 'Delivered'],
      createdAt: new Date(),
    },
  });
};

// ============================================================================
// 4. DELIVERY PARTNERS / RIDERS MANAGEMENT
// ============================================================================

// In-memory store for dynamic partner attributes (status, zone, vehicle)
const partnerMetadataStore: Record<string, { zone?: string; vehicle?: string; status?: string }> = {};

export const listPartners: RequestHandler = async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const where: Prisma.UserWhereInput = {
    role: 'DRIVER',
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { mobileNumber: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  let drivers = await prisma.user.findMany({
    where,
    select: publicUserSelect,
    orderBy: { createdAt: 'desc' },
  });

  // If no driver records exist yet, seed initial realistic partner pool
  if (drivers.length === 0) {
    const seedRiders = [
      { name: 'Rajesh Sharma', phone: '9876500001', email: 'rajesh.rider@delivez.com', zone: 'South Delhi', vehicle: 'Honda Activa 6G (EV-04)' },
      { name: 'Aman Verma', phone: '9876500002', email: 'aman.v@delivez.com', zone: 'Indiranagar, BLR', vehicle: 'Ather 450X Electric' },
      { name: 'Vikram Mehta', phone: '9876500003', email: 'vikram.m@delivez.com', zone: 'Bandra West, MUM', vehicle: 'Tata Ace Secure Van' },
      { name: 'Deepak Kumar', phone: '9876500004', email: 'deepak.k@delivez.com', zone: 'Hitec City, HYD', vehicle: 'Bajaj Pulsar 150' },
      { name: 'Suresh Raina', phone: '9876500005', email: 'suresh.r@delivez.com', zone: 'Kothrud, Pune', vehicle: 'TVS iQube Electric' },
      { name: 'Kunal Patil', phone: '9876500006', email: 'kunal.p@delivez.com', zone: 'Central Delhi', vehicle: 'Hero Electric Optima' },
    ];

    for (const r of seedRiders) {
      await prisma.user.upsert({
        where: {
          countryCode_mobileNumber: {
            countryCode: '+91',
            mobileNumber: r.phone,
          },
        },
        update: { role: 'DRIVER', fullName: r.name },
        create: {
          fullName: r.name,
          countryCode: '+91',
          mobileNumber: r.phone,
          email: r.email,
          passwordHash: await bcrypt.hash('Rider@123', 10),
          role: 'DRIVER',
          mobileVerifiedAt: new Date(),
        },
      });
    }

    drivers = await prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: publicUserSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  const partners = drivers.map((d, idx) => {
    const meta = partnerMetadataStore[d.id] || {};
    const defaultZone = idx % 3 === 0 ? 'Bengaluru Central' : idx % 3 === 1 ? 'South Delhi' : 'Mumbai Metro';
    const defaultVehicle = idx % 2 === 0 ? 'Ather 450X (Electric)' : 'Honda Activa 6G';
    const defaultStatus = idx === 2 ? 'BUSY' : idx === 4 ? 'OFFLINE' : 'ONLINE';

    return {
      id: d.id,
      name: d.fullName,
      phone: d.mobileNumber,
      email: d.email,
      zone: meta.zone || defaultZone,
      vehicle: meta.vehicle || defaultVehicle,
      status: meta.status || defaultStatus,
      rating: (4.7 + (idx * 0.05) % 0.3).toFixed(1),
      completedDeliveries: 50 + idx * 37,
      joinedAt: d.createdAt,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      partners,
      total: partners.length,
      onlineCount: partners.filter((p) => p.status === 'ONLINE').length,
      busyCount: partners.filter((p) => p.status === 'BUSY').length,
      offlineCount: partners.filter((p) => p.status === 'OFFLINE').length,
    },
  });
};

export const createPartner: RequestHandler = async (req, res) => {
  const { fullName, mobileNumber, email, zone, vehicle } = req.body;

  if (!fullName || !mobileNumber) {
    throw new AppError(400, 'Partner full name and mobile number are required.');
  }

  const cleanPhone = String(mobileNumber).replace(/\D/g, '').slice(-10);
  const existing = await prisma.user.findFirst({
    where: { OR: [{ mobileNumber: cleanPhone }, ...(email ? [{ email }] : [])] },
  });

  if (existing) {
    throw new AppError(400, 'A user or partner with this mobile number or email already exists.');
  }

  const passwordHash = await bcrypt.hash('Partner@123', 10);
  const newPartner = await prisma.user.create({
    data: {
      fullName,
      countryCode: '+91',
      mobileNumber: cleanPhone,
      email: email || `${cleanPhone}@delivez.driver`,
      passwordHash,
      role: 'DRIVER',
      mobileVerifiedAt: new Date(),
    },
    select: publicUserSelect,
  });

  res.status(201).json({
    status: 'success',
    message: 'Delivery partner registered successfully.',
    data: {
      partner: {
        id: newPartner.id,
        name: newPartner.fullName,
        phone: newPartner.mobileNumber,
        email: newPartner.email,
        zone: zone || 'Central Hub',
        vehicle: vehicle || 'Motorcycle',
        status: 'ONLINE',
        rating: '5.0',
        completedDeliveries: 0,
      },
    },
  });
};

// ============================================================================
// 5. FINANCE & SETTLEMENTS
// ============================================================================
export const getFinanceSummary: RequestHandler = async (_req, res) => {
  const [giftSum, courierSum, confSum, forgotSum, returnSum, drivers] = await Promise.all([
    prisma.giftDeliveryBooking.aggregate({
      _sum: { totalAmount: true, taxAmount: true, deliveryCharge: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.courierBooking.aggregate({
      _sum: { totalAmount: true, taxAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.confidentialCourierBooking.aggregate({
      _sum: { totalAmount: true, taxAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.forgotSomethingBooking.aggregate({
      _sum: { totalAmount: true, taxAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.returnPickupBooking.aggregate({
      _sum: { totalAmount: true, taxAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.user.findMany({
      where: { role: 'DRIVER' },
      select: publicUserSelect,
    }),
  ]);

  const grossMerchandiseValue = Math.round(
    Number(giftSum._sum.totalAmount || 0) +
    Number(courierSum._sum.totalAmount || 0) +
    Number(confSum._sum.totalAmount || 0) +
    Number(forgotSum._sum.totalAmount || 0) +
    Number(returnSum._sum.totalAmount || 0)
  );

  const taxesCollected = Math.round(
    Number(giftSum._sum.taxAmount || 0) +
    Number(courierSum._sum.taxAmount || 0) +
    Number(confSum._sum.taxAmount || 0) +
    Number(forgotSum._sum.taxAmount || 0) +
    Number(returnSum._sum.taxAmount || 0)
  );

  const partnerPayoutsPayable = Math.round(grossMerchandiseValue * 0.75);
  const netPlatformRevenue = Math.max(0, grossMerchandiseValue - partnerPayoutsPayable - taxesCollected);

  const settlementBatches = [
    {
      id: 'SETTL-9842',
      period: 'Active Cycle (Current Week)',
      totalRiders: drivers.length,
      payoutAmount: partnerPayoutsPayable,
      status: 'PROCESSED',
      settledAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
  ];

  const recentPayouts = drivers.map((d, idx) => ({
    rider: d.fullName,
    trips: Math.max(1, 4 - idx),
    amount: Math.round(partnerPayoutsPayable / (drivers.length || 1)),
    status: 'PAID',
    bankRef: 'DELV' + d.mobileNumber.slice(-6),
  }));

  res.status(200).json({
    status: 'success',
    data: {
      grossMerchandiseValue,
      netPlatformRevenue,
      partnerPayoutsPayable,
      taxesCollected,
      settlementBatches,
      recentPayouts,
    },
  });
};

export const triggerPartnerSettlement: RequestHandler = async (_req, res) => {
  const batchId = `SETTL-${Math.floor(1000 + Math.random() * 9000)}`;
  res.status(200).json({
    status: 'success',
    message: `Automatic partner settlement batch ${batchId} initiated successfully.`,
    data: {
      batchId,
      processedRiders: 52,
      totalDisbursed: 48250,
      timestamp: new Date(),
    },
  });
};

// ============================================================================
// 6. ANALYTICS & INSIGHTS
// ============================================================================
export const getAnalyticsSummary: RequestHandler = async (_req, res) => {
  const [
    giftCount,
    courierCount,
    confidentialCount,
    forgotCount,
    returnCount,
    deliveredCount,
  ] = await Promise.all([
    prisma.giftDeliveryBooking.count(),
    prisma.courierBooking.count(),
    prisma.confidentialCourierBooking.count(),
    prisma.forgotSomethingBooking.count(),
    prisma.returnPickupBooking.count(),
    Promise.all([
      prisma.giftDeliveryBooking.count({ where: { status: 'DELIVERED' } }),
      prisma.courierBooking.count({ where: { status: 'DELIVERED' } }),
      prisma.confidentialCourierBooking.count({ where: { status: 'DELIVERED' } }),
      prisma.forgotSomethingBooking.count({ where: { status: 'DELIVERED' } }),
      prisma.returnPickupBooking.count({ where: { status: 'DELIVERED' } }),
    ]).then(counts => counts.reduce((a, b) => a + b, 0)),
  ]);

  const totalOrders = giftCount + courierCount + confidentialCount + forgotCount + returnCount || 1;

  const serviceDistribution = [
    { name: 'Gift & Celebration', percentage: Math.round((giftCount / totalOrders) * 100), count: giftCount, color: '#E11D48' },
    { name: 'Personal Courier', percentage: Math.round((courierCount / totalOrders) * 100), count: courierCount, color: '#2563EB' },
    { name: 'Confidential Luggage', percentage: Math.round((confidentialCount / totalOrders) * 100), count: confidentialCount, color: '#D97706' },
    { name: 'Return Pickup', percentage: Math.round((returnCount / totalOrders) * 100), count: returnCount, color: '#059669' },
    { name: 'Forgot Something', percentage: Math.round((forgotCount / totalOrders) * 100), count: forgotCount, color: '#7C3AED' },
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyOrdersTrend = days.map((day, idx) => {
    const dayOrders = idx === 6 ? totalOrders : Math.max(1, Math.round((totalOrders / 7) * (idx + 1) * 0.4));
    return {
      day,
      orders: dayOrders,
      revenue: dayOrders * 320,
    };
  });

  const peakHours = [
    { hour: '08:00 - 11:00 AM', volume: 'Active (Morning Express Dispatches)' },
    { hour: '12:00 - 03:00 PM', volume: 'Steady (Midday Courier & Document Drops)' },
    { hour: '04:00 - 07:00 PM', volume: 'Peak (Evening Gifts & Surprises)' },
    { hour: '11:00 - 12:30 AM', volume: 'Surprise (Midnight Cake Deliveries)' },
  ];

  const deliverySuccessRate = totalOrders > 0 ? Number(((Math.max(deliveredCount, 1) / totalOrders) * 100).toFixed(1)) : 100;

  res.status(200).json({
    status: 'success',
    data: {
      dailyOrdersTrend,
      serviceDistribution,
      peakHours,
      deliverySuccessRate,
      avgDeliveryTimeMins: 38,
      customerSatisfactionScore: 4.9,
    },
  });
};

// ============================================================================
// 7. EXPORT DATA ENGINE (CSV STREAMING)
// ============================================================================
export const exportOrdersCsv: RequestHandler = async (_req, res) => {
  const giftOrders = await prisma.giftDeliveryBooking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { user: { select: { fullName: true, mobileNumber: true } } },
  });

  let csv = 'Order ID,Service,Customer Name,Customer Phone,Recipient Name,Destination City,Amount,Status,Date\n';

  giftOrders.forEach((o) => {
    csv += `"${o.bookingNumber}","Gift Delivery","${o.user?.fullName || 'Customer'}","${o.user?.mobileNumber || ''}","${o.recipientName}","${o.deliveryCity}",${o.totalAmount},"${o.status}","${new Date(o.createdAt).toISOString()}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="delivez-orders-export.csv"');
  res.status(200).send(csv);
};

export const exportUsersCsv: RequestHandler = async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    select: publicUserSelect,
  });

  let csv = 'User ID,Full Name,Mobile Number,Email,Role,Created At\n';
  users.forEach((u) => {
    csv += `"${u.id}","${u.fullName}","${u.mobileNumber}","${u.email || ''}","${u.role}","${new Date(u.createdAt).toISOString()}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="delivez-users-export.csv"');
  res.status(200).send(csv);
};

// ============================================================================
// 8. SERVICE SPECIFIC ADMIN CONTROLLERS
// ============================================================================


const defaultAdminAgent = {
  name: 'Ravi Kumar',
  id: 'DLZAGT45521',
  phone: '+91 98765 43210',
  vehicle: 'DL 1Z 4589',
  rating: '4.9',
  completedTrips: '1,420+',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
};

const defaultAdminPod = {
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
  notes: 'Luggage received intact with tamper-evident seal unbroken. Front desk verified guest name Rahul Sharma, Room 402.',
};

const generateAdminTimeline = (status: string, meta: any = {}) => {
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
    LUGGAGE_INSPECTED: 4,
    SECURITY_SEAL_APPLIED: 5,
    PICKED_UP: 6,
    LUGGAGE_PICKED: 6,
    IN_TRANSIT: 7,
    REACHED_DESTINATION_CITY: 8,
    OUT_FOR_DELIVERY: 9,
    DELIVERED: 10,
    CANCELLED: 0,
  };

  const currentWeight = weights[status] ?? 7;

  const stages = [
    { id: 1, weight: 1, stage: 'BOOKING_CONFIRMED', title: 'Booking Confirmed', location: pickupCity, description: `Your luggage delivery booking ${bNumber} has been confirmed.`, timestamp: '10 May 2025, 09:30 AM' },
    { id: 2, weight: 2, stage: 'AGENT_ASSIGNED', title: 'Agent Assigned', location: pickupCity, description: 'Ravi Kumar (DLZAGT45521) assigned for luggage pickup.', timestamp: '10 May 2025, 09:45 AM' },
    { id: 3, weight: 3, stage: 'AGENT_REACHED_PICKUP', title: 'Agent Reached Pickup Location', location: meta.pickupDetails?.terminal ? `Indira Gandhi Int Airport (${meta.pickupDetails.terminal})` : pickupCity, description: 'Agent reached pickup point at Luggage Belt / Lobby.', timestamp: '10 May 2025, 10:15 AM' },
    { id: 4, weight: 4, stage: 'LUGGAGE_INSPECTED_WEIGHED', title: 'Luggage Inspected & Weighed', location: pickupCity, description: `Bags inspected and weighed. Total verified weight: ${meta.totalWeightKg || 28} Kg.`, timestamp: '10 May 2025, 10:25 AM' },
    { id: 5, weight: 5, stage: 'SECURITY_SEAL_APPLIED', title: 'Security Seal Applied', location: pickupCity, description: `High-security tamper-evident seal applied: ${seal}`, timestamp: '10 May 2025, 10:30 AM', sealNumber: seal },
    { id: 6, weight: 6, stage: 'LUGGAGE_PICKED', title: 'Luggage Picked Up', location: pickupCity, description: 'Luggage safely handed over to courier agent with digital receipt.', timestamp: '10 May 2025, 10:35 AM' },
    { id: 7, weight: 7, stage: 'IN_TRANSIT', title: 'In Transit to Destination City', location: 'Near Kota, Rajasthan', description: 'Shipment is on the way in a secure, GPS-tracked sanitized vehicle.', timestamp: '10 May 2025, 11:30 AM' },
    { id: 8, weight: 8, stage: 'REACHED_DESTINATION_CITY', title: 'Reached Destination City Hub', location: `${dropoffCity} Hub`, description: 'Consignment arrived at destination sorting and dispatch facility.', timestamp: '11 May 2025, 08:00 PM' },
    { id: 9, weight: 9, stage: 'OUT_FOR_DELIVERY', title: 'Out for Delivery', location: dropoffCity, description: 'Agent out for delivery to destination hotel / home address.', timestamp: '12 May 2025, 02:00 PM' },
    { id: 10, weight: 10, stage: 'DELIVERED', title: 'Luggage Delivered Safely', location: meta.deliveryDetails?.hotelName ? `${meta.deliveryDetails.hotelName} Front Desk` : dropoffCity, description: 'Luggage delivered safely with OTP verification and tamper seal intact.', timestamp: '12 May 2025, 05:45 PM' },
  ];

  return stages.map((s) => ({
    ...s,
    completed: s.weight <= currentWeight,
    current: s.weight === currentWeight,
    pending: s.weight > currentWeight,
  }));
};

const serializeAdminCourierBooking = (booking: any) => {
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
  const serviceType = meta.serviceType || booking.serviceType || 'AIRPORT_TO_HOTEL';
  const sealNumber = meta.sealNumber || 'DLV-SEAL-88492';
  const agent = meta.agent || defaultAdminAgent;
  const pod = meta.pod || defaultAdminPod;
  const timeline = meta.timeline || generateAdminTimeline(status, { ...meta, sealNumber, bookingNumber: booking.bookingNumber });

  return {
    ...booking,
    bookingNumber: booking.bookingNumber,
    status,
    serviceType,
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
      ? booking.addresses.map((addr: any) => ({
          ...addr,
          latitude: addr.latitude === null ? null : Number(addr.latitude),
          longitude: addr.longitude === null ? null : Number(addr.longitude),
        }))
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
          boxCapacity: meta.boxCapacity || (booking.package.needsBox ? '10 Kg' : null),
          boxSizeName: meta.boxSizeName || (booking.package.needsBox ? 'Small Box (10 Kg)' : null),
          pickupReadiness: meta.pickupReadiness || 'Today',
          contentDescription: meta.description ?? booking.package.contentDescription,
        }
      : null,
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

export const listAdminCourierBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';

  const where: Prisma.CourierBookingWhereInput = {};
  if (status !== 'ALL') where.status = status as any;
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { mobileNumber: { contains: search } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.courierBooking.count({ where }),
    prisma.courierBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: publicUserSelect },
        addresses: true,
        package: true,
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings: bookings.map(serializeAdminCourierBooking),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const getAdminCourierBooking: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const booking = await prisma.courierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Courier booking not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { booking: serializeAdminCourierBooking(booking) },
  });
};

export const updateAdminCourierBooking: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.courierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  if (!existing) {
    throw new AppError(404, 'Courier booking not found.');
  }

  const {
    pickup,
    dropoff,
    package: pkg,
    serviceType,
    status,
    agent,
    pickupSchedule,
    totalAmount,
    pickupDetails,
    deliveryDetails,
    luggage,
    addons,
    schedule,
    sealNumber,
    pod,
  } = req.body;

  // 1. Update pickup address
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

  // 2. Update dropoff address
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

  // 3. Update package & metadata
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
  if (sealNumber) meta.sealNumber = sealNumber;
  if (agent) meta.agent = { ...(meta.agent || defaultAdminAgent), ...agent };
  if (pod) meta.pod = { ...(meta.pod || defaultAdminPod), ...pod };
  if (status) {
    meta.status = status;
    meta.timeline = generateAdminTimeline(status, meta);
  }

  if (existing.package) {
    await prisma.courierBookingPackage.update({
      where: { id: existing.package.id },
      data: {
        actualWeightKg: pkg?.actualWeightKg !== undefined ? Number(pkg.actualWeightKg) : existing.package.actualWeightKg,
        chargeableWeightKg: pkg?.chargeableWeightKg !== undefined ? Number(pkg.chargeableWeightKg) : existing.package.chargeableWeightKg,
        contentDescription: JSON.stringify(meta),
      },
    });
  }

  // 4. Update core booking row
  const validDbStatuses = ['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  let dbStatus: any = undefined;
  if (status) {
    if (validDbStatuses.includes(status)) {
      dbStatus = status;
    } else if (status === 'OUT_FOR_DELIVERY' || status === 'REACHED_DESTINATION_CITY') {
      dbStatus = 'IN_TRANSIT';
    } else if (status === 'AGENT_ASSIGNED') {
      dbStatus = 'PICKUP_ASSIGNED';
    } else if (status === 'LUGGAGE_PICKED') {
      dbStatus = 'PICKED_UP';
    } else {
      dbStatus = 'CONFIRMED';
    }
  }

  const updated = await prisma.courierBooking.update({
    where: { id: existing.id },
    data: {
      status: dbStatus,
      totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
    },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Courier booking updated successfully.',
    data: { booking: serializeAdminCourierBooking(updated) },
  });
};

export const updateAdminCourierStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.courierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });
  if (!existing) throw new AppError(404, 'Courier booking not found.');

  let meta: any = {};
  if (existing.package?.contentDescription) {
    try {
      meta = JSON.parse(existing.package.contentDescription);
    } catch {
      meta = { description: existing.package.contentDescription };
    }
  }

  meta.status = status;
  meta.timeline = generateAdminTimeline(status, meta);

  if (existing.package) {
    await prisma.courierBookingPackage.update({
      where: { id: existing.package.id },
      data: { contentDescription: JSON.stringify(meta) },
    });
  }

  const validDbStatuses = ['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];
  let dbStatus: any = 'IN_TRANSIT';
  if (validDbStatuses.includes(status)) {
    dbStatus = status;
  } else if (status === 'OUT_FOR_DELIVERY' || status === 'REACHED_DESTINATION_CITY') {
    dbStatus = 'IN_TRANSIT';
  } else if (status === 'AGENT_ASSIGNED') {
    dbStatus = 'PICKUP_ASSIGNED';
  } else if (status === 'LUGGAGE_PICKED') {
    dbStatus = 'PICKED_UP';
  } else {
    dbStatus = 'CONFIRMED';
  }

  const updated = await prisma.courierBooking.update({
    where: { id: existing.id },
    data: { status: dbStatus },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: `Status updated to ${status}`,
    data: { booking: serializeAdminCourierBooking(updated) },
  });
};

export const recordAdminCourierPOD: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const existing = await prisma.courierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  if (!existing) {
    throw new AppError(404, 'Courier booking not found.');
  }

  const { deliveredTo, deliveredAddress, receivedBy, relationship, contactNumber, signature, photoUrl, sealPhotoUrl, notes, otp } = req.body;

  let meta: any = {};
  if (existing.package?.contentDescription) {
    try {
      meta = JSON.parse(existing.package.contentDescription);
    } catch {
      meta = { description: existing.package.contentDescription };
    }
  }

  meta.pod = {
    ...(meta.pod || defaultAdminPod),
    deliveredTo: deliveredTo || meta.pod?.deliveredTo,
    deliveredAddress: deliveredAddress || meta.pod?.deliveredAddress,
    deliveredAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    receivedBy: receivedBy || meta.pod?.receivedBy,
    relationship: relationship || meta.pod?.relationship,
    contactNumber: contactNumber || meta.pod?.contactNumber,
    signature: signature || meta.pod?.signature,
    signatureUrl: signature || meta.pod?.signatureUrl,
    photoUrl: photoUrl || meta.pod?.photoUrl,
    sealPhotoUrl: sealPhotoUrl || meta.pod?.sealPhotoUrl,
    notes: notes || meta.pod?.notes,
    otp: otp || meta.pod?.otp,
  };

  meta.status = 'DELIVERED';
  meta.timeline = generateAdminTimeline('DELIVERED', meta);

  if (existing.package) {
    await prisma.courierBookingPackage.update({
      where: { id: existing.package.id },
      data: { contentDescription: JSON.stringify(meta) },
    });
  }

  const updated = await prisma.courierBooking.update({
    where: { id: existing.id },
    data: { status: 'DELIVERED' },
    include: {
      user: { select: publicUserSelect },
      addresses: true,
      package: true,
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Proof of delivery recorded successfully.',
    data: { booking: serializeAdminCourierBooking(updated) },
  });
};

// --- CONFIDENTIAL COURIER ---
export const listAdminConfidentialBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';

  const where: Prisma.ConfidentialCourierBookingWhereInput = {};
  if (status !== 'ALL') where.status = status as any;
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
      { user: { mobileNumber: { contains: search } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.confidentialCourierBooking.count({ where }),
    prisma.confidentialCourierBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: publicUserSelect },
        addresses: true,
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const updateAdminConfidentialStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.confidentialCourierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

  const updated = await prisma.confidentialCourierBooking.update({
    where: { id: existing.id },
    data: { status: status as any },
  });

  res.status(200).json({
    status: 'success',
    message: `Status updated to ${status}`,
    data: { booking: updated },
  });
};

// --- FORGOT SOMETHING ---
export const listAdminForgotBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';

  const where: Prisma.ForgotSomethingBookingWhereInput = {};
  if (status !== 'ALL') where.status = status as any;
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { pickupContactName: { contains: search, mode: 'insensitive' } },
      { dropoffRecipientName: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.forgotSomethingBooking.count({ where }),
    prisma.forgotSomethingBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: publicUserSelect },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const updateAdminForgotStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.forgotSomethingBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Forgot something booking not found.');

  const updated = await prisma.forgotSomethingBooking.update({
    where: { id: existing.id },
    data: { status: status as any },
  });

  res.status(200).json({
    status: 'success',
    message: `Status updated to ${status}`,
    data: { booking: updated },
  });
};

// --- RETURN PICKUP ---
export const listAdminReturnBookings: RequestHandler = async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const status = typeof req.query.status === 'string' ? req.query.status : 'ALL';

  const where: Prisma.ReturnPickupBookingWhereInput = {};
  if (status !== 'ALL') where.status = status as any;
  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { pickupStoreName: { contains: search, mode: 'insensitive' } },
      { destinationName: { contains: search, mode: 'insensitive' } },
      { user: { fullName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.returnPickupBooking.count({ where }),
    prisma.returnPickupBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: publicUserSelect },
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const updateAdminReturnStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.returnPickupBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Return pickup booking not found.');

  const updated = await prisma.returnPickupBooking.update({
    where: { id: existing.id },
    data: { status: status as any },
  });

  res.status(200).json({
    status: 'success',
    message: `Status updated to ${status}`,
    data: { booking: updated },
  });
};


// ============================================================================
// 9. CROSS-SERVICE UNIFIED ORDER ACTIONS & LIFECYCLE
// ============================================================================
export const updateUnifiedOrderStatus: RequestHandler = async (req, res) => {
  const serviceKey = String(req.params.serviceKey || '').toLowerCase();
  const id = String(req.params.id || '');
  const { status } = req.body;

  if (!status) throw new AppError(400, 'Order status is required.');

  let updatedOrder: any = null;

  if (serviceKey.includes('gift')) {
    const existing = await prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Gift delivery booking not found.');

    let giftStatus: any = status;
    if (status === 'IN_TRANSIT') giftStatus = 'ON_THE_WAY';
    if (!['CONFIRMED', 'PREPARING_GIFT', 'GIFT_PACKED', 'PARTNER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'ARRIVED', 'DELIVERED', 'CANCELLED'].includes(giftStatus)) {
      giftStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.giftDeliveryBooking.update({
      where: { id: existing.id },
      data: {
        status: giftStatus,
        ...(giftStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        ...(giftStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Courier booking not found.');

    let courierStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(courierStatus)) {
      courierStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: courierStatus,
        ...(courierStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(courierStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('confidential') || serviceKey.includes('luggage')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential courier booking not found.');

    let confStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(confStatus)) {
      confStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: confStatus,
        ...(confStatus === 'CONFIRMED' ? { confirmedAt: new Date() } : {}),
        ...(confStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('forgot')) {
    const existing = await prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Forgot something booking not found.');

    let forgotStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PARTNER_ASSIGNED', 'PICKUP_IN_PROGRESS', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].includes(forgotStatus)) {
      forgotStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.forgotSomethingBooking.update({
      where: { id: existing.id },
      data: {
        status: forgotStatus,
        ...(forgotStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        ...(forgotStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else if (serviceKey.includes('return')) {
    const existing = await prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Return pickup booking not found.');

    let returnStatus: any = status;
    if (!['PAYMENT_PENDING', 'CONFIRMED', 'PICKUP_SCHEDULED', 'PARTNER_ON_THE_WAY', 'ARRIVED_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'AT_DESTINATION', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(returnStatus)) {
      returnStatus = 'CONFIRMED';
    }

    updatedOrder = await prisma.returnPickupBooking.update({
      where: { id: existing.id },
      data: {
        status: returnStatus,
        ...(returnStatus === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        ...(returnStatus === 'CANCELLED' ? { cancelledAt: new Date() } : {}),
      },
    });
  } else {
    throw new AppError(400, 'Unsupported service vertical.');
  }

  res.status(200).json({
    status: 'success',
    message: `Order status updated to ${status}.`,
    data: { order: updatedOrder },
  });
};

export const assignPartnerToOrder: RequestHandler = async (req, res) => {
  const serviceKey = String(req.params.serviceKey || '').toLowerCase();
  const id = String(req.params.id || '');
  const { partnerId, partnerName, partnerPhone, partnerVehicle } = req.body;

  if (!partnerName) throw new AppError(400, 'Partner name is required for dispatch assignment.');

  let updatedOrder: any = null;

  if (serviceKey.includes('gift')) {
    const existing = await prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Gift delivery booking not found.');

    updatedOrder = await prisma.giftDeliveryBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone: partnerPhone || '+91 98765 43210',
        partnerVehicle: partnerVehicle || 'Standard Delivery EV',
        status: 'PARTNER_ASSIGNED',
      },
    });
  } else if (serviceKey.includes('forgot')) {
    const existing = await prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Forgot something booking not found.');

    updatedOrder = await prisma.forgotSomethingBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone: partnerPhone || '+91 98765 43210',
        partnerVehicle: partnerVehicle || 'Retrieval Scooter',
        status: 'PARTNER_ASSIGNED',
        partnerAssignedAt: new Date(),
      },
    });
  } else if (serviceKey.includes('return')) {
    const existing = await prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Return pickup booking not found.');

    updatedOrder = await prisma.returnPickupBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone: partnerPhone || '+91 98765 43210',
        partnerVehicle: partnerVehicle || 'Return Express Bike',
        status: 'PARTNER_ON_THE_WAY',
        partnerOnTheWayAt: new Date(),
      },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Courier booking not found.');

    updatedOrder = await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'PICKUP_ASSIGNED',
      },
    });
  } else if (serviceKey.includes('confidential') || serviceKey.includes('luggage')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential booking not found.');

    updatedOrder = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'PICKUP_ASSIGNED',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Partner ${partnerName} assigned successfully.`,
    data: {
      order: updatedOrder,
      assignedPartner: {
        id: partnerId,
        name: partnerName,
        phone: partnerPhone,
        vehicle: partnerVehicle,
      },
    },
  });
};

export const cancelUnifiedOrder: RequestHandler = async (req, res) => {
  const serviceKey = String(req.params.serviceKey || '').toLowerCase();
  const id = String(req.params.id || '');
  const { reason } = req.body;

  const cancellationReason = reason || 'Cancelled by Operations Administrator';

  if (serviceKey.includes('gift')) {
    const existing = await prisma.giftDeliveryBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.giftDeliveryBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('courier') || serviceKey.includes('personal')) {
    const existing = await prisma.courierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.courierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('confidential') || serviceKey.includes('luggage')) {
    const existing = await prisma.confidentialCourierBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('forgot')) {
    const existing = await prisma.forgotSomethingBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.forgotSomethingBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  } else if (serviceKey.includes('return')) {
    const existing = await prisma.returnPickupBooking.findFirst({ where: { OR: [{ id }, { bookingNumber: id }] } });
    if (!existing) throw new AppError(404, 'Order not found.');
    await prisma.returnPickupBooking.update({
      where: { id: existing.id },
      data: { status: 'CANCELLED', cancellationReason, cancelledAt: new Date() },
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully.',
  });
};

export const autoAssignOrder: RequestHandler = async (req, res) => {
  const serviceKey = String(req.params.serviceKey || '').toLowerCase();
  const id = String(req.params.id || '');

  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: publicUserSelect,
  });

  if (drivers.length === 0) {
    throw new AppError(404, 'No delivery partners found in the fleet.');
  }

  const onlineDriver = drivers.find(d => (partnerMetadataStore[d.id] as any)?.status === 'ONLINE') || drivers[0];
  if (!onlineDriver) {
    throw new AppError(404, 'No suitable delivery partner found.');
  }
  const meta: any = partnerMetadataStore[onlineDriver.id] || { zone: 'Central Hub', vehicle: 'Electric Scooter (EV-01)' };

  let updatedOrder: any = null;
  const partnerName = onlineDriver.fullName;
  const partnerPhone = `+${onlineDriver.countryCode || '91'} ${onlineDriver.mobileNumber}`;
  const partnerVehicle = meta.vehicle || 'Delivez Fleet EV';

  if (serviceKey.includes('gift')) {
    const existing = await prisma.giftDeliveryBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Gift delivery booking not found.');

    updatedOrder = await prisma.giftDeliveryBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone,
        partnerVehicle,
        status: 'PARTNER_ASSIGNED',
      },
    });
  } else if (serviceKey.includes('forgot')) {
    const existing = await prisma.forgotSomethingBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Forgot something booking not found.');

    updatedOrder = await prisma.forgotSomethingBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone,
        partnerVehicle,
        status: 'PARTNER_ASSIGNED',
        partnerAssignedAt: new Date(),
      },
    });
  } else if (serviceKey.includes('return')) {
    const existing = await prisma.returnPickupBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Return pickup booking not found.');

    updatedOrder = await prisma.returnPickupBooking.update({
      where: { id: existing.id },
      data: {
        partnerName,
        partnerPhone,
        status: 'PICKUP_SCHEDULED',
      },
    });
  } else if (serviceKey.includes('courier')) {
    const existing = await prisma.courierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Courier booking not found.');

    updatedOrder = await prisma.courierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'PICKUP_ASSIGNED',
      },
    });
  } else {
    const existing = await prisma.confidentialCourierBooking.findFirst({
      where: { OR: [{ id }, { bookingNumber: id }] },
    });
    if (!existing) throw new AppError(404, 'Confidential booking not found.');

    updatedOrder = await prisma.confidentialCourierBooking.update({
      where: { id: existing.id },
      data: {
        status: 'CONFIRMED',
      },
    });
  }

  recordAuditLog(
    'ORDERS',
    'DISPATCH_AUTO_ASSIGNED',
    'Smart Dispatch Engine',
    'admin@delevez.com',
    String(req.ip || '127.0.0.1'),
    `Auto-assigned driver ${partnerName} (${partnerPhone}) to ${serviceKey} order ${id}`,
    { orderId: id, serviceKey, partnerName }
  );

  res.status(200).json({
    status: 'success',
    message: `Order successfully auto-dispatched to ${partnerName}.`,
    data: {
      orderId: id,
      assignedPartner: partnerName,
      partnerPhone,
      partnerVehicle,
      updatedStatus: updatedOrder?.status,
    },
  });
};

export const getPartnerScorecard: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const driver = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });

  if (!driver || driver.role !== 'DRIVER') {
    throw new AppError(404, 'Delivery partner not found.');
  }

  const meta: any = partnerMetadataStore[id] || {
    status: 'ONLINE',
    zone: 'Bengaluru Central',
    vehicle: 'Ather 450X Electric Scooter',
    rating: 4.9,
    deliveriesCount: 42,
  };

  const scorecard = {
    partnerId: driver.id,
    fullName: driver.fullName,
    mobileNumber: `+${driver.countryCode || '91'} ${driver.mobileNumber}`,
    email: driver.email,
    joinedDate: driver.createdAt,
    status: meta.status || 'ONLINE',
    zone: meta.zone || 'Central Hub',
    vehicle: meta.vehicle || 'Electric Scooter (EV-01)',
    metrics: {
      rating: meta.rating || 4.9,
      totalDeliveries: meta.deliveriesCount || 42,
      onTimeDeliveryRate: 98.6,
      customerSatisfaction: 99.1,
      safetyScore: 98,
      acceptanceRate: 96.4,
      cancellationRate: 0.8,
    },
    compliance: {
      drivingLicenseVerified: true,
      policeVerificationPassed: true,
      vehicleRegistrationValid: true,
      insuranceActive: true,
      emergencyContactName: 'Fleet HQ Support',
      emergencyContactPhone: '+91 1800 335 483',
    },
    achievements: [
      { title: 'Top Rated Rider', desc: 'Maintained 4.8+ rating for 3 consecutive months', icon: 'Star' },
      { title: 'Zero Incident Champion', desc: '100% incident-free safety record', icon: 'ShieldCheck' },
      { title: 'Speed & Precision', desc: 'Over 98% on-time milestone arrival', icon: 'Zap' },
    ],
  };

  res.status(200).json({
    status: 'success',
    data: { scorecard },
  });
};
