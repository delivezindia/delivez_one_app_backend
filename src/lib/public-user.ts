import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  fullName: true,
  countryCode: true,
  mobileNumber: true,
  email: true,
  role: true,
  termsAcceptedAt: true,
  mobileVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
