import { AppError } from '../../lib/app-error.js';
import { validateAddress } from '../personal-courier/courier.validation.js';
import {
  confidentialDeliverySpeeds,
  type ConfidentialDeliverySpeedKey,
  confidentialDocumentTypes,
  type ConfidentialDocumentTypeKey,
  confidentialEnvelopeSizes,
  type ConfidentialEnvelopeSizeKey,
  confidentialHandoverMethods,
  type ConfidentialHandoverMethodKey,
  confidentialPaymentMethods,
  type ConfidentialPaymentMethodKey,
  confidentialSecurityLevels,
  type ConfidentialSecurityLevelKey,
} from './confidential-courier-config.js';

const fail = (message: string, field?: string): never => {
  throw new AppError(400, message, field ? { field } : undefined);
};

const object = (value: unknown, field: string): Record<string, any> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${field} is required.`, field);
  }
  return value as Record<string, any>;
};

const text = (
  value: unknown,
  field: string,
  { min = 1, max = 120, optional = false } = {},
): string | null => {
  if ((value === undefined || value === null || value === '') && optional) {
    return null;
  }
  if (typeof value !== 'string') {
    fail(`${field} is required.`, field);
  }
  const clean = (value as string).trim();
  if (clean.length < min || clean.length > max) {
    fail(`${field} must be between ${min} and ${max} characters.`, field);
  }
  return clean;
};

const number = (
  value: unknown,
  field: string,
  { min, max, optional = false }: { min?: number; max?: number; optional?: boolean } = {},
): number | null => {
  if ((value === undefined || value === null || value === '') && optional) {
    return null;
  }
  const clean = Number(value);
  if (!Number.isFinite(clean)) {
    fail(`${field} must be a number.`, field);
  }
  if (min !== undefined && clean < min) {
    fail(`${field} must be at least ${min}.`, field);
  }
  if (max !== undefined && clean > max) {
    fail(`${field} must not exceed ${max}.`, field);
  }
  return Math.round(clean * 100) / 100;
};

const boolean = (value: unknown, field: string, fallback = false): boolean => {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') {
    fail(`${field} must be true or false.`, field);
  }
  return value as boolean;
};

const oneOf = <T extends string>(
  value: unknown,
  values: Record<T, any>,
  field: string,
): T => {
  if (typeof value !== 'string' || !Object.hasOwn(values, value)) {
    fail(`${field} is invalid.`, field);
  }
  return value as T;
};

export const validateConfidentialCourierRequest = (value: unknown) => {
  const data = object(value, 'body');
  const document = object(data.document, 'document');
  const security = object(data.security, 'security');
  const schedule = object(data.schedule ?? { type: 'ASAP' }, 'schedule');

  const documentType = oneOf<ConfidentialDocumentTypeKey>(
    document.type,
    confidentialDocumentTypes,
    'document.type',
  );
  const envelopeSize = oneOf<ConfidentialEnvelopeSizeKey>(
    document.envelopeSize,
    confidentialEnvelopeSizes,
    'document.envelopeSize',
  );
  const pageCount = number(document.pageCount, 'document.pageCount', {
    min: 1,
    max: 500,
  })!;
  if (pageCount > confidentialEnvelopeSizes[envelopeSize].maximumPages) {
    fail(
      `document.pageCount exceeds the ${confidentialEnvelopeSizes[envelopeSize].title} limit.`,
      'document.pageCount',
    );
  }

  const complianceAccepted = boolean(
    document.complianceAccepted,
    'document.complianceAccepted',
  );
  if (!complianceAccepted) {
    fail(
      'You must confirm that the shipment contains only lawful paper documents.',
      'document.complianceAccepted',
    );
  }

  const securityLevel = oneOf<ConfidentialSecurityLevelKey>(
    security.level,
    confidentialSecurityLevels,
    'security.level',
  );
  const handoverMethod = oneOf<ConfidentialHandoverMethodKey>(
    security.handoverMethod,
    confidentialHandoverMethods,
    'security.handoverMethod',
  );
  const deliverySpeed = oneOf<ConfidentialDeliverySpeedKey>(
    data.deliverySpeed,
    confidentialDeliverySpeeds,
    'deliverySpeed',
  );
  if (!confidentialDeliverySpeeds[deliverySpeed].available) {
    fail('The selected delivery speed is unavailable.', 'deliverySpeed');
  }

  const scheduleType: 'ASAP' | 'SCHEDULED' =
    schedule.type === 'SCHEDULED'
      ? 'SCHEDULED'
      : schedule.type === 'ASAP'
        ? 'ASAP'
        : fail('schedule.type is invalid.', 'schedule.type');
  let scheduledPickupAt: Date | null = null;
  if (scheduleType === 'SCHEDULED') {
    const rawVal = schedule?.scheduledAt || schedule?.scheduledPickupAt || schedule?.pickupAt || schedule?.date;
    if (rawVal) {
      const parsed = new Date(rawVal);
      if (!Number.isNaN(parsed.getTime())) {
        const minimum = Date.now() + 25 * 60 * 1000;
        const maximum = Date.now() + 30 * 24 * 60 * 60 * 1000;
        if (parsed.getTime() < minimum) {
          scheduledPickupAt = new Date(Date.now() + 35 * 60 * 1000);
        } else if (parsed.getTime() > maximum) {
          scheduledPickupAt = new Date(maximum);
        } else {
          scheduledPickupAt = parsed;
        }
      } else {
        scheduledPickupAt = new Date(Date.now() + 60 * 60 * 1000);
      }
    } else {
      scheduledPickupAt = new Date(Date.now() + 60 * 60 * 1000);
    }
  }
  if (deliverySpeed === 'EXACT_TIME' && scheduleType !== 'SCHEDULED') {
    fail('Exact-time handover requires a scheduled pickup.', 'schedule.type');
  }

  return {
    pickup: validateAddress(data.pickup, 'pickup'),
    dropoff: validateAddress(data.dropoff, 'dropoff'),
    document: {
      type: documentType,
      envelopeSize,
      pageCount,
      description: text(document.description, 'document.description', {
        max: 300,
        optional: true,
      }),
      containsOriginals: boolean(
        document.containsOriginals,
        'document.containsOriginals',
      ),
      requiresReturn: boolean(
        document.requiresReturn,
        'document.requiresReturn',
      ),
      declaredValue: number(document.declaredValue, 'document.declaredValue', {
        min: 0,
        max: 500000,
        optional: true,
      }),
      complianceAccepted,
    },
    security: {
      level: securityLevel,
      handoverMethod,
      recipientIdRequired: boolean(
        security.recipientIdRequired,
        'security.recipientIdRequired',
        true,
      ),
      pickupProofRequired: boolean(
        security.pickupProofRequired,
        'security.pickupProofRequired',
        true,
      ),
    },
    schedule: { type: scheduleType, scheduledAt: scheduledPickupAt },
    deliverySpeed,
    paymentMethod: oneOf<ConfidentialPaymentMethodKey>(
      data.paymentMethod ?? 'PAY_ON_DELIVERY',
      confidentialPaymentMethods,
      'paymentMethod',
    ),
  };
};

export const validateConfidentialIdempotencyKey = (value: unknown): string => {
  if (typeof value !== 'string' || !/^[A-Za-z0-9._:-]{8,100}$/.test(value)) {
    fail(
      'A valid Idempotency-Key header (8-100 characters) is required.',
      'Idempotency-Key',
    );
  }
  return value as string;
};
