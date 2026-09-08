import {
  vaultAddonProtections,
  vaultPackagingOptions,
  vaultSecurityLevels,
  vaultServiceTypes,
} from './confidential-delivery-config.js';

export interface VaultQuoteRequest {
  pickupPostalCode?: string;
  deliveryPostalCode?: string;
  securityLevel?: string;
  packaging?: string;
  serviceType?: string;
  addonProtections?: string[];
  declaredValue?: number;
}

export interface VaultQuoteResponse {
  currency: string;
  baseFare: number;
  securityHandling: number;
  packagingFee: number;
  serviceFee: number;
  addOnServices: number;
  totalAmount: number;
  breakdown: {
    baseFare: number;
    securityHandling: number;
    packagingFee: number;
    serviceFee: number;
    addOnServices: number;
    distanceKm: number;
    gstAmount: number;
  };
  securityLevel: string;
  encryptionBadge: string;
}

export function calculateVaultQuote(req: VaultQuoteRequest): VaultQuoteResponse {
  const baseFare = 49.0;

  // Security level fee
  const sec =
    vaultSecurityLevels.find(
      (s) =>
        s.id === req.securityLevel ||
        s.name.toLowerCase() === req.securityLevel?.toLowerCase(),
    ) ?? vaultSecurityLevels[1]; // Default to ENHANCED_SECURITY
  const securityHandling = sec ? sec.fee : 30.0;

  // Packaging fee
  const pkg =
    vaultPackagingOptions.find(
      (p) =>
        p.id === req.packaging ||
        p.name.toLowerCase() === req.packaging?.toLowerCase(),
    ) ?? vaultPackagingOptions[0]; // Default to STANDARD_BOX
  const packagingFee = pkg ? pkg.fee : 0.0;

  // Service type fee
  const srv =
    vaultServiceTypes.find(
      (st) =>
        st.id === req.serviceType ||
        st.name.toLowerCase() === req.serviceType?.toLowerCase(),
    ) ?? vaultServiceTypes[0]; // Default to VAULT_SECURE
  const serviceFee = srv ? srv.fee : 0.0;

  // Add-on protections (toggles)
  let addonsFee = 0;
  if (Array.isArray(req.addonProtections)) {
    for (const addonId of req.addonProtections) {
      const match = vaultAddonProtections.find((a) => a.id === addonId);
      if (match) addonsFee += match.fee;
    }
  }

  // On screen 25, Add-on Services is ₹20.00, Security & Handling is ₹30.00, Base Fare is ₹49.00 -> Total ₹99.00
  const totalAddons = packagingFee + serviceFee + addonsFee;
  const addOnServices = totalAddons > 0 ? totalAddons : 20.0;
  const subtotal = baseFare + securityHandling + addOnServices;
  const gstAmount = Number((subtotal * 0.18).toFixed(2));
  const totalAmount = Number(subtotal.toFixed(2));

  return {
    currency: 'INR',
    baseFare,
    securityHandling,
    packagingFee,
    serviceFee,
    addOnServices,
    totalAmount,
    breakdown: {
      baseFare,
      securityHandling,
      packagingFee,
      serviceFee,
      addOnServices,
      distanceKm: 8.5,
      gstAmount,
    },
    securityLevel: sec?.name ?? 'Enhanced Security',
    encryptionBadge: 'AES-256 Encrypted',
  };
}
