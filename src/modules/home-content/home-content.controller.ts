import { detectLocationFromIp, resolveUserLocation, reverseGeocodeCoords } from './location.service.js';
import type { LocationBarData } from './home-content.types.js';
import type { Request, RequestHandler, Response } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/app-error.js';
import { prisma } from '../../lib/prisma.js';
import {
  getDefaultRobotSvg,
  getHeroImageFile,
  getHomeStore,
  getQuickActionImageFile,
  removeHeroImage,
  removeQuickActionImage,
  saveHeroImage,
  saveHomeStore,
  saveQuickActionImage,
} from './home-content.store.js';

const getApiBase = (req: Request): string => {
  return env.PUBLIC_API_BASE_URL || `${req.protocol}://${req.get('host')}/api/v1`;
};

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================

export const getHomeAll: RequestHandler = async (req, res) => {
  const store = getHomeStore();
  const apiBase = getApiBase(req);

  // Auto-detect current user location (GPS query, IP, or saved user address)
  let locationData: LocationBarData | null = null;
  const userId = (req as any).user?.id;
  if (userId) {
    try {
      const userAddr = await prisma.userAddress.findFirst({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (userAddr) {
        locationData = {
          label: userAddr.label || 'Home',
          addressLine: `${userAddr.addressLine1}${userAddr.addressLine2 ? ', ' + userAddr.addressLine2 : ''}, ${userAddr.city}`,
          city: userAddr.city,
          state: userAddr.state,
          postalCode: userAddr.postalCode,
          latitude: userAddr.latitude ? Number(userAddr.latitude) : 12.9716,
          longitude: userAddr.longitude ? Number(userAddr.longitude) : 77.5946,
          isServiceable: true,
        };
      }
    } catch {
      // Ignore
    }
  }

  if (!locationData) {
    locationData = await resolveUserLocation(req);
  }

  // Build hero with image URL
  const heroVersion = store.hero.sideImageUpdatedAt ? new Date(store.hero.sideImageUpdatedAt).getTime() : 1;
  const hero = {
    ...store.hero,
    sideImageUrl: `${apiBase}/home/hero/image?v=${heroVersion}`,
  };

  // Build quick actions with image URLs
  const quickActions = store.quickActions
    .filter((q) => q.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((q) => ({
      ...q,
      imageUrl: q.hasCustomImage ? `${apiBase}/home/quick-actions/${q.id}/image?v=${q.imageUpdatedAt ? new Date(q.imageUpdatedAt).getTime() : 1}` : null,
    }));

  res.status(200).json({
    status: 'success',
    data: {
      location: {
        current: locationData,
        presets: store.location.presets,
      },
      hero,
      quickActions,
      banner: store.banner,
      chips: store.chips.filter((c) => c.isActive),
      support: {
        helpline: store.support.helpline,
        whatsapp: store.support.whatsapp,
        email: store.support.email,
        operatingHours: store.support.operatingHours,
      },
    },
  });
};

export const getCurrentLocation: RequestHandler = async (req, res) => {
  const store = getHomeStore();
  let locationData: LocationBarData | null = null;

  const userId = (req as any).user?.id;
  if (userId) {
    try {
      const userAddr = await prisma.userAddress.findFirst({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (userAddr) {
        locationData = {
          label: userAddr.label || 'Home',
          addressLine: `${userAddr.addressLine1}${userAddr.addressLine2 ? ', ' + userAddr.addressLine2 : ''}, ${userAddr.city}`,
          city: userAddr.city,
          state: userAddr.state,
          postalCode: userAddr.postalCode,
          latitude: userAddr.latitude ? Number(userAddr.latitude) : 12.9716,
          longitude: userAddr.longitude ? Number(userAddr.longitude) : 77.5946,
          isServiceable: true,
        };
      }
    } catch {
      // Ignore
    }
  }

  if (!locationData) {
    locationData = await resolveUserLocation(req);
  }

  res.status(200).json({
    status: 'success',
    data: {
      location: locationData,
      presets: store.location.presets,
    },
  });
};

export const detectLocation: RequestHandler = async (req, res) => {
  const latStr = req.query.lat ?? (req.body && req.body.latitude);
  const lngStr = req.query.lng ?? (req.body && req.body.longitude);
  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (!Number.isNaN(lat) && !Number.isNaN(lng) && lat !== 0 && lng !== 0) {
    const geo = await reverseGeocodeCoords(lat, lng);
    if (geo) {
      return res.status(200).json({
        status: 'success',
        data: {
          location: geo,
          isDetected: true,
          source: 'gps',
        },
      });
    }
  }

  const detected = await resolveUserLocation(req);
  res.status(200).json({
    status: 'success',
    data: {
      location: detected,
      isDetected: true,
      source: 'auto',
    },
  });
};

export const getLocationPresets: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: { presets: store.location.presets },
  });
};

export const getHero: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const apiBase = getApiBase(req);
  const heroVersion = store.hero.sideImageUpdatedAt ? new Date(store.hero.sideImageUpdatedAt).getTime() : 1;

  res.status(200).json({
    status: 'success',
    data: {
      hero: {
        ...store.hero,
        sideImageUrl: `${apiBase}/home/hero/image?v=${heroVersion}`,
      },
    },
  });
};

export const getHeroImage: RequestHandler = (_req, res) => {
  const custom = getHeroImageFile();

  if (custom) {
    res.set({
      'Content-Type': custom.mimeType,
      'Content-Length': String(custom.buffer.length),
      'Cache-Control': 'public, max-age=86400',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });
    return res.status(200).send(custom.buffer);
  }

  // Default Golden Robot Mascot SVG
  const defaultSvg = getDefaultRobotSvg();
  res.set({
    'Content-Type': 'image/svg+xml',
    'Content-Length': String(defaultSvg.length),
    'Cache-Control': 'public, max-age=86400',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  return res.status(200).send(defaultSvg);
};

export const getQuickActions: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const apiBase = getApiBase(req);

  const quickActions = store.quickActions
    .filter((q) => q.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((q) => ({
      ...q,
      imageUrl: q.hasCustomImage ? `${apiBase}/home/quick-actions/${q.id}/image?v=${q.imageUpdatedAt ? new Date(q.imageUpdatedAt).getTime() : 1}` : null,
    }));

  res.status(200).json({
    status: 'success',
    data: { quickActions },
  });
};

export const getQuickActionImage: RequestHandler = (req, res) => {
  const actionId = String(req.params.id);
  const image = getQuickActionImageFile(actionId);

  if (!image) {
    throw new AppError(404, 'Quick action image not found.');
  }

  res.set({
    'Content-Type': image.mimeType,
    'Content-Length': String(image.buffer.length),
    'Cache-Control': 'public, max-age=86400',
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  return res.status(200).send(image.buffer);
};

export const getPromoBanner: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: { banner: store.banner },
  });
};

export const getActionChips: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: { chips: store.chips.filter((c) => c.isActive) },
  });
};

