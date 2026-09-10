import type { Request, Response, RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import {
  getAllServiceSliders,
  getServiceSliderBySlug,
  updateServiceSlider,
  saveUploadedImageFile,
  getSliderImageFile,
} from './service-sliders.store.js';

function getApiBase(req: Request): string {
  const host = req.get('host') || 'localhost:4000';
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}/api/v1`;
}

function resolveImages(images: string[], apiBase: string): string[] {
  return images.map(img => {
    if (img.startsWith('/')) {
      return `${apiBase}${img.startsWith('/api/v1') ? img.replace('/api/v1', '') : img}`;
    }
    return img;
  });
}

// Public: Get all service sliders (1 slider per service, multiple images)
export const getPublicServiceSliders: RequestHandler = (req, res) => {
  const serviceSlug = req.query.service ? String(req.query.service).toLowerCase() : undefined;
  const apiBase = getApiBase(req);

  if (serviceSlug && serviceSlug !== 'all') {
    const slider = getServiceSliderBySlug(serviceSlug);
    if (!slider) {
      throw new AppError(404, `Service slider for '${serviceSlug}' not found.`);
    }
    res.status(200).json({
      status: 'success',
      data: {
        ...slider,
        images: resolveImages(slider.images, apiBase),
      },
    });
    return;
  }

  const sliders = getAllServiceSliders().map(s => ({
    ...s,
    images: resolveImages(s.images, apiBase),
  }));

  res.status(200).json({
    status: 'success',
    count: sliders.length,
    data: sliders,
  });
};

// Public: Get single service slider by slug
export const getServiceSliderBySlugHandler: RequestHandler = (req, res) => {
  const serviceSlug = String(req.params.serviceSlug || '').toLowerCase();
  const apiBase = getApiBase(req);

  const slider = getServiceSliderBySlug(serviceSlug);
  if (!slider) {
    throw new AppError(404, `Service slider for '${serviceSlug}' not found.`);
  }

  res.status(200).json({
    status: 'success',
    service: serviceSlug,
    data: {
      ...slider,
      images: resolveImages(slider.images, apiBase),
    },
  });
};

// Public: Serve uploaded image
export const getSliderImage: RequestHandler = (req, res) => {
  const filename = String(req.params.filename || '');
  const image = getSliderImageFile(filename);
  if (!image) {
    throw new AppError(404, 'Slider image not found.');
  }

  res.set({
    'Content-Type': image.mimeType,
    'Content-Length': String(image.buffer.length),
    'Cache-Control': 'public, max-age=86400',
  });
  res.status(200).send(image.buffer);
};

// Admin: List all service sliders
export const adminListServiceSliders: RequestHandler = (req, res) => {
  const apiBase = getApiBase(req);
  const sliders = getAllServiceSliders().map(s => ({
    ...s,
    images: resolveImages(s.images, apiBase),
  }));

  res.status(200).json({
    status: 'success',
    count: sliders.length,
    data: sliders,
  });
};

// Admin: Update service slider images
export const adminUpdateServiceSlider: RequestHandler = (req, res) => {
  const serviceSlug = String(req.params.serviceSlug || '').toLowerCase();
  const { images, isActive } = req.body;

  let imagesArray: string[] | undefined = undefined;
  if (images !== undefined) {
    if (Array.isArray(images)) {
      imagesArray = images.map(img => String(img).trim()).filter(Boolean);
    } else if (typeof images === 'string') {
      imagesArray = images.trim() ? [images.trim()] : [];
    }
  }

  const updated = updateServiceSlider(serviceSlug, {
    images: imagesArray,
    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
  });

  if (!updated) {
    throw new AppError(404, `Service slider '${serviceSlug}' not found.`);
  }

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    message: `Image slider for '${updated.serviceName}' updated successfully.`,
    data: {
      ...updated,
      images: resolveImages(updated.images, apiBase),
    },
  });
};

// Admin: Upload image for service slider
export const adminUploadServiceSliderImage: RequestHandler = (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please select an image file to upload.');
  }

  const filename = saveUploadedImageFile(req.file.buffer, req.file.mimetype, req.file.originalname);
  const apiBase = getApiBase(req);
  const imageUrl = `${apiBase}/services/sliders/images/${filename}`;

  res.status(201).json({
    status: 'success',
    message: 'Image uploaded successfully.',
    data: {
      filename,
      imageUrl,
    },
  });
};
