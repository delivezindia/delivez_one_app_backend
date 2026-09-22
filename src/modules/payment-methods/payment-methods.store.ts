import fs from 'node:fs';
import path from 'node:path';
import type { SavedPaymentMethod, PaymentMethodType } from './payment-methods.types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'payment-methods-store.json');

let paymentMethodsMemory: SavedPaymentMethod[] = [
  {
    id: 'pm-1',
    userId: 'default',
    type: 'CREDIT_CARD',
    title: 'HDFC Bank Credit Card',
    subtitle: '•••• 4321 | Expires 05/28',
    details: {
      cardBrand: 'HDFC Bank',
      last4: '4321',
      expiryDate: '05/28',
    },
    isDefault: true,
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'pm-2',
    userId: 'default',
    type: 'DEBIT_CARD',
    title: 'ICICI Bank Debit Card',
    subtitle: '•••• 9876 | Expires 11/26',
    details: {
      cardBrand: 'ICICI Bank',
      last4: '9876',
      expiryDate: '11/26',
    },
    isDefault: false,
    createdAt: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'pm-3',
    userId: 'default',
    type: 'UPI',
    title: 'Google Pay',
    subtitle: 'user@okhdfcbank',
    details: {
      upiId: 'user@okhdfcbank',
    },
    isDefault: false,
    createdAt: new Date('2026-03-01').toISOString(),
  },
  {
    id: 'pm-4',
    userId: 'default',
    type: 'WALLET',
    title: 'Paytm Wallet',
    subtitle: 'Linked • 9100 1234 5678',
    details: {
      walletProvider: 'Paytm',
      linkedPhone: '9100 1234 5678',
    },
    isDefault: false,
    createdAt: new Date('2026-03-12').toISOString(),
  },
];

function initStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.paymentMethods)) {
        paymentMethodsMemory = parsed.paymentMethods;
      }
    }
  } catch (err) {
    console.error('Failed to load payment methods store:', err);
  }
}

function saveStorage() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify({ paymentMethods: paymentMethodsMemory }, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save payment methods store:', err);
  }
}

initStorage();

export function getUserPaymentMethods(userId: string): SavedPaymentMethod[] {
  // If specific methods exist for userId, return them. Otherwise return default seeds mapped to this userId
  const userMethods = paymentMethodsMemory.filter((pm) => pm.userId === userId);
  if (userMethods.length > 0) {
    return userMethods;
  }
  // Initialize default seed methods for user
  const defaults = paymentMethodsMemory.filter((pm) => pm.userId === 'default').map((pm) => ({
    ...pm,
    id: `pm-${userId.slice(0, 6)}-${pm.id}`,
    userId,
  }));
  paymentMethodsMemory.push(...defaults);
  saveStorage();
  return defaults;
}

export function addPaymentMethodForUser(
  userId: string,
  type: PaymentMethodType,
  payload: {
    cardHolderName?: string;
    cardBrand?: string;
    cardNumber?: string;
    expiryDate?: string;
    upiId?: string;
    walletProvider?: string;
    linkedPhone?: string;
    bankName?: string;
    isDefault?: boolean;
  }
): SavedPaymentMethod {
  let title = '';
  let subtitle = '';
  const details: SavedPaymentMethod['details'] = {};

  if (type === 'CREDIT_CARD' || type === 'DEBIT_CARD') {
    const brand = payload.cardBrand || (type === 'CREDIT_CARD' ? 'HDFC Bank Credit Card' : 'ICICI Bank Debit Card');
    const last4 = payload.cardNumber ? payload.cardNumber.slice(-4) : '1234';
    const exp = payload.expiryDate || '12/28';
    title = brand.includes('Card') ? brand : `${brand} ${type === 'CREDIT_CARD' ? 'Credit Card' : 'Debit Card'}`;
    subtitle = `•••• ${last4} | Expires ${exp}`;
    details.cardBrand = brand;
    details.last4 = last4;
    details.expiryDate = exp;
  } else if (type === 'UPI') {
    title = payload.upiId?.includes('okaxis') ? 'Google Pay' : payload.upiId?.includes('ybl') ? 'PhonePe' : 'UPI Handle';
    subtitle = payload.upiId || 'user@upi';
    details.upiId = subtitle;
  } else if (type === 'WALLET') {
    title = payload.walletProvider || 'Paytm Wallet';
    subtitle = `Linked • ${payload.linkedPhone || '98765 43210'}`;
    details.walletProvider = title;
    details.linkedPhone = payload.linkedPhone || '98765 43210';
  } else if (type === 'NET_BANKING') {
    title = payload.bankName || 'HDFC Net Banking';
    subtitle = 'Connected Bank Account';
    details.bankName = title;
  }

  const userMethods = getUserPaymentMethods(userId);
  const isFirst = userMethods.length === 0;
  const isDefault = Boolean(payload.isDefault || isFirst);

  if (isDefault) {
    userMethods.forEach((m) => {
      m.isDefault = false;
    });
  }

  const newMethod: SavedPaymentMethod = {
    id: `pm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    type,
    title,
    subtitle,
    details,
    isDefault,
    createdAt: new Date().toISOString(),
  };

  paymentMethodsMemory.push(newMethod);
  saveStorage();
  return newMethod;
}

export function setDefaultMethodForUser(userId: string, methodId: string): SavedPaymentMethod | null {
  const userMethods = getUserPaymentMethods(userId);
  const target = userMethods.find((m) => m.id === methodId);
  if (!target) return null;

  userMethods.forEach((m) => {
    m.isDefault = m.id === methodId;
  });

  saveStorage();
  return target;
}

export function deleteMethodForUser(userId: string, methodId: string): boolean {
  const initialLen = paymentMethodsMemory.length;
  paymentMethodsMemory = paymentMethodsMemory.filter((m) => !(m.userId === userId && m.id === methodId));
  const changed = paymentMethodsMemory.length !== initialLen;
  if (changed) {
    // If deleted method was default, make another method default
    const userMethods = paymentMethodsMemory.filter((m) => m.userId === userId);
    if (userMethods.length > 0 && !userMethods.some((m) => m.isDefault)) {
      if (userMethods[0]) userMethods[0].isDefault = true;
    }
    saveStorage();
  }
  return changed;
}