export const checkPincode: RequestHandler = (req, res) => {
  const pincode = String(req.params.pincode || req.query.pincode || '').trim();
  if (!pincode || !/^\d{6}$/.test(pincode)) {
    throw new AppError(400, 'Please provide a valid 6-digit postal pincode.');
  }

  const store = getHomeStore();
  const found = store.pincodes.find((p) => p.pincode === pincode);

  if (found) {
    return res.status(200).json({
      status: 'success',
      data: found,
    });
  }

  // Dynamic fallback for any valid Indian pincode
  const fallback = {
    pincode,
    city: 'Covered Delivery Zone',
    state: 'India',
    isServiceable: true,
    estimatedDelivery: 'Standard (1-2 Days)',
    availableServices: ['courier-delivery', 'luggage-delivery', 'confidential-delivery', 'return-pickup', 'know-more'],
    codAvailable: true,
  };

  res.status(200).json({
    status: 'success',
    data: fallback,
  });
};

export const getSupportConfig: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: store.support,
  });
};

export const submitSupportInquiry: RequestHandler = (req, res) => {
  const { name, mobileNumber, email, subject, message } = req.body;
  if (!message || message.trim().length < 5) {
    throw new AppError(400, 'Please provide an inquiry message of at least 5 characters.');
  }

  res.status(201).json({
    status: 'success',
    message: 'Your inquiry has been submitted. Our support team will contact you shortly.',
    data: {
      ticketNumber: `TKT-${Date.now().toString().slice(-6)}`,
      name: name || 'Customer',
      mobileNumber: mobileNumber || 'N/A',
      email: email || 'N/A',
      subject: subject || 'General Assistance',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    },
  });
};

