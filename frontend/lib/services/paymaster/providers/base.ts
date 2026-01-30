/**
 * Paymaster provider abstraction - re-export interface and base contract
 */

import type { Address } from 'viem';
import type {
  PaymasterProvider,
  PartialUserOperationV06,
  SponsorshipResponse,
  GasEstimation,
  GasPriceResult,
} from '@/lib/types/paymaster';

export type {
  PaymasterProvider,
  PartialUserOperationV06,
  SponsorshipResponse,
  GasEstimation,
  GasPriceResult,
};

/**
 * Contract that all paymaster providers must implement.
 * Use this interface when injecting or switching providers.
 */
export const PAYMASTER_PROVIDER_METHODS = [
  'sponsorUserOperation',
  'estimateUserOperationGas',
  'getGasPrice',
] as const;

/** Type guard to ensure an object implements PaymasterProvider */
export function isPaymasterProvider(
  value: unknown
): value is PaymasterProvider {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.sponsorUserOperation === 'function' &&
    typeof o.estimateUserOperationGas === 'function' &&
    typeof o.getGasPrice === 'function'
  );
}
