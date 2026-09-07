import type { RequestHandler } from 'express';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  canonicalSlug,
  serializeService,
  serviceListSelect,
} from './service.utils.js';

export const listServices: RequestHandler = async (req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    select: serviceListSelect,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  });

  res.status(200).json({
    status: 'success',
    data: {
      services: services.map((service) => serializeService(req, service)),
      total: services.length,
    },
  });
};

export const getService: RequestHandler = async (req, res) => {
  const rawSlug = String(req.params.slug);
  const slug = canonicalSlug(rawSlug);
  const service = await prisma.service.findFirst({
    where: {
      OR: [{ slug }, { slug: rawSlug }, { id: rawSlug }],
      isActive: true,
    },
    select: serviceListSelect,
  });

  if (!service) {
    throw new AppError(404, 'Service not found.');
  }

  res.status(200).json({
    status: 'success',
    data: { service: serializeService(req, service) },
  });
};

export const getServiceImage: RequestHandler = async (req, res) => {
  const rawSlug = String(req.params.slug);
  const slug = canonicalSlug(rawSlug);
  const service = await prisma.service.findFirst({
    where: {
      OR: [{ slug }, { slug: rawSlug }, { id: rawSlug }],
    },
    select: {
      id: true,
      imageData: true,
      imageMimeType: true,
      imageFileName: true,
      updatedAt: true,
    },
  });

  if (!service?.imageData || !service.imageMimeType) {
    throw new AppError(404, 'Service image not found.');
  }

  const fileName = encodeURIComponent(service.imageFileName || 'service-image');
  const buffer = Buffer.isBuffer(service.imageData)
    ? service.imageData
    : Buffer.from(service.imageData as any);

  res.set({
    'Content-Type': service.imageMimeType,
    'Content-Length': String(buffer.length),
    'Content-Disposition': `inline; filename*=UTF-8''${fileName}`,
    'Cache-Control': 'public, max-age=3600',
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    ETag: `"${service.id}-${service.updatedAt.getTime()}"`,
  });

  res.status(200).send(buffer);
};
