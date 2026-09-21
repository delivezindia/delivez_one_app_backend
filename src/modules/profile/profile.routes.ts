import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  updateNotifications,
  updatePreferences,
  addWalletMoney,
} from './profile.controller.js';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads/avatars'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed.'));
    }
  },
});

export const profileRouter = Router();

profileRouter.use(authenticate);

profileRouter.get('/', getProfile);
profileRouter.put('/', updateProfile);
profileRouter.post('/avatar', upload.single('avatar'), uploadAvatar);
profileRouter.delete('/avatar', removeAvatar);
profileRouter.post('/change-password', changePassword);
profileRouter.patch('/notifications', updateNotifications);
profileRouter.patch('/preferences', updatePreferences);
profileRouter.post('/wallet/add', addWalletMoney);
