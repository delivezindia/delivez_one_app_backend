import type { Request } from 'express';
import type { Prisma } from '@prisma/client';

import { env } from '../../config/env.js';
import { AppError } from '../../lib/app-error.js';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_ALIASES: Record<string, string> = {
  'personal-courier': 'courier-delivery',
  'airport-luggage': 'luggage-delivery',
  'confidential-courier': 'confidential-delivery',
  'personal-return-pickup': 'return-pickup',
  'gift-and-surprise': 'know-more',
  'gift-delivery': 'know-more',
  'know-more': 'know-more',
};

export const canonicalSlug = (slug: string): string => {
  return SLUG_ALIASES[slug] || slug;
};

export const slugify = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const parseBoolean = (value: unknown, field: string): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new AppError(400, `${field} must be true or false.`);
};

const parseDisplayOrder = (value: unknown): number => {
  const displayOrder = Number.parseInt(String(value), 10);
  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new AppError(400, 'displayOrder must be a non-negative integer.');
  }
  return displayOrder;
};

export const validateServiceInput = (
  body: Record<string, any> = {},
  { partial = false } = {},
) => {
  const data: {
    name?: string;
    slug?: string;
    shortDescription?: string;
    description?: string | null;
    displayOrder?: number;
    isActive?: boolean;
  } = {};

  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2 || name.length > 100) {
      throw new AppError(400, 'name must contain 2 to 100 characters.');
    }
    data.name = name;
  }

  if (!partial || body.slug !== undefined || body.name !== undefined) {
    const slug =
      body.slug === undefined
        ? slugify(data.name)
        : slugify(body.slug);
    if (!SLUG_PATTERN.test(slug) || slug.length > 100) {
      throw new AppError(
        400,
        'slug must contain lowercase letters, numbers, and hyphens only.',
      );
    }
    data.slug = slug;
  }

  if (!partial || body.shortDescription !== undefined) {
    const shortDescription =
      typeof body.shortDescription === 'string'
        ? body.shortDescription.trim()
        : '';
    if (shortDescription.length > 250) {
      throw new AppError(400, 'shortDescription must not exceed 250 characters.');
    }
    data.shortDescription = shortDescription;
  }

  if (body.description !== undefined) {
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    data.description = description || null;
  }

  if (!partial || body.displayOrder !== undefined) {
    data.displayOrder =
      body.displayOrder === undefined ? 0 : parseDisplayOrder(body.displayOrder);
  }

  if (body.isActive !== undefined) {
    data.isActive = parseBoolean(body.isActive, 'isActive');
  }

  return data;
};

export const serviceListSelect = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  imageMimeType: true,
  imageFileName: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

export type ServiceListItem = Prisma.ServiceGetPayload<{
  select: typeof serviceListSelect;
}>;

export const serializeService = (
  req: Request,
  service: ServiceListItem & { imageData?: unknown },
) => {
  const { imageData: _img, ...data } = service;
  const hasImage = Boolean(service.imageMimeType);
  const imageVersion =
    service.updatedAt instanceof Date
      ? service.updatedAt.getTime()
      : new Date(service.updatedAt).getTime();
  const apiBaseUrl =
    env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}/api/v1`;

  return {
    ...data,
    hasImage,
    imageUrl: hasImage
      ? `${apiBaseUrl}/services/${service.slug}/image?v=${imageVersion}`
      : null,
  };
};
