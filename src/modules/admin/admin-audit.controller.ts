import type { RequestHandler } from 'express';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  category: 'ORDERS' | 'FLEET' | 'SETTINGS' | 'SECURITY' | 'PRICING' | 'PROMOS' | 'GENERAL';
  action: string;
  actorName: string;
  actorEmail: string;
  ipAddress: string;
  description: string;
  metadata?: Record<string, any>;
}

const auditLogsStore: AuditLogItem[] = [
  {
    id: 'aud-1',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    category: 'SETTINGS',
    action: 'UPDATE_SURGE_MULTIPLIER',
    actorName: 'System Admin',
    actorEmail: 'admin@delevez.com',
    ipAddress: '103.21.244.12',
    description: 'Surge pricing multiplier updated to 1.2x (Rainy evening rush)',
    metadata: { previous: 1.0, current: 1.2 },
  },
  {
    id: 'aud-2',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    category: 'ORDERS',
    action: 'DISPATCH_ASSIGNMENT',
    actorName: 'System Admin',
    actorEmail: 'admin@delevez.com',
    ipAddress: '103.21.244.12',
    description: 'Assigned courier Rajesh Sharma to order #GFT-2026-984',
    metadata: { order: 'GFT-2026-984', partner: 'Rajesh Sharma' },
  },
  {
    id: 'aud-3',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    category: 'FLEET',
    action: 'PARTNER_STATUS_CHANGE',
    actorName: 'System Admin',
    actorEmail: 'admin@delevez.com',
    ipAddress: '103.21.244.12',
    description: 'Partner Vikram Mehta switched to ARMORED_TRANSIT mode',
  },
  {
    id: 'aud-4',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    category: 'SECURITY',
    action: 'SUPPORT_TICKET_ESCALATED',
    actorName: 'Pooja Verma',
    actorEmail: 'pooja.v@delivez.one',
    ipAddress: '14.139.22.8',
    description: 'High security tamper seal incident ticket #TKT-8491 logged',
  },
  {
    id: 'aud-5',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    category: 'PROMOS',
    action: 'PROMO_CODE_CREATED',
    actorName: 'Marketing Desk',
    actorEmail: 'marketing@delivez.one',
    ipAddress: '49.207.180.45',
    description: 'Created coupon FESTIVE20 (20% off up to ₹250)',
  },
  {
    id: 'aud-6',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    category: 'PRICING',
    action: 'RATE_CARD_SAVED',
    actorName: 'System Admin',
    actorEmail: 'admin@delevez.com',
    ipAddress: '103.21.244.12',
    description: 'Updated rate card for Confidential Courier: Base fare ₹199',
  },
];

export function recordAuditLog(
  category: AuditLogItem['category'],
  action: string,
  actorName: string,
  actorEmail: string,
  ipAddress: string,
  description: string,
  metadata?: Record<string, any>
) {
  const item: AuditLogItem = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    category,
    action,
    actorName,
    actorEmail,
    ipAddress: ipAddress || '127.0.0.1',
    description,
    metadata,
  };

  auditLogsStore.unshift(item);
  if (auditLogsStore.length > 500) auditLogsStore.pop();
}

export const listAuditLogs: RequestHandler = (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category.toUpperCase() : 'ALL';
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';

  let filtered = [...auditLogsStore];

  if (category !== 'ALL') {
    filtered = filtered.filter(a => a.category === category);
  }

  if (search) {
    filtered = filtered.filter(
      a =>
        a.action.toLowerCase().includes(search) ||
        a.description.toLowerCase().includes(search) ||
        a.actorName.toLowerCase().includes(search) ||
        a.actorEmail.toLowerCase().includes(search) ||
        a.ipAddress.includes(search)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      logs: filtered,
      total: auditLogsStore.length,
      categories: ['ALL', 'ORDERS', 'FLEET', 'SETTINGS', 'SECURITY', 'PRICING', 'PROMOS'],
    },
  });
};

export const exportAuditLogsCsv: RequestHandler = (_req, res) => {
  let csv = 'Timestamp,Category,Action,Actor Name,Actor Email,IP Address,Description\n';

  auditLogsStore.forEach(a => {
    csv += `"${a.timestamp}","${a.category}","${a.action}","${a.actorName}","${a.actorEmail}","${a.ipAddress}","${a.description.replace(/"/g, '""')}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="delivez-audit-trail.csv"');
  res.status(200).send(csv);
};
