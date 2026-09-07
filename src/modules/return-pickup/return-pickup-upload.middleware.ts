import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../../lib/app-error.js';

export const detectDocumentMimeType = (buffer: Buffer): string | null => {
  if (!buffer || buffer.length === 0) return null;

  // PDF: %PDF-
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]);
  if (
    buffer.length >= pdfSignature.length &&
    buffer.subarray(0, pdfSignature.length).equals(pdfSignature)
  ) {
    return 'application/pdf';
  }

  // JPEG: FF D8 FF
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (
    buffer.length >= pngSignature.length &&
    buffer.subarray(0, pngSignature.length).equals(pngSignature)
  ) {
    return 'image/png';
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a')
  ) {
    return 'image/gif';
  }

  return null;
};

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file
    files: 10,
  },
});

// Middleware for uploading a single document or multiple documents under various field names
export const uploadReturnDocument = (req: Request, res: Response, next: NextFunction) => {
  upload.any()(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(400, 'Uploaded file exceeds maximum allowed limit of 10 MB.'));
      }
      return next(
        error instanceof AppError
          ? error
          : new AppError(400, error.message || 'File upload failed.'),
      );
    }

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const detected = detectDocumentMimeType(file.buffer);
        if (detected) {
          file.mimetype = detected;
        } else if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
          return next(
            new AppError(
              400,
              `Unsupported file format for ${file.originalname}. Accepted formats: PDF, JPG, PNG, WEBP, GIF.`,
            ),
          );
        }
      }
      // If a single file was uploaded under any field, also populate req.file for convenience
      if (req.files.length > 0 && !req.file) {
        req.file = req.files[0];
      }
    }

    next();
  });
};
