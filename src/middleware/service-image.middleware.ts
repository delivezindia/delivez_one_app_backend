import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { AppError } from '../lib/app-error.js';

const detectImageType = (buffer: Buffer): string | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= pngSignature.length && buffer.subarray(0, pngSignature.length).equals(pngSignature)) {
    return 'image/png';
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  if (
    buffer.length >= 6 &&
    (buffer.subarray(0, 6).toString('ascii') === 'GIF87a' ||
      buffer.subarray(0, 6).toString('ascii') === 'GIF89a')
  ) {
    return 'image/gif';
  }

  return null;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB limit
});

export const uploadServiceImage = (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(
          new AppError({
            message: 'Service image must not exceed 10 MB.',
            statusCode: 400,
            code: 'FILE_TOO_LARGE',
          }),
        );
      }

      return next(
        error instanceof AppError
          ? error
          : new AppError({
              message: error.message || 'Service image upload failed.',
              statusCode: 400,
              code: 'UPLOAD_FAILED',
            }),
      );
    }

    if (req.file) {
      const detectedType = detectImageType(req.file.buffer);
      if (detectedType) {
        req.file.mimetype = detectedType;
      } else if (!req.file.mimetype.startsWith('image/')) {
        return next(
          new AppError({
            message: 'The uploaded file must be a valid JPG, PNG, WEBP, or GIF image.',
            statusCode: 400,
            code: 'INVALID_FILE_CONTENT',
          }),
        );
      }
    }

    return next();
  });
};
