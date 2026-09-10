import type { Request, Response, RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard,
  toggleCardActive,
  saveCardImage,
  getCardImageFile,
} from './know-more.store.js';
import type { ServiceCategory, CreateKnowMoreCardInput, UpdateKnowMoreCardInput } from './know-more.types.js';

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

// Public: Get all active Know More cards
export const getPublicKnowMoreCards: RequestHandler = (req, res) => {
  const serviceSlug = req.query.service ? String(req.query.service).toLowerCase() : undefined;
  const activeOnly = req.query.activeOnly !== 'false';
  const apiBase = getApiBase(req);

  const cards = getAllCards({ serviceSlug, activeOnly }).map(c => ({
    ...c,
    images: resolveImages(c.images, apiBase),
  }));

  res.status(200).json({
    status: 'success',
    count: cards.length,
    data: cards,
  });
};

// Public: Get single card by ID
export const getPublicKnowMoreCardById: RequestHandler = (req, res) => {
  const id = String(req.params.id || '');
  const card = getCardById(id);
  if (!card) {
    throw new AppError(404, `Know More card '${id}' not found.`);
  }

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    data: {
      ...card,
      images: resolveImages(card.images, apiBase),
    },
  });
};

// Public: Serve uploaded image
export const getKnowMoreImage: RequestHandler = (req, res) => {
  const filename = String(req.params.filename || '');
  const image = getCardImageFile(filename);
  if (!image) {
    throw new AppError(404, 'Know More image not found.');
  }

  res.set({
    'Content-Type': image.mimeType,
    'Content-Length': String(image.buffer.length),
    'Cache-Control': 'public, max-age=86400',
  });
  res.status(200).send(image.buffer);
};

// Admin: List all cards (including drafts)
export const adminListKnowMoreCards: RequestHandler = (req, res) => {
  const serviceSlug = req.query.service ? String(req.query.service).toLowerCase() : undefined;
  const apiBase = getApiBase(req);

  const cards = getAllCards({ serviceSlug, activeOnly: false }).map(c => ({
    ...c,
    images: resolveImages(c.images, apiBase),
  }));

  res.status(200).json({
    status: 'success',
    count: cards.length,
    data: cards,
  });
};

// Admin: Get single card
export const adminGetKnowMoreCard: RequestHandler = (req, res) => {
  const id = String(req.params.id || '');
  const card = getCardById(id);
  if (!card) {
    throw new AppError(404, `Know More card '${id}' not found.`);
  }

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    data: {
      ...card,
      images: resolveImages(card.images, apiBase),
    },
  });
};

// Admin: Create card
export const adminCreateKnowMoreCard: RequestHandler = (req, res) => {
  const { serviceSlug, heading, description, images, ctaText, ctaLink, badge, order, isActive } = req.body;

  if (!heading || typeof heading !== 'string' || !heading.trim()) {
    throw new AppError(400, 'Heading is required for Know More card.');
  }

  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new AppError(400, 'Description is required for Know More card.');
  }

  let imagesArray: string[] = [];
  if (Array.isArray(images)) {
    imagesArray = images.map(img => String(img).trim()).filter(Boolean);
  } else if (typeof images === 'string' && images.trim()) {
    imagesArray = [images.trim()];
  }

  const input: CreateKnowMoreCardInput = {
    serviceSlug: (serviceSlug || 'courier-delivery') as ServiceCategory,
    heading,
    description,
    images: imagesArray,
    ctaText,
    ctaLink,
    badge,
    order: order !== undefined && !isNaN(Number(order)) ? Number(order) : undefined,
    isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : true,
  };

  const created = createCard(input);
  const apiBase = getApiBase(req);

  res.status(201).json({
    status: 'success',
    message: 'Know More card created successfully.',
    data: {
      ...created,
      images: resolveImages(created.images, apiBase),
    },
  });
};

// Admin: Update card
export const adminUpdateKnowMoreCard: RequestHandler = (req, res) => {
  const id = String(req.params.id || '');
  const { serviceSlug, heading, description, images, ctaText, ctaLink, badge, order, isActive } = req.body;

  const existing = getCardById(id);
  if (!existing) {
    throw new AppError(404, `Know More card '${id}' not found.`);
  }

  let imagesArray: string[] | undefined = undefined;
  if (images !== undefined) {
    if (Array.isArray(images)) {
      imagesArray = images.map(img => String(img).trim()).filter(Boolean);
    } else if (typeof images === 'string') {
      imagesArray = images.trim() ? [images.trim()] : [];
    }
  }

  const input: UpdateKnowMoreCardInput = {
    serviceSlug,
    heading,
    description,
    images: imagesArray,
    ctaText,
    ctaLink,
    badge,
    order: order !== undefined && !isNaN(Number(order)) ? Number(order) : undefined,
    isActive: isActive !== undefined ? (isActive === true || isActive === 'true') : undefined,
  };

  const updated = updateCard(id, input);
  if (!updated) {
    throw new AppError(404, `Know More card '${id}' could not be updated.`);
  }

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    message: 'Know More card updated successfully.',
    data: {
      ...updated,
      images: resolveImages(updated.images, apiBase),
    },
  });
};

// Admin: Delete card
export const adminDeleteKnowMoreCard: RequestHandler = (req, res) => {
  const id = String(req.params.id || '');
  const deleted = deleteCard(id);
  if (!deleted) {
    throw new AppError(404, `Know More card '${id}' not found.`);
  }

  res.status(200).json({
    status: 'success',
    message: `Know More card '${id}' deleted successfully.`,
    data: { id },
  });
};

// Admin: Toggle active status
export const adminToggleKnowMoreCard: RequestHandler = (req, res) => {
  const id = String(req.params.id || '');
  const toggled = toggleCardActive(id);
  if (!toggled) {
    throw new AppError(404, `Know More card '${id}' not found.`);
  }

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    message: `Know More card '${id}' is now ${toggled.isActive ? 'Active' : 'Inactive'}.`,
    data: {
      ...toggled,
      images: resolveImages(toggled.images, apiBase),
    },
  });
};

// Admin: Upload image
export const adminUploadKnowMoreImage: RequestHandler = (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please select an image file to upload.');
  }

  const filename = saveCardImage(req.file.buffer, req.file.mimetype, req.file.originalname);
  const apiBase = getApiBase(req);
  const imageUrl = `${apiBase}/know-more/images/${filename}`;

  res.status(201).json({
    status: 'success',
    message: 'Image uploaded successfully.',
    data: {
      filename,
      imageUrl,
    },
  });
};
