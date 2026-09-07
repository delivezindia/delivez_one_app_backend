export interface VaultItemType {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface VaultSecurityLevel {
  id: string;
  name: string;
  description: string;
  badge: string;
  tag?: string;
  fee: number;
}

export interface VaultPackaging {
  id: string;
  name: string;
  description: string;
  tag?: string;
  fee: number;
}

export interface VaultServiceType {
  id: string;
  name: string;
  description: string;
  expectedDelivery: string;
  tag?: string;
  category: 'POPULAR' | 'MORE';
  fee: number;
}

export interface VaultVerificationMethod {
  id: string;
  name: string;
  description: string;
  tag?: string;
}

export const vaultItemTypes: VaultItemType[] = [
  { id: 'CONFIDENTIAL_DOCS', name: 'Confidential Documents', description: 'Private and business-critical documents', icon: 'FileText' },
  { id: 'LEGAL_DOCS', name: 'Legal Documents', description: 'Affidavits, deeds, power of attorney, petitions', icon: 'Scale' },
  { id: 'CONTRACTS', name: 'Contracts / Agreements', description: 'Executed contracts, NDAs, MoUs, lease agreements', icon: 'Handshake' },
  { id: 'FINANCIAL_DOCS', name: 'Financial Documents', description: 'Cheques, audit reports, bank drafts, statements', icon: 'Landmark' },
  { id: 'OFFICIAL_DOCS', name: 'Official Documents', description: 'Corporate records, tax filings, compliance papers', icon: 'Building2' },
  { id: 'CERTIFICATES', name: 'Original Certificates', description: 'Degrees, licenses, title deeds, birth certificates', icon: 'Award' },
  { id: 'SEALED_ENVELOPE', name: 'Sealed Envelope', description: 'Pre-sealed confidential envelope for direct handover', icon: 'Mail' },
  { id: 'SENSITIVE_RECORDS', name: 'Sensitive Records', description: 'Medical files, HR records, confidential dossiers', icon: 'FolderLock' },
  { id: 'SECURE_PACKAGE', name: 'Secure Package', description: 'Encrypted devices, hardware tokens, secure containers', icon: 'Package' },
  { id: 'OTHER', name: 'Other / Not Listed', description: 'Describe your custom confidential shipment', icon: 'MoreHorizontal' },
];

export const vaultSecurityLevels: VaultSecurityLevel[] = [
  {
    id: 'STANDARD_CONFIDENTIAL',
    name: 'Standard Confidential',
    description: 'Business-sensitive documents with secure handling, OTP verification & basic tracking.',
    badge: 'Standard',
    tag: 'Good',
    fee: 0,
  },
  {
    id: 'HIGHLY_CONFIDENTIAL',
    name: 'Highly Confidential',
    description: 'Restricted recipient access, tamper protection, named recipient, full chain of custody & verified delivery.',
    badge: 'High',
    tag: 'Recommended',
    fee: 30,
  },
  {
    id: 'CRITICAL',
    name: 'Critical',
    description: 'Highest level of security & control with enhanced verification, direct delivery & detailed audit trail.',
    badge: 'Ultra',
    tag: 'Maximum',
    fee: 60,
  },
];

export const vaultPackagingOptions: VaultPackaging[] = [
  {
    id: 'VAULT_SECURE_ENVELOPE',
    name: 'Vault Secure Envelope',
    description: 'Tamper-evident and water-resistant. Includes tamper-proof security seal & unique seal ID.',
    tag: 'RECOMMENDED',
    fee: 49,
  },
  {
    id: 'MY_SEALED_ENVELOPE',
    name: 'My Sealed Envelope',
    description: "I'll provide my own sealed packaging. We ensure secure handling & seal verification at pickup.",
    tag: 'No Extra Cost',
    fee: 0,
  },
  {
    id: 'VAULT_SECURE_BOX',
    name: 'Vault Secure Box',
    description: 'For bulkier documents or items. Rugged & tamper-evident box with extra protection for bulky items.',
    fee: 99,
  },
];

export const vaultServiceTypes: VaultServiceType[] = [
  // Popular Services
  {
    id: 'VAULT_SECURE',
    name: 'Vault Secure',
    description: 'Standard secure delivery with full verification and chain of custody.',
    expectedDelivery: '1-2 Days',
    tag: 'Recommended',
    category: 'POPULAR',
    fee: 0,
  },
  {
    id: 'VAULT_PRIORITY',
    name: 'Vault Priority',
    description: 'Faster delivery with priority handling and dedicated partner.',
    expectedDelivery: 'Same / Next Day',
    tag: 'Fastest',
    category: 'POPULAR',
    fee: 40,
  },
  {
    id: 'VAULT_DIRECT',
    name: 'Vault Direct',
    description: 'Point-to-point delivery with no stops in between. Maximum custody speed.',
    expectedDelivery: '1-2 Days',
    category: 'POPULAR',
    fee: 80,
  },
  // More Services
  {
    id: 'VAULT_SAME_DAY',
    name: 'Vault Same Day',
    description: 'Same day secure delivery for local city routes.',
    expectedDelivery: 'Today by 08:00 PM',
    category: 'MORE',
    fee: 50,
  },
  {
    id: 'VAULT_EXPRESS',
    name: 'Vault Express',
    description: 'Fastest available on-demand courier dispatch.',
    expectedDelivery: 'Within 2-3 Hours',
    category: 'MORE',
    fee: 60,
  },
  {
    id: 'VAULT_SCHEDULED',
    name: 'Vault Scheduled',
    description: 'Pre-book for specific calendar date & time slot.',
    expectedDelivery: 'Chosen Slot',
    category: 'MORE',
    fee: 0,
  },
  {
    id: 'VAULT_INTERCITY',
    name: 'Vault Intercity',
    description: 'City-to-city secure sealed transit.',
    expectedDelivery: '24-48 Hours',
    category: 'MORE',
    fee: 120,
  },
  {
    id: 'VAULT_AIR',
    name: 'Vault Air',
    description: 'Air-enabled express transport for long-distance confidential parcels.',
    expectedDelivery: 'Next Flight Out',
    category: 'MORE',
    fee: 200,
  },
  {
    id: 'VAULT_EXCHANGE',
    name: 'Vault Exchange',
    description: 'Two-way confidential document exchange and counter-signing return.',
    expectedDelivery: '1-2 Days',
    category: 'MORE',
    fee: 70,
  },
  {
    id: 'VAULT_MULTIPLE',
    name: 'Vault Multiple',
    description: 'Multiple secure drop-off points with individual digital custody receipts.',
    expectedDelivery: 'Custom Route',
    category: 'MORE',
    fee: 90,
  },
  {
    id: 'VAULT_BULK',
    name: 'Vault Bulk',
    description: 'Bulk confidential filings and corporate record transfers.',
    expectedDelivery: '1-2 Days',
    category: 'MORE',
    fee: 150,
  },
  {
    id: 'VAULT_LEGAL',
    name: 'Vault Legal',
    description: 'For court filings and registrar submissions with timestamped custody logs.',
    expectedDelivery: 'Court Hours',
    category: 'MORE',
    fee: 45,
  },
  {
    id: 'VAULT_TENDER',
    name: 'Vault Tender',
    description: 'Tender & bid submissions with strict deadline guarantee.',
    expectedDelivery: 'Strict Deadline',
    category: 'MORE',
    fee: 100,
  },
  {
    id: 'VAULT_BANKING',
    name: 'Vault Banking',
    description: 'For banking drafts, bonds, and high-value instruments.',
    expectedDelivery: 'Banking Hours',
    category: 'MORE',
    fee: 50,
  },
  {
    id: 'VAULT_BOARD',
    name: 'Vault Board',
    description: 'Board packs & executive confidential dossier delivery.',
    expectedDelivery: 'Same Day',
    category: 'MORE',
    fee: 80,
  },
  {
    id: 'VAULT_WHITE_GLOVE',
    name: 'Vault White Glove',
    description: 'Premium handling, tamper audit & dedicated executive escort.',
    expectedDelivery: 'Direct Non-Stop',
    category: 'MORE',
    fee: 120,
  },
  {
    id: 'VAULT_CRITICAL',
    name: 'Vault Critical',
    description: 'Highest control & rapid response delivery with active GPS telemetry.',
    expectedDelivery: 'Immediate',
    category: 'MORE',
    fee: 180,
  },
];

export const vaultAccessRequirements = [
  'Security Check',
  'Visitor Pass',
  'Lift Access',
  'ID Proof',
  'Parking',
];

export const vaultVerificationMethods: VaultVerificationMethod[] = [
  {
    id: 'OTP',
    name: 'OTP Verification',
    description: 'Recipient will receive an OTP on mobile to verify identity.',
    tag: 'RECOMMENDED',
  },
  {
    id: 'QR_CODE',
    name: 'QR Code Verification',
    description: 'Recipient must scan the secure QR code at the time of delivery.',
  },
  {
    id: 'GOVT_ID',
    name: 'Authorized ID Verification',
    description: 'Verify recipient using valid Govt. ID at delivery.',
  },
];

export const vaultTimeSlots = [
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const vaultAdditionalServices = [
  { id: 'TAMPER_PROOF_SEAL', name: 'Tamper-Proof Seal', active: true },
  { id: 'CHAIN_OF_CUSTODY', name: 'Chain of Custody', active: true },
  { id: 'PHOTO_PROOF', name: 'Photo Proof of Delivery', active: true },
  { id: 'SECURE_HANDLING', name: 'Secure Handling Protocol', active: true },
];

export function getVaultOptions() {
  return {
    itemTypes: vaultItemTypes,
    securityLevels: vaultSecurityLevels,
    packagingOptions: vaultPackagingOptions,
    serviceTypes: vaultServiceTypes,
    accessRequirements: vaultAccessRequirements,
    verificationMethods: vaultVerificationMethods,
    timeSlots: vaultTimeSlots,
    additionalServices: vaultAdditionalServices,
    encryptionStandard: 'AES-256 End-to-End Encrypted',
    securityBadge: 'Norton SECURED',
    guarantees: [
      '100% Secure & Encrypted',
      'Tamper-Evident Void Seals',
      'Dual-Party OTP Verification',
      'Real-Time Live Milestone Telemetry',
      'Enterprise SLA Guarantee',
    ],
  };
}

