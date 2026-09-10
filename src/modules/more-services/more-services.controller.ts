import type { Request, RequestHandler, Response } from 'express';
import { MoreServicesStore } from './more-services.store.js';
import { AppError } from '../../lib/app-error.js';

export const listMoreServicesHandler: RequestHandler = async (req: Request, res: Response) => {
  const includeInactive = req.query.all === 'true' || req.query.includeInactive === 'true';
  const data = await MoreServicesStore.getAll(includeInactive);
  res.status(200).json({
    status: 'success',
    count: data.length,
    data
  });
};

export const getMoreServiceBySlugHandler: RequestHandler = async (req: Request, res: Response) => {
  const slug = String(req.params.slug || req.params.id);
  const service = await MoreServicesStore.getBySlug(slug);
  if (!service) {
    throw new AppError(404, `Service app '${slug}' not found.`);
  }
  res.status(200).json({
    status: 'success',
    data: service
  });
};

export const adminListMoreServicesHandler: RequestHandler = async (_req: Request, res: Response) => {
  const data = await MoreServicesStore.getAll(true);
  res.status(200).json({
    status: 'success',
    count: data.length,
    data
  });
};

export const adminCreateMoreServiceHandler: RequestHandler = async (req: Request, res: Response) => {
  const { appName, description } = req.body || {};
  if (!appName || typeof appName !== 'string' || !appName.trim()) {
    throw new AppError(400, 'App name is required.');
  }
  if (!description || typeof description !== 'string' || !description.trim()) {
    throw new AppError(400, 'App description is required.');
  }

  const created = await MoreServicesStore.create(req.body);
  res.status(201).json({
    status: 'success',
    message: 'More service created successfully.',
    data: created
  });
};

export const adminUpdateMoreServiceHandler: RequestHandler = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = await MoreServicesStore.update(id, req.body || {});
  if (!updated) {
    throw new AppError(404, `More service '${id}' not found.`);
  }
  res.status(200).json({
    status: 'success',
    message: 'More service updated successfully.',
    data: updated
  });
};

export const adminDeleteMoreServiceHandler: RequestHandler = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const deleted = await MoreServicesStore.delete(id);
  if (!deleted) {
    throw new AppError(404, `More service '${id}' not found.`);
  }
  res.status(200).json({
    status: 'success',
    message: 'More service deleted successfully.'
  });
};

export const adminReorderMoreServicesHandler: RequestHandler = async (req: Request, res: Response) => {
  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError(400, 'ids array is required to reorder.');
  }
  const data = await MoreServicesStore.reorder(ids);
  res.status(200).json({
    status: 'success',
    message: 'More services reordered successfully.',
    count: data.length,
    data
  });
};
