export const CONFIDENTIAL_PRICING_VERSION = '2026-08-25.1';

export const confidentialDocumentTypes = Object.freeze({
  LEGAL: {
    title: 'Legal Documents',
    description: 'Contracts, affidavits, notices, and court papers.',
  },
  FINANCIAL: {
    title: 'Financial Documents',
    description: 'Banking, tax, audit, and investment documents.',
  },
  BUSINESS: {
    title: 'Business Documents',
    description: 'Agreements, tenders, proposals, and company records.',
  },
  IDENTITY: {
    title: 'Identity Documents',
    description: 'Passports, certificates, licenses, and verified IDs.',
  },
  MEDICAL: {
    title: 'Medical Records',
    description: 'Reports, prescriptions, and permitted medical records.',
  },
  OTHER: {
    title: 'Other Confidential Documents',
    description: 'Other legal paper documents requiring secure custody.',
  },
});

export type ConfidentialDocumentTypeKey = keyof typeof confidentialDocumentTypes;

export const confidentialEnvelopeSizes = Object.freeze({
  A4: { title: 'A4 Secure Envelope', description: 'Up to 100 sheets', maximumPages: 100 },
  LEGAL: { title: 'Legal Secure Envelope', description: 'Up to 200 sheets', maximumPages: 200 },
  LARGE: { title: 'Large Document Pouch', description: 'Up to 500 sheets', maximumPages: 500 },
});

export type ConfidentialEnvelopeSizeKey = keyof typeof confidentialEnvelopeSizes;

export const confidentialSecurityLevels = Object.freeze({
  SECURE_SEAL: {
    title: 'Secure Seal',
    description: 'Serialized sealed envelope with scan events.',
    charge: 0,
  },
  TAMPER_EVIDENT: {
    title: 'Tamper Evident',
    description: 'Tamper-evident pouch and photographed seal number.',
    charge: 69,
  },
  CHAIN_OF_CUSTODY: {
    title: 'Chain of Custody',
    description: 'Named handler log at every custody transfer.',
    charge: 149,
  },
});

export type ConfidentialSecurityLevelKey = keyof typeof confidentialSecurityLevels;

export const confidentialHandoverMethods = Object.freeze({
  OTP: {
    title: 'OTP Verification',
    description: 'Recipient must provide the one-time delivery code.',
    charge: 0,
  },
  SIGNATURE: {
    title: 'Recipient Signature',
    description: 'Capture the recipient name and signature.',
    charge: 29,
  },
  OTP_AND_SIGNATURE: {
    title: 'OTP + Signature',
    description: 'Two-factor handover with OTP and signature proof.',
    charge: 59,
  },
});

export type ConfidentialHandoverMethodKey = keyof typeof confidentialHandoverMethods;

export const confidentialDeliverySpeeds = Object.freeze({
  STANDARD: {
    title: 'Standard Secure',
    description: 'Secure delivery within the business day.',
    eta: '4 - 8 hours',
    baseCharge: 179,
    available: true,
  },
  PRIORITY: {
    title: 'Priority Secure',
    description: 'Priority allocation for time-sensitive documents.',
    eta: '2 - 4 hours',
    baseCharge: 249,
    available: true,
  },
  EXPRESS: {
    title: 'Express Direct',
    description: 'Dedicated direct delivery with no route pooling.',
    eta: '60 - 120 minutes',
    baseCharge: 349,
    available: true,
  },
  EXACT_TIME: {
    title: 'Exact-time Handover',
    description: 'Scheduled handover within the selected time window.',
    eta: 'Scheduled',
    baseCharge: 399,
    available: true,
  },
});

export type ConfidentialDeliverySpeedKey = keyof typeof confidentialDeliverySpeeds;

export const confidentialPaymentMethods = Object.freeze({
  PAY_ON_DELIVERY: { title: 'Pay on delivery', description: 'Pay at pickup or delivery.', available: true },
  ONLINE: {
    title: 'Online payment (Sandbox)',
    description: 'Test payment only. No real money or financial credentials are used.',
    available: true,
    sandbox: true,
  },
});

export type ConfidentialPaymentMethodKey = keyof typeof confidentialPaymentMethods;

const entries = (values: Record<string, any>) =>
  Object.entries(values).map(([id, value]) => ({ id, ...value }));

export const getConfidentialCourierOptions = () => ({
  pricingVersion: CONFIDENTIAL_PRICING_VERSION,
  currency: 'INR',
  documentTypes: entries(confidentialDocumentTypes),
  envelopeSizes: entries(confidentialEnvelopeSizes),
  securityLevels: entries(confidentialSecurityLevels),
  handoverMethods: entries(confidentialHandoverMethods),
  deliverySpeeds: entries(confidentialDeliverySpeeds),
  paymentMethods: entries(confidentialPaymentMethods),
  limits: {
    maximumPages: 500,
    maximumDescriptionLength: 300,
    maximumDeclaredValue: 500000,
  },
});
