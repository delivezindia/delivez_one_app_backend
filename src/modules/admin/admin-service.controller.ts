import type { RequestHandler } from 'express';

import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  serializeService,
  serviceListSelect,
  validateServiceInput,
} from '../services/service.utils.js';

const uploadedImageData = (file?: Express.Multer.File) => {
  if (!file) return {};

  return {
    imageData: Buffer.from(file.buffer),
    imageMimeType: file.mimetype,
    imageFileName: file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200),
  };
};

export const listAllServices: RequestHandler = async (req, res) => {
  const services = await prisma.service.findMany({
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

export const createService: RequestHandler = async (req, res) => {
  const data = {
    ...validateServiceInput(req.body),
    ...uploadedImageData(req.file),
  };
  const service = await prisma.service.create({
    data: data as any,
    select: serviceListSelect,
  });

  res.status(201).json({
    status: 'success',
    message: 'Service created successfully.',
    data: { service: serializeService(req, service) },
  });
};

export const updateService: RequestHandler = async (req, res) => {
  const serviceId = String(req.params.id);
  const currentService = await prisma.service.findFirst({
    where: {
      OR: [{ id: serviceId }, { slug: serviceId }],
    },
    select: { id: true },
  });

  if (!currentService) {
    throw new AppError(404, 'Service not found.');
  }

  const data = {
    ...validateServiceInput(req.body, { partial: true }),
    ...uploadedImageData(req.file),
  };

  if (Object.keys(data).length === 0) {
    throw new AppError(400, 'Provide at least one service field or an image to update.');
  }

  const service = await prisma.service.update({
    where: { id: currentService.id },
    data: data as any,
    select: serviceListSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully.',
    data: { service: serializeService(req, service) },
  });
};

export const deleteServiceImage: RequestHandler = async (req, res) => {
  const serviceId = String(req.params.id);
  const currentService = await prisma.service.findFirst({
    where: {
      OR: [{ id: serviceId }, { slug: serviceId }],
    },
    select: { id: true },
  });

  if (!currentService) {
    throw new AppError(404, 'Service not found.');
  }

  const service = await prisma.service.update({
    where: { id: currentService.id },
    data: {
      imageData: null,
      imageMimeType: null,
      imageFileName: null,
    },
    select: serviceListSelect,
  });

  res.status(200).json({
    status: 'success',
    message: 'Service image removed successfully.',
    data: { service: serializeService(req, service) },
  });
};
