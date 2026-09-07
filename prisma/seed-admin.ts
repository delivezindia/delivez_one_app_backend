import bcrypt from 'bcryptjs';

import { env } from '../src/config/env.js';
import { prisma } from '../src/lib/prisma.js';

const fullName = env.ADMIN_FULL_NAME;
const countryCode = env.ADMIN_COUNTRY_CODE;
const mobileNumber = env.ADMIN_MOBILE_NUMBER.replace(/\D/g, '');
const email = env.ADMIN_EMAIL.toLowerCase();
const password = env.ADMIN_PASSWORD;

if (!/^\+\d{1,4}$/.test(countryCode)) {
  throw new Error('ADMIN_COUNTRY_CODE must look like +91.');
}

if (!/^\d{7,15}$/.test(mobileNumber)) {
  throw new Error('ADMIN_MOBILE_NUMBER must contain 7 to 15 digits.');
}

if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(password)) {
  throw new Error(
    'ADMIN_PASSWORD must be 8 to 72 characters and include uppercase, lowercase, and a number.',
  );
}

try {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.user.upsert({
    where: {
      countryCode_mobileNumber: { countryCode, mobileNumber },
    },
    update: {
      fullName,
      email,
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      fullName,
      countryCode,
      mobileNumber,
      email,
      passwordHash,
      role: 'ADMIN',
      termsAcceptedAt: new Date(),
    },
    select: {
      id: true,
      fullName: true,
      countryCode: true,
      mobileNumber: true,
      email: true,
      role: true,
    },
  });

  console.log(
    `Admin account is ready: ${admin.countryCode}${admin.mobileNumber} (${admin.role})`,
  );
} finally {
  await prisma.$disconnect();
}
