import type { RequestHandler } from 'express';
import { AppError } from '../../lib/app-error.js';
import { recordAuditLog } from './admin-audit.controller.js';

export interface BroadcastAdvisory {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'EMERGENCY';
  targetCity: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
}

// In-memory persistent broadcast store with initial real-world logistics operational alerts
const broadcastStore: BroadcastAdvisory[] = [
  {
    id: 'BC-1092',
    title: 'Monsoon Advisory: Rain Surcharge & Extra Buffer',
    message: 'Intermittent heavy rain reported in Bengaluru South & East. Expect an additional 10-15 mins delivery buffer on two-wheeler courier routes.',
    severity: 'WARNING',
    targetCity: 'BENGALURU',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdBy: 'System Operations Center',
  },
  {
    id: 'BC-1088',
    title: 'Delivez Express Night Slot Active',
    message: 'Midnight Celebration & Cake deliveries operating normally across all primary NCR & Bangalore pin codes.',
    severity: 'INFO',
    targetCity: 'ALL',
    isActive: true,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdBy: 'Fleet Control Team',
  },
];

export const listBroadcasts: RequestHandler = async (_req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      broadcasts: broadcastStore,
      total: broadcastStore.length,
      activeCount: broadcastStore.filter(b => b.isActive).length,
    },
  });
};

export const createBroadcast: RequestHandler = async (req, res) => {
  const { title, message, severity = 'INFO', targetCity = 'ALL' } = req.body;

  if (!title || !message) {
    throw new AppError(400, 'Title and message are required for operational broadcast.');
  }

  const newBroadcast: BroadcastAdvisory = {
    id: `BC-${Math.floor(1000 + Math.random() * 9000)}`,
    title: String(title).trim(),
    message: String(message).trim(),
    severity: ['INFO', 'WARNING', 'EMERGENCY'].includes(severity) ? severity : 'INFO',
    targetCity: String(targetCity).toUpperCase(),
    isActive: true,
    createdAt: new Date().toISOString(),
    createdBy: 'Operations Admin',
  };

  broadcastStore.unshift(newBroadcast);

  recordAuditLog(
    'SETTINGS',
    'BROADCAST_PUBLISHED',
    'Operations Lead',
    'admin@delevez.com',
    String(req.ip || '127.0.0.1'),
    `Published ${newBroadcast.severity} advisory for city ${newBroadcast.targetCity}: "${newBroadcast.title}"`,
    { broadcastId: newBroadcast.id }
  );

  res.status(201).json({
    status: 'success',
    message: 'Operational broadcast published to network.',
    data: { broadcast: newBroadcast },
  });
};

export const toggleBroadcastStatus: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const broadcast = broadcastStore.find(b => b.id === id);

  if (!broadcast) {
    throw new AppError(404, 'Broadcast advisory not found.');
  }

  broadcast.isActive = !broadcast.isActive;

  recordAuditLog(
    'SETTINGS',
    'BROADCAST_TOGGLED',
    'Operations Lead',
    'admin@delevez.com',
    String(req.ip || '127.0.0.1'),
    `Toggled broadcast ${broadcast.id} to ${broadcast.isActive ? 'ACTIVE' : 'INACTIVE'}`,
    { broadcastId: broadcast.id, active: broadcast.isActive }
  );

  res.status(200).json({
    status: 'success',
    message: `Broadcast is now ${broadcast.isActive ? 'active' : 'inactive'}.`,
    data: { broadcast },
  });
};

export const deleteBroadcast: RequestHandler = async (req, res) => {
  const id = String(req.params.id);
  const idx = broadcastStore.findIndex(b => b.id === id);

  if (idx === -1) {
    throw new AppError(404, 'Broadcast advisory not found.');
  }

  const [deleted] = broadcastStore.splice(idx, 1);
  if (deleted) {
    recordAuditLog(
      'SETTINGS',
      'BROADCAST_DELETED',
      'Operations Lead',
      'admin@delevez.com',
      String(req.ip || '127.0.0.1'),
      `Deleted advisory "${deleted.title}"`,
      { broadcastId: deleted.id }
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Broadcast advisory removed.',
  });
};

export const getActivePublicBroadcasts: RequestHandler = async (req, res) => {
  const city = typeof req.query.city === 'string' ? req.query.city.toUpperCase() : null;

  const activeBroadcasts = broadcastStore.filter(b => {
    if (!b.isActive) return false;
    if (!city || b.targetCity === 'ALL') return true;
    return b.targetCity === city;
  });

  res.status(200).json({
    status: 'success',
    data: {
      broadcasts: activeBroadcasts,
      emergencyAlert: activeBroadcasts.find(b => b.severity === 'EMERGENCY') || null,
    },
  });
};
