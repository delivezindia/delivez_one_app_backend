import type { RequestHandler } from 'express';

export interface PlatformOperationalSettings {
  emergencyDispatchPaused: boolean;
  surgeMultiplier: number;
  autoAssignRiders: boolean;
  maintenanceMode: boolean;
  maintenanceBanner: string;
  maxActivePerRider: number;
  payoutCommissionPercent: number;
  contactHelpline: string;
  updatedAt: string;
  updatedBy: string;
}

let platformSettings: PlatformOperationalSettings = {
  emergencyDispatchPaused: false,
  surgeMultiplier: 1.0,
  autoAssignRiders: true,
  maintenanceMode: false,
  maintenanceBanner: 'Operational Notice: Express delivery network running at 100% capacity.',
  maxActivePerRider: 3,
  payoutCommissionPercent: 20.0,
  contactHelpline: '+91 1800-DELIVEZ-SOS',
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Superadmin',
};

export const getPlatformSettings: RequestHandler = (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: platformSettings,
  });
};

export const updatePlatformSettings: RequestHandler = (req, res) => {
  const {
    emergencyDispatchPaused,
    surgeMultiplier,
    autoAssignRiders,
    maintenanceMode,
    maintenanceBanner,
    maxActivePerRider,
    payoutCommissionPercent,
    contactHelpline,
  } = req.body;

  platformSettings = {
    ...platformSettings,
    ...(typeof emergencyDispatchPaused === 'boolean' ? { emergencyDispatchPaused } : {}),
    ...(typeof surgeMultiplier === 'number' ? { surgeMultiplier: Math.max(1.0, Math.min(3.0, surgeMultiplier)) } : {}),
    ...(typeof autoAssignRiders === 'boolean' ? { autoAssignRiders } : {}),
    ...(typeof maintenanceMode === 'boolean' ? { maintenanceMode } : {}),
    ...(typeof maintenanceBanner === 'string' ? { maintenanceBanner } : {}),
    ...(typeof maxActivePerRider === 'number' ? { maxActivePerRider: Math.max(1, maxActivePerRider) } : {}),
    ...(typeof payoutCommissionPercent === 'number' ? { payoutCommissionPercent } : {}),
    ...(typeof contactHelpline === 'string' ? { contactHelpline } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: (req as any).user?.fullName || 'Admin User',
  };

  res.status(200).json({
    status: 'success',
    message: 'Platform operational settings updated successfully.',
    data: platformSettings,
  });
};
