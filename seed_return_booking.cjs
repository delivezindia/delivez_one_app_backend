const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Return Pickup demo booking in database...');
  
  // Find or create default user
  let user = await prisma.user.findFirst({
    where: { mobileNumber: '6386189353' }
  });
  if (!user) {
    user = await prisma.user.findFirst();
  }
  if (!user) {
    user = await prisma.user.create({
      data: {
        mobileNumber: '9876543210',
        fullName: 'Ravi Kishan',
        emailAddress: 'ravi.kishan@delivez.com'
      }
    });
  }

  // Find return-pickup service
  const service = await prisma.service.findFirst({
    where: { slug: 'return-pickup' }
  });

  const bookingNumber = 'DRVZ-RET-080525-00123';

  const existing = await prisma.returnPickupBooking.findUnique({
    where: { bookingNumber }
  });

  if (existing) {
    console.log('Return booking already exists in DB:', existing.id);
    return;
  }

  const created = await prisma.returnPickupBooking.create({
    data: {
      bookingNumber,
      userId: user.id,
      serviceId: service ? service.id : null,
      idempotencyKey: 'seed-ret-080525-00123',
      requestFingerprint: 'seed-fingerprint-00123',
      status: 'DELIVERED',
      
      returnType: 'RETURN_ITEM',
      destinationType: 'ONLINE_STORE',
      destinationName: 'ABC Retail Returns Hub',
      orderId: 'OD-98231456',
      returnId: 'RET-88231',
      returnBeforeDate: '15 May 2026',
      estimatedRefundAmount: 1499.00,

      pickupStoreName: 'Home',
      pickupAddress: '123, MG Road, Indiranagar, Bangalore - 560038, Karnataka',
      pickupCity: 'Bengaluru',
      pickupState: 'Karnataka',
      pickupPostalCode: '560038',
      pickupContactName: 'Ravi Kishan',
      pickupPhoneNumber: '+91 98765 43210',
      pickupInstructions: 'Please collect from the main door.',

      returnAddressType: 'Seller / Warehouse',
      returnAddress: 'ABC Retail Pvt. Ltd., Warehouse No. 7, KIADB Industrial Area, Hosur Road, Bangalore - 560100, Karnataka',
      returnCity: 'Bengaluru',
      returnState: 'Karnataka',
      returnPostalCode: '560100',
      returnContactName: 'ABC Returns Dept',
      returnPhoneNumber: '+91 91234 56789',
      returnInstructions: 'Return is for quality check and refund.',

      itemCategory: 'ELECTRONICS',
      itemDescription: 'Sony Wireless Headphones (Black) - Defective Product',
      itemQuantity: 1,
      declaredValue: 2499.00,
      approxWeightKg: 0.5,
      itemCondition: 'DAMAGED',
      specialHandlingTags: ['FRAGILE', 'HANDLE_WITH_CARE'],
      documents: [
        { id: '1', name: 'Invoice.pdf', uploadedAt: '08 May 2026' },
        { id: '2', name: 'Return Authorization.pdf', uploadedAt: '08 May 2026' }
      ],

      scheduledDate: '08 May 2026',
      scheduledTimeSlot: '11:00 AM - 1:00 PM',
      deliveryService: 'STANDARD',
      shipmentProtection: true,
      protectionCoverAmount: 10000.00,

      pickupOtp: '4821',
      deliveryOtp: '7192',

      partnerName: 'Ravi Kumar',
      partnerPhone: '+91 98765 43210',
      partnerVehicle: 'DL1Z 9876',
      partnerRating: 4.9,
      currentHubLocation: 'Tumkur Hub',

      currency: 'INR',
      basePickupCharge: 49.00,
      distanceCharge: 20.00,
      handlingCharge: 10.00,
      deliveryServiceCharge: 89.00,
      protectionCharge: 19.00,
      discountAmount: 18.70,
      taxAmount: 30.29,
      totalAmount: 198.59,

      paymentMethod: 'CARD',
      paymentStatus: 'PAID',
      paymentProvider: 'SANDBOX',
      paymentReference: 'PAY-RET-080525-001',
      confirmedAt: new Date(Date.now() - 3600000 * 24 * 3),
      pickupScheduledAt: new Date(Date.now() - 3600000 * 24 * 3 + 3600000),
      partnerOnTheWayAt: new Date(Date.now() - 3600000 * 24 * 3 + 7200000),
      arrivedAtPickupAt: new Date(Date.now() - 3600000 * 24 * 3 + 9000000),
      pickedUpAt: new Date(Date.now() - 3600000 * 24 * 3 + 10800000),
      inTransitAt: new Date(Date.now() - 3600000 * 24 * 2),
      atDestinationAt: new Date(Date.now() - 3600000 * 24 * 1),
      outForDeliveryAt: new Date(Date.now() - 3600000 * 12),
      deliveredAt: new Date(Date.now() - 3600000 * 2)
    }
  });

  console.log('✓ Successfully seeded demo return pickup booking into PostgreSQL database:', created.bookingNumber);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
