import type { Request, Response, NextFunction } from 'express';
import { recordAuditLog, type AuditCategory, type AuditSeverity } from '../modules/admin/admin-audit.controller.js';

export function autoAuditLogger(req: Request, res: Response, next: NextFunction) {
  // Intercept state-mutating HTTP methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }

  const rawUrl = req.originalUrl || req.url || '';
  // Skip non-critical telemetry, health, or read pollings
  if (rawUrl.includes('/health') || rawUrl.includes('/radar/telemetry') || rawUrl.includes('/stats')) {
    return next();
  }

  res.on('finish', () => {
    const url = rawUrl;
    // Determine category
    let category: AuditCategory = 'SYSTEM';
    if (url.includes('/orders') || url.includes('/bookings') || url.includes('/courier') || url.includes('/forgot') || url.includes('/return') || url.includes('/luggage') || url.includes('/confidential')) {
      category = 'ORDERS';
    } else if (url.includes('/partners') || url.includes('/fleet')) {
      category = 'FLEET';
    } else if (url.includes('/pricing') || url.includes('/quote')) {
      category = 'PRICING';
    } else if (url.includes('/promos') || url.includes('/broadcasts')) {
      category = 'PROMOS';
    } else if (url.includes('/settings')) {
      category = 'SETTINGS';
    } else if (url.includes('/support') || url.includes('/tickets')) {
      category = 'SUPPORT';
    } else if (url.includes('/home-content') || url.includes('/prompt-example') || url.includes('/banners')) {
      category = 'CONTENT';
    } else if (url.includes('/auth') || url.includes('/login') || url.includes('/security')) {
      category = 'SECURITY';
    } else if (url.includes('/users')) {
      category = 'USERS';
    }

    // Determine severity
    let severity: AuditSeverity = 'INFO';
    if (res.statusCode >= 500) {
      severity = 'CRITICAL';
    } else if (res.statusCode >= 400) {
      severity = 'WARNING';
    } else if (req.method === 'DELETE' || url.includes('cancel') || url.includes('override')) {
      severity = 'WARNING';
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      severity = 'SUCCESS';
    }

    // Determine clean action name safely
    const pathPart = url.split('?')[0] ?? '';
    const cleanPath = pathPart.replace(/^\/api\/v1\//, '').replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
    const action = `${req.method}_${cleanPath}`.slice(0, 45);

    const user = (req as any).user;
    const actorName = user?.fullName || (url.includes('/admin') ? 'Admin Operator' : 'Customer');
    const actorEmail = user?.email || (url.includes('/admin') ? 'admin@delivez.com' : 'user@delivez.com');
    const actorRole = user?.role || (url.includes('/admin') ? 'ADMIN' : 'USER');

    const desc = `${req.method} ${pathPart} executed with status ${res.statusCode} (${severity})`;

    recordAuditLog({
      category,
      action,
      severity,
      actorName,
      actorEmail,
      actorRole,
      ipAddress: String(req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'),
      userAgent: String(req.headers['user-agent'] || 'Browser'),
      resourceType: category,
      description: desc,
      metadata: {
        method: req.method,
        path: pathPart,
        statusCode: res.statusCode,
      },
    });
  });

  next();
}
