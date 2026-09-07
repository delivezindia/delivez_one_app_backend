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
  const data = value as { method?: string; outcome?: string } | null;
  const method = data?.method as SandboxPaymentMethodKey;
  const outcome = data?.outcome ?? 'SUCCESS';

  if (!method || !Object.hasOwn(sandboxPaymentMethods, method)) {
    throw new AppError({
      message: 'Select a valid sandbox payment method.',
      statusCode: 400,
      code: 'INVALID_PAYMENT_METHOD',
      details: { field: 'method' },
    });
  }

  if (outcome !== 'SUCCESS' && outcome !== 'FAILURE') {
    throw new AppError({
      message: 'Sandbox payment outcome must be SUCCESS or FAILURE.',
      statusCode: 400,
      code: 'INVALID_PAYMENT_OUTCOME',
      details: { field: 'outcome' },
    });
  }

  return { method, outcome };
};

export const makeSandboxPaymentReference = (outcome: string): string => {
  const prefix = outcome === 'SUCCESS' ? 'DUMMY-PAY' : 'DUMMY-FAIL';
  return `${prefix}-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
};
