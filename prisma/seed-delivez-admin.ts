import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  const fullName = 'delivez_admin';
  const countryCode = '+91';
  const mobileNumber = '1122334455';
  const email = 'delivez_admin@delivez.com';
  const rawPassword = 'Admin@123';

  console.log(`Hashing password for ${fullName}...`);
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  const admin = await prisma.user.upsert({
    where: {
      countryCode_mobileNumber: { countryCode, mobileNumber },
    },
    update: {
      fullName,
      email,
      passwordHash,
      role: 'ADMIN',
      mobileVerifiedAt: new Date(),
    },
    create: {
      fullName,
      countryCode,
      mobileNumber,
      email,
      passwordHash,
      role: 'ADMIN',
      termsAcceptedAt: new Date(),
      mobileVerifiedAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      countryCode: true,
      mobileNumber: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  console.log('✅ Admin account is ready on database:');
  console.log(JSON.stringify(admin, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Failed to seed admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