// ==========================================
// ADMIN ENDPOINTS (Manageable by Admin)
// ==========================================

export const adminGetHero: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    data: {
      hero: {
        ...store.hero,
        sideImageUrl: `${apiBase}/home/hero/image?v=${Date.now()}`,
      },
    },
  });
};

export const adminUpdateHero: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const {
    greetingPrefix,
    defaultName,
    greetingEmoji,
    headline,
    highlightWord,
    subtitle,
    searchTitle,
    searchPlaceholder,
    micEnabled,
  } = req.body;

  if (greetingPrefix !== undefined) store.hero.greetingPrefix = String(greetingPrefix);
  if (defaultName !== undefined) store.hero.defaultName = String(defaultName);
  if (greetingEmoji !== undefined) store.hero.greetingEmoji = String(greetingEmoji);
  if (headline !== undefined) store.hero.headline = String(headline);
  if (highlightWord !== undefined) store.hero.highlightWord = String(highlightWord);
  if (subtitle !== undefined) store.hero.subtitle = String(subtitle);
  if (searchTitle !== undefined) store.hero.searchTitle = String(searchTitle);
  if (searchPlaceholder !== undefined) store.hero.searchPlaceholder = String(searchPlaceholder);
  if (micEnabled !== undefined) store.hero.micEnabled = Boolean(micEnabled);

  saveHomeStore();

  const apiBase = getApiBase(req);
  res.status(200).json({
    status: 'success',
    message: 'Hero section updated successfully.',
    data: {
      hero: {
        ...store.hero,
        sideImageUrl: `${apiBase}/home/hero/image?v=${Date.now()}`,
      },
    },
  });
};

export const adminUploadHeroImage: RequestHandler = (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please upload an image file (PNG, JPG, WEBP, or GIF).');
  }

  saveHeroImage(req.file.buffer, req.file.mimetype, req.file.originalname);
  const store = getHomeStore();
  const apiBase = getApiBase(req);

  res.status(200).json({
    status: 'success',
    message: 'Hero side image uploaded successfully.',
    data: {
      hero: {
        ...store.hero,
        sideImageUrl: `${apiBase}/home/hero/image?v=${Date.now()}`,
      },
    },
  });
};

export const adminDeleteHeroImage: RequestHandler = (req, res) => {
  removeHeroImage();
  const store = getHomeStore();
  const apiBase = getApiBase(req);

  res.status(200).json({
    status: 'success',
    message: 'Hero custom image removed. Reset to default mascot.',
    data: {
      hero: {
        ...store.hero,
        sideImageUrl: `${apiBase}/home/hero/image?v=${Date.now()}`,
      },
    },
  });
};

export const adminListQuickActions: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const apiBase = getApiBase(req);

  const quickActions = store.quickActions.map((q) => ({
    ...q,
    imageUrl: q.hasCustomImage ? `${apiBase}/home/quick-actions/${q.id}/image?v=${Date.now()}` : null,
  }));

  res.status(200).json({
    status: 'success',
    data: { quickActions },
  });
};

