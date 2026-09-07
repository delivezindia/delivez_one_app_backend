import { randomUUID } from 'node:crypto';
import type { Request } from 'express';
import { env } from '../../config/env.js';

export interface StoredReturnDocument {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  buffer: Buffer;
  uploadedAt: string;
  bookingId?: string | null;
  userId?: string | null;
}

export interface ReturnDocumentResponse {
  id: string;
  documentType: string;
  title: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  previewUrl: string;
  uploadedAt: string;
  bookingId?: string | null;
}

const DOCUMENT_TITLES: Record<string, string> = {
  INVOICE_ORDER_PROOF: 'Invoice / Order Proof',
  RETURN_AUTHORIZATION: 'Return Authorization',
  REPAIR_RECEIPT: 'Repair Receipt / Job Card',
  WARRANTY_DOC: 'Warranty Document',
  QR_BARCODE: 'QR Code / Barcode',
  PICKUP_AUTH: 'Pickup Authorization Letter',
  ITEM_PHOTO: 'Item Photo',
  DAMAGE_PROOF: 'Damage / Condition Proof',
  OTHER: 'Supporting Document',
};

// Global in-memory storage for document binaries during runtime
const documentRegistry = new Map<string, StoredReturnDocument>();

export const getApiBaseUrl = (req?: Request): string => {
  if (env.PUBLIC_API_BASE_URL) {
    return env.PUBLIC_API_BASE_URL.replace(/\/+$/, '');
  }
  if (req) {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:4000';
    return `${protocol}://${host}/api/v1`;
  }
  return 'http://localhost:4000/api/v1';
};

export const sanitizeFileName = (originalName?: string): string => {
  if (!originalName) return `document_${Date.now()}`;
  return originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 180);
};

export const formatDocumentResponse = (
  req: Request | undefined,
  doc: {
    id: string;
    documentType?: string;
    title?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    uploadedAt?: string;
    bookingId?: string | null;
    fileUrl?: string;
  },
): ReturnDocumentResponse => {
  const baseUrl = getApiBaseUrl(req);
  const docType = doc.documentType || 'OTHER';
  const title = doc.title || DOCUMENT_TITLES[docType] || 'Supporting Document';
  const fileUrl = doc.fileUrl || `${baseUrl}/return-pickup/documents/${doc.id}`;

  return {
    id: doc.id,
    documentType: docType,
    title,
    fileName: doc.fileName || `${doc.id}`,
    fileSize: doc.fileSize || 0,
    mimeType: doc.mimeType || 'application/octet-stream',
    fileUrl,
    previewUrl: fileUrl,
    uploadedAt: doc.uploadedAt || new Date().toISOString(),
    bookingId: doc.bookingId || null,
  };
};

export const storeReturnDocument = (
  file: Express.Multer.File,
  options: {
    documentType?: string;
    title?: string;
    bookingId?: string | null;
    userId?: string | null;
  } = {},
): StoredReturnDocument => {
  const id = `doc_${randomUUID().replace(/-/g, '').slice(0, 14)}`;
  const documentType = options.documentType || 'INVOICE_ORDER_PROOF';
  const title = options.title || DOCUMENT_TITLES[documentType] || 'Supporting Document';
  const fileName = sanitizeFileName(file.originalname);
  const uploadedAt = new Date().toISOString();

  const record: StoredReturnDocument = {
    id,
    documentType,
    title,
    fileName,
    fileSize: file.size || file.buffer.length,
    mimeType: file.mimetype || 'application/octet-stream',
    buffer: Buffer.from(file.buffer),
    uploadedAt,
    bookingId: options.bookingId || null,
    userId: options.userId || null,
  };

  documentRegistry.set(id, record);
  return record;
};

export const getReturnDocument = (id: string): StoredReturnDocument | undefined => {
  return documentRegistry.get(id);
};

export const deleteReturnDocument = (id: string): boolean => {
  return documentRegistry.delete(id);
};

export const listDocumentsByBookingId = (bookingId: string): StoredReturnDocument[] => {
  const list: StoredReturnDocument[] = [];
  for (const doc of documentRegistry.values()) {
    if (doc.bookingId === bookingId) {
      list.push(doc);
    }
  }
  return list;
};
