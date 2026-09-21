import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  fullName: true,
  countryCode: true,
  mobileNumber: true,
  email: true,
  role: true,
  avatarUrl: true,
  dateOfBirth: true,
  gender: true,
  alternatePhone: true,
  address: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  memberTier: true,
  walletBalance: true,
  theme: true,
  language: true,
  defaultPickupAddress: true,
  defaultPackageType: true,
  pushNotifications: true,
  shipmentUpdates: true,
  offersPromotions: true,
  newsUpdates: true,
  termsAcceptedAt: true,
  mobileVerifiedAt: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;