export const adminCreateQuickAction: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { title, subtitle, icon, actionType, actionTarget, badge, displayOrder } = req.body;

  if (!title || !subtitle) {
    throw new AppError(400, 'Title and subtitle are required.');
  }

  const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `action-${Date.now()}`;
  const newItem = {
    id,
    title,
    subtitle,
    icon: icon || 'box',
    actionType: actionType || 'ROUTE',
    actionTarget: actionTarget || '/services',
    badge: badge || null,
    displayOrder: typeof displayOrder === 'number' ? displayOrder : store.quickActions.length + 1,
    isActive: true,
    hasCustomImage: false,
    imageUrl: null,
  };

  store.quickActions.push(newItem);
  saveHomeStore();

  res.status(201).json({
    status: 'success',
    message: 'Quick action created successfully.',
    data: { quickAction: newItem },
  });
};

export const adminUpdateQuickAction: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const actionId = String(req.params.id);
  const item = store.quickActions.find((q) => q.id === actionId);

  if (!item) {
    throw new AppError(404, 'Quick action not found.');
  }

  const { title, subtitle, icon, actionType, actionTarget, badge, displayOrder, isActive } = req.body;
  if (title !== undefined) item.title = String(title);
  if (subtitle !== undefined) item.subtitle = String(subtitle);
  if (icon !== undefined) item.icon = String(icon);
  if (actionType !== undefined) item.actionType = actionType;
  if (actionTarget !== undefined) item.actionTarget = String(actionTarget);
  if (badge !== undefined) item.badge = badge ? String(badge) : null;
  if (displayOrder !== undefined) item.displayOrder = Number(displayOrder);
  if (isActive !== undefined) item.isActive = Boolean(isActive);

  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: 'Quick action updated successfully.',
    data: { quickAction: item },
  });
};

export const adminUploadQuickActionImage: RequestHandler = (req, res) => {
  const actionId = String(req.params.id);
  const store = getHomeStore();
  const item = store.quickActions.find((q) => q.id === actionId);

  if (!item) {
    throw new AppError(404, 'Quick action not found.');
  }
  if (!req.file) {
    throw new AppError(400, 'Please upload an image file.');
  }

  saveQuickActionImage(actionId, req.file.buffer, req.file.mimetype, req.file.originalname);
  const apiBase = getApiBase(req);

  res.status(200).json({
    status: 'success',
    message: `Image uploaded for '${item.title}'.`,
    data: {
      quickAction: {
        ...item,
        imageUrl: `${apiBase}/home/quick-actions/${item.id}/image?v=${Date.now()}`,
      },
    },
  });
};

export const adminDeleteQuickActionImage: RequestHandler = (req, res) => {
  const actionId = String(req.params.id);
  removeQuickActionImage(actionId);
  const store = getHomeStore();
  const item = store.quickActions.find((q) => q.id === actionId);

  res.status(200).json({
    status: 'success',
    message: 'Quick action custom image removed.',
    data: { quickAction: item },
  });
};

export const adminDeleteQuickAction: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const actionId = String(req.params.id);
  const idx = store.quickActions.findIndex((q) => q.id === actionId);

  if (idx === -1) {
    throw new AppError(404, 'Quick action not found.');
  }

  store.quickActions.splice(idx, 1);
  removeQuickActionImage(actionId);
  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: 'Quick action deleted successfully.',
  });
};

export const adminUpdateBanner: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { title, subtitle, buttonText, buttonLink, backgroundColor, textColor, isActive } = req.body;

  if (title !== undefined) store.banner.title = String(title);
  if (subtitle !== undefined) store.banner.subtitle = String(subtitle);
  if (buttonText !== undefined) store.banner.buttonText = String(buttonText);
  if (buttonLink !== undefined) store.banner.buttonLink = String(buttonLink);
  if (backgroundColor !== undefined) store.banner.backgroundColor = String(backgroundColor);
  if (textColor !== undefined) store.banner.textColor = String(textColor);
  if (isActive !== undefined) store.banner.isActive = Boolean(isActive);

  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: 'Promo banner updated successfully.',
    data: { banner: store.banner },
  });
};

export const adminUpdateChips: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { chips } = req.body;

  if (Array.isArray(chips)) {
    store.chips = chips;
    saveHomeStore();
  }

  res.status(200).json({
    status: 'success',
    message: 'Action chips updated successfully.',
    data: { chips: store.chips },
  });
};

