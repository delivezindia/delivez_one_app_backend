import { randomUUID } from 'node:crypto';

import { AppError } from './app-error.js';

export const SANDBOX_PAYMENT_PROVIDER = 'DELIVEZ_SANDBOX';

export const sandboxPaymentMethods = Object.freeze({
  UPI: { title: 'UPI', description: 'Simulated UPI payment without collecting a UPI ID.' },
  CARD: {
    title: 'Credit / Debit Card',
    description: 'Simulated card payment without collecting card details.',
  },
  WALLET: { title: 'Digital Wallet', description: 'Simulated wallet authorization.' },
  NET_BANKING: { title: 'Net Banking', description: 'Simulated bank authorization.' },
});

export type SandboxPaymentMethodKey = keyof typeof sandboxPaymentMethods;

export const getSandboxGatewayOptions = () => ({
  provider: SANDBOX_PAYMENT_PROVIDER,
  sandbox: true,
  notice: 'Test payment only. No money is charged and no financial credentials are collected.',
  methods: Object.entries(sandboxPaymentMethods).map(([id, value]) => ({ id, ...value })),
});

export const validateSandboxPayment = (value: unknown): {
  method: SandboxPaymentMethodKey;
  outcome: 'SUCCESS' | 'FAILURE';
} => {
  const data = value as {
    method?: string;
    paymentMethod?: string;
    gateway?: string;
    action?: string;
    outcome?: string;
  } | null;

  // Resolve outcome: handle 'action' (SUCCESS/FAILURE) or 'outcome', default to 'SUCCESS'
  const rawAction = data?.action?.toUpperCase();
  const rawOutcome = data?.outcome?.toUpperCase();
  const outcome: 'SUCCESS' | 'FAILURE' =
    rawOutcome === 'FAILURE' || rawAction === 'FAILURE' || rawAction === 'FAIL'
      ? 'FAILURE'
      : 'SUCCESS';

  // Resolve method: handle 'method', 'paymentMethod', or simulator payload
  let rawMethod = (data?.method || data?.paymentMethod || '').toUpperCase().trim();
  if (!rawMethod || rawMethod === 'ONLINE' || rawMethod === 'SANDBOX' || rawMethod === 'SANDBOX_SIMULATOR' || data?.gateway) {
    rawMethod = 'UPI';
  } else if (rawMethod === 'CARD' || rawMethod === 'CREDIT_CARD' || rawMethod === 'DEBIT_CARD') {
    rawMethod = 'CARD';
  } else if (rawMethod === 'NETBANKING' || rawMethod === 'NET_BANKING') {
    rawMethod = 'NET_BANKING';
  } else if (rawMethod === 'WALLET') {
    rawMethod = 'WALLET';
  }

  const method = (Object.hasOwn(sandboxPaymentMethods, rawMethod) ? rawMethod : 'UPI') as SandboxPaymentMethodKey;

  return { method, outcome };
};

export const makeSandboxPaymentReference = (outcome: string): string => {
  const prefix = outcome === 'SUCCESS' ? 'DUMMY-PAY' : 'DUMMY-FAIL';
  return `${prefix}-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
};
