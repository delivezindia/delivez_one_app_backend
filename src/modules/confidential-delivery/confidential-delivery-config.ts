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
  fee: number;
}

export interface VaultPackaging {
  id: string;
  name: string;
  description: string;
  badge?: string;
  fee: number;
}

export interface VaultAddonProtection {
  id: string;
  name: string;
  description: string;
  fee: number;
}

export interface VaultServiceType {
  id: string;
  name: string;
  description: string;
  expectedDelivery: string;
  tag?: string;
  fee: number;
}

export interface VaultVerificationMethod {
  id: string;
  name: string;
  description: string;
  badge?: string;
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
    id: 'STANDARD_SECURITY',
    name: 'Standard Security',
    description: 'Basic security with sealed packaging and tracking.',
    badge: 'Included',
    fee: 0,
  },
  {
    id: 'ENHANCED_SECURITY',
    name: 'Enhanced Security',
    description: 'Tamper-proof packaging and real-time tracking.',
    badge: 'Recommended',
    fee: 30,
  },
  {
    id: 'MAXIMUM_SECURITY',
    name: 'Maximum Security',
    description: 'Armed escort / high security for critical items.',
    badge: 'Premium',
    fee: 60,
  },
];

export const vaultPackagingOptions: VaultPackaging[] = [
  {
    id: 'STANDARD_BOX',
    name: 'Standard Box',
    description: 'Sturdy corrugated box suitable for general shipments.',
    badge: 'Most Used',
    fee: 0,
  },
  {
    id: 'PADDED_ENVELOPE',
    name: 'Padded Envelope',
    description: 'Lightweight padded mailer for documents and small items.',
    fee: 0,
  },
  {
    id: 'TAMPER_PROOF_POUCH',
    name: 'Tamper Proof Pouch',
    description: 'Secure, tamper-evident pouch for confidential items.',
    fee: 20,
  },
  {
    id: 'BUBBLE_WRAP',
    name: 'Bubble Wrap',
    description: 'Extra cushioning for fragile or breakable items.',
    fee: 25,
  },
  {
    id: 'HEAVY_DUTY_CRATE',
    name: 'Heavy Duty Crate',
    description: 'Maximum protection for heavy, delicate or high-value items.',
    fee: 50,
  },
  {
    id: 'DOCUMENT_SLEEVE',
    name: 'Document Sleeve',
    description: 'Water-resistant sleeve for important documents.',
    fee: 15,
  },
  {
    id: 'MY_OWN_PACKAGE',
    name: 'My Own Package',
    description: 'I will pack using my own packaging.',
    fee: 0,
  },
];

export const vaultAddonProtections: VaultAddonProtection[] = [
  { id: 'EXTRA_BUBBLE_WRAP', name: 'Extra Bubble Wrap', description: 'Additional cushioning for extra safety.', fee: 30 },
  { id: 'CORNER_GUARD', name: 'Corner Guard', description: 'Protects corners and edges from damage.', fee: 25 },
  { id: 'WATERPROOF_COVER', name: 'Waterproof Cover', description: 'Protects from moisture and light rain.', fee: 20 },
  { id: 'FRAGILE_STICKER', name: 'Fragile Sticker', description: 'Alerts handlers to handle with care.', fee: 10 },
  { id: 'SEAL_SECURITY_TAPE', name: 'Seal & Security Tape', description: 'Tamper-evident sealing for added security.', fee: 15 },
];

export const vaultServiceTypes: VaultServiceType[] = [
  {
    id: 'VAULT_SECURE',
    name: 'Vault Secure',
    description: 'Standard secure delivery with full verification and',
    expectedDelivery: '1-2 Days',
    tag: 'Recommended',
    fee: 0,
  },
  {
    id: 'VAULT_PRIORITY',
    name: 'Vault Priority',
    description: 'Faster delivery with priority handling and',
    expectedDelivery: 'Same / Next Day',
    tag: 'Fastest',
    fee: 40,
  },
  {
    id: 'VAULT_DIRECT',
    name: 'Vault Direct',
    description: 'Point-to-point delivery with no stops in between. Maxi...',
    expectedDelivery: '1-2 Days',
    fee: 50,
  },
  {
    id: 'VAULT_PRECISE',
    name: 'Vault Precise',
    description: 'Deliver at a specific date and time window of',
    expectedDelivery: 'Scheduled',
    fee: 30,
  },
  {
    id: 'VAULT_HAND_CARRY',
    name: 'Vault Hand Carry',
    description: 'Dedicated hand carry by authorized',
    expectedDelivery: '1-2 Days',
    fee: 60,
  },
  {
    id: 'VAULT_RETURN',
    name: 'Vault Return',
    description: 'Deliver and collect signed or processed documents and ...',
    expectedDelivery: '1-3 Days',
    fee: 45,
  },
  {
    id: 'VAULT_EXCHANGE',
    name: 'Vault Exchange',
    description: 'Two-way document or item exchange in',
    expectedDelivery: '1-3 Days',
    fee: 55,
  },
  {
    id: 'VAULT_CRITICAL',
    name: 'Vault Critical',
    description: 'Highest level of security with armed escort',
    expectedDelivery: 'Same Day',
    fee: 90,
  },
  {
    id: 'VAULT_MULTIPOINT',
    name: 'Vault MultiPoint',
    description: 'Multiple secure stops in a single journey with',
    expectedDelivery: '1-3 Days',
    fee: 70,
  },
];

export const vaultAccessRequirements = [
  'Security Check',
  'Visitor Pass',
  'Lift Access',
  'ID Proof',
];

export const vaultItemHandlingOptions = [
  'Fragile',
  'Handle with Care',
  'This Side Up',
  'Keep Dry',
  'Do Not Stack',
];

export const vaultVerificationMethods: VaultVerificationMethod[] = [
  {
    id: 'OTP',
    name: 'OTP Verification',
    description: 'Recipient will receive an OTP on their registered mobile number for verification.',
    badge: 'Recommended',
    tag: 'Best for secure and contact-based deliveries',
  },
  {
    id: 'ID_PROOF',
    name: 'ID Proof Verification',
    description: 'Verify recipient using a valid government-issued ID proof.',
    tag: 'Suitable for high value and important shipments',
  },
  {
    id: 'SIGNATURE',
    name: 'Signature Verification',
    description: 'Collect recipient\'s signature at the time of delivery.',
    tag: 'Standard method for most deliveries',
  },
  {
    id: 'FACE_VERIFICATION',
    name: 'Face Verification',
    description: 'Verify recipient using live photo capture at delivery.',
    tag: 'High security with live face match',
  },
  {
    id: 'AUTHORIZED_PERSON',
    name: 'Authorized Person Verification',
    description: 'Allow delivery to an authorized person on behalf of the recipient.',
    tag: 'For cases where recipient is not personally available',
  },
  {
    id: 'PIN',
    name: 'PIN Verification',
    description: 'Recipient must provide a pre-shared PIN to receive the delivery.',
    tag: 'Extra layer of security for sensitive items',
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
    addonProtections: vaultAddonProtections,
    serviceTypes: vaultServiceTypes,
    accessRequirements: vaultAccessRequirements,
    itemHandlingOptions: vaultItemHandlingOptions,
    verificationMethods: vaultVerificationMethods,
    timeSlots: vaultTimeSlots,
    additionalServices: vaultAdditionalServices,
    encryptionStandard: 'AES-256 End-to-End Encrypted',
    securityBadge: 'Norton SECURED',
  };
}
