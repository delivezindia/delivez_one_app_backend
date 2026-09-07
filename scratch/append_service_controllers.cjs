const fs = require('fs');

const controllerPath = 'c:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/admin/admin-management.controller.ts';
let code = fs.readFileSync(controllerPath, 'utf8');

const serviceControllers = `
// ============================================================================
// 8. SERVICE SPECIFIC ADMIN CONTROLLERS
// ============================================================================

// --- PERSONAL COURIER ---
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
      bookings,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
};

export const updateAdminCourierStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const existing = await prisma.courierBooking.findFirst({
    where: { OR: [{ id }, { bookingNumber: id }] },
  });
  if (!existing) throw new AppError(404, 'Courier booking not found.');

  const updated = await prisma.courierBooking.update({
    where: { id: existing.id },
    data: { status: status as any },
  });

  res.status(200).json({
    status: 'success',
    message: \`Status updated to \${status}\`,
    data: { booking: updated },
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
    message: \`Status updated to \${status}\`,
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
    message: \`Status updated to \${status}\`,
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
    message: \`Status updated to \${status}\`,
    data: { booking: updated },
  });
};
`;

fs.writeFileSync(controllerPath, code + serviceControllers, 'utf8');
console.log('Appended service controllers to admin-management.controller.ts');

// Now update admin.routes.ts
const routesPath = 'c:/Users/Rax/Desktop/Delivery_app_site_backend/src/modules/admin/admin.routes.ts';
let routesCode = fs.readFileSync(routesPath, 'utf8');

routesCode = routesCode.replace(
  `import {
  getUnifiedDashboardStats,`,
  `import {
  listAdminCourierBookings,
  updateAdminCourierStatus,
  listAdminConfidentialBookings,
  updateAdminConfidentialStatus,
  listAdminForgotBookings,
  updateAdminForgotStatus,
  listAdminReturnBookings,
  updateAdminReturnStatus,
  getUnifiedDashboardStats,`
);

routesCode = routesCode.replace(
  `// 2. Cross-Service Unified Orders`,
  `// Services Specific Admin Handlers
adminRouter.get('/courier/bookings', listAdminCourierBookings);
adminRouter.patch('/courier/bookings/:id/status', updateAdminCourierStatus);

adminRouter.get('/confidential/bookings', listAdminConfidentialBookings);
adminRouter.patch('/confidential/bookings/:id/status', updateAdminConfidentialStatus);

adminRouter.get('/forgot/bookings', listAdminForgotBookings);
adminRouter.patch('/forgot/bookings/:id/status', updateAdminForgotStatus);

adminRouter.get('/return/bookings', listAdminReturnBookings);
adminRouter.patch('/return/bookings/:id/status', updateAdminReturnStatus);

// 2. Cross-Service Unified Orders`
);

fs.writeFileSync(routesPath, routesCode, 'utf8');
console.log('Updated admin.routes.ts with service specific routes');
