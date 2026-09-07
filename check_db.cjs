const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({ select: { id: true, slug: true, name: true } });
  console.log('Services in DB:', services);

  const returns = await prisma.returnPickupBooking.findMany();
  console.log('ReturnPickupBookings in DB:', returns.length);
  if (returns.length > 0) {
    console.log('Sample return booking:', returns[0]);
  }

  const users = await prisma.user.findMany({ select: { id: true, mobileNumber: true, fullName: true } });
  console.log('Users in DB:', users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
