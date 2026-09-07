import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';

export interface PromoCode {
  id: string;
  code: string;
  title: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  applicableService: string; // 'ALL' | 'gift-delivery' | 'personal-courier' | 'confidential-courier' | 'forgot-something' | 'return-pickup'
  usageLimit: number;
  timesUsed: number;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
}

const promosStore: PromoCode[] = [
  {
    id: 'prm-1',
    code: 'WELCOME50',
    title: 'First-time Customer Welcome Offer',
    discountType: 'PERCENTAGE',
    discountValue: 50,
    maxDiscount: 100,
    minOrderValue: 199,
    applicableService: 'ALL',
    usageLimit: 1000,
    timesUsed: 428,
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prm-2',
    code: 'FESTIVE20',
    title: 'Festive Season Express Discount',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 250,
    minOrderValue: 499,
    applicableService: 'gift-delivery',
    usageLimit: 500,
    timesUsed: 192,
    validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prm-3',
    code: 'RAINYFREESHIP',
    title: 'Monsoon Delivery Fee Subsidy',
    discountType: 'FLAT',
    discountValue: 49,
    minOrderValue: 299,
    applicableService: 'ALL',
    usageLimit: 2000,
    timesUsed: 840,
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prm-4',
    code: 'VAULTPROMO',
    title: 'High Security Transit Corporate Trial',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 300,
    minOrderValue: 799,
    applicableService: 'confidential-courier',
    usageLimit: 250,
    timesUsed: 48,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const listPromos: RequestHandler = (_req, res) => {
  const totalDiscountDisbursed = promosStore.reduce((acc, p) => acc + (p.timesUsed * (p.discountType === 'FLAT' ? p.discountValue : (p.maxDiscount || 50))), 0);
  const activeCount = promosStore.filter(p => p.isActive).length;
  const totalRedemptions = promosStore.reduce((acc, p) => acc + p.timesUsed, 0);

  res.status(200).json({
    status: 'success',
    data: {
      promos: promosStore,
      stats: {
        totalPromos: promosStore.length,
        activePromos: activeCount,
        totalRedemptions,
        totalSavingsDisbursed: totalDiscountDisbursed,
      },
    },
  });
};

export const createPromo: RequestHandler = (req, res) => {
  const {
    code,
    title,
    discountType,
    discountValue,
    maxDiscount,
    minOrderValue,
    applicableService,
    usageLimit,
    validUntil,
  } = req.body;

  if (!code || !title || !discountType || discountValue === undefined) {
    throw new AppError(400, 'Code, title, discountType and discountValue are required.');
  }

  const cleanCode = String(code).trim().toUpperCase();
  const existing = promosStore.find(p => p.code === cleanCode);
  if (existing) {
    throw new AppError(400, `Coupon code '${cleanCode}' already exists.`);
  }

  const newPromo: PromoCode = {
    id: `prm-${Date.now()}`,
    code: cleanCode,
    title: String(title).trim(),
    discountType: discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FLAT',
    discountValue: Number(discountValue),
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    minOrderValue: Number(minOrderValue || 0),
    applicableService: applicableService || 'ALL',
    usageLimit: Number(usageLimit || 500),
    timesUsed: 0,
    validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  promosStore.unshift(newPromo);

  res.status(201).json({
    status: 'success',
    message: `Promo code ${newPromo.code} created successfully.`,
    data: { promo: newPromo },
  });
};

export const togglePromoStatus: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const promo = promosStore.find(p => p.id === id || p.code === id);
  if (!promo) throw new AppError(404, 'Promo code not found.');

  promo.isActive = !promo.isActive;

  res.status(200).json({
    status: 'success',
    message: `Promo ${promo.code} is now ${promo.isActive ? 'ACTIVE' : 'PAUSED'}.`,
    data: { promo },
  });
};

export const deletePromo: RequestHandler = (req, res) => {
  const id = String(req.params.id);
  const idx = promosStore.findIndex(p => p.id === id || p.code === id);
  if (idx === -1) throw new AppError(404, 'Promo code not found.');

  promosStore.splice(idx, 1);

  res.status(200).json({
    status: 'success',
    message: 'Promo code removed successfully.',
  });
};
