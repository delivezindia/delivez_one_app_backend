export type PaymentMethodType = 'CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET' | 'NET_BANKING';

export interface SavedPaymentMethod {
  id: string;
  userId: string;
  type: PaymentMethodType;
  title: string; // e.g., "HDFC Bank Credit Card", "Google Pay"
  subtitle: string; // e.g., "•••• 4321 | Expires 05/28", "user@okhdfcbank"
  details: {
    cardBrand?: string;
    last4?: string;
    expiryDate?: string;
    upiId?: string;
    walletProvider?: string;
    linkedPhone?: string;
    bankName?: string;
  };
  isDefault: boolean;
  createdAt: string;
}

export interface PaymentMethodsOverview {
  delivezMoney: {
    balance: number;
    currency: string;
    formattedBalance: string;
    description: string;
  };
  savedMethods: SavedPaymentMethod[];
  availableTypes: {
    type: PaymentMethodType;
    title: string;
    description: string;
    icon: string;
  }[];
}