export const adminUpdateLocationConfig: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { current, presets } = req.body;

  if (current) {
    store.location.current = {
      ...store.location.current,
      ...current,
    };
  }
  if (Array.isArray(presets)) {
    store.location.presets = presets;
  }

  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: 'Location configuration updated successfully.',
    data: { location: store.location },
  });
};

export const adminListPincodes: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: {
      pincodes: store.pincodes,
      total: store.pincodes.length,
    },
  });
};

export const adminAddPincode: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { pincode, city, state, isServiceable, estimatedDelivery, availableServices, codAvailable } = req.body;

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    throw new AppError(400, 'Please provide a valid 6-digit postal pincode.');
  }

  const existingIdx = store.pincodes.findIndex((p) => p.pincode === pincode);
  const record = {
    pincode,
    city: city || 'Zone ' + pincode,
    state: state || 'India',
    isServiceable: isServiceable !== undefined ? Boolean(isServiceable) : true,
    estimatedDelivery: estimatedDelivery || 'Same Day / Next Day',
    availableServices: Array.isArray(availableServices) ? availableServices : ['courier-delivery', 'luggage-delivery', 'confidential-delivery'],
    codAvailable: codAvailable !== undefined ? Boolean(codAvailable) : true,
  };

  if (existingIdx !== -1) {
    store.pincodes[existingIdx] = record;
  } else {
    store.pincodes.push(record);
  }

  saveHomeStore();

  res.status(201).json({
    status: 'success',
    message: `Pincode ${pincode} configured successfully.`,
    data: { pincode: record },
  });
};

export const adminUpdatePincode: RequestHandler = (req, res) => {
  const pincodeParam = String(req.params.pincode);
  const store = getHomeStore();
  const item = store.pincodes.find((p) => p.pincode === pincodeParam);

  if (!item) {
    throw new AppError(404, 'Pincode not found.');
  }

  const { city, state, isServiceable, estimatedDelivery, availableServices, codAvailable } = req.body;
  if (city !== undefined) item.city = String(city);
  if (state !== undefined) item.state = String(state);
  if (isServiceable !== undefined) item.isServiceable = Boolean(isServiceable);
  if (estimatedDelivery !== undefined) item.estimatedDelivery = String(estimatedDelivery);
  if (Array.isArray(availableServices)) item.availableServices = availableServices;
  if (codAvailable !== undefined) item.codAvailable = Boolean(codAvailable);

  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: `Pincode ${pincodeParam} updated successfully.`,
    data: { pincode: item },
  });
};

export const adminDeletePincode: RequestHandler = (req, res) => {
  const pincodeParam = String(req.params.pincode);
  const store = getHomeStore();
  const idx = store.pincodes.findIndex((p) => p.pincode === pincodeParam);

  if (idx === -1) {
    throw new AppError(404, 'Pincode not found.');
  }

  store.pincodes.splice(idx, 1);
  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: `Pincode ${pincodeParam} deleted successfully.`,
  });
};

export const adminGetSupportConfig: RequestHandler = (_req, res) => {
  const store = getHomeStore();
  res.status(200).json({
    status: 'success',
    data: { support: store.support },
  });
};

export const adminUpdateSupportConfig: RequestHandler = (req, res) => {
  const store = getHomeStore();
  const { helpline, whatsapp, email, operatingHours, chatEnabled, faqs } = req.body;

  if (helpline !== undefined) store.support.helpline = String(helpline);
  if (whatsapp !== undefined) store.support.whatsapp = String(whatsapp);
  if (email !== undefined) store.support.email = String(email);
  if (operatingHours !== undefined) store.support.operatingHours = String(operatingHours);
  if (chatEnabled !== undefined) store.support.chatEnabled = Boolean(chatEnabled);
  if (Array.isArray(faqs)) store.support.faqs = faqs;

  saveHomeStore();

  res.status(200).json({
    status: 'success',
    message: 'Support configuration updated successfully.',
    data: { support: store.support },
  });
};
