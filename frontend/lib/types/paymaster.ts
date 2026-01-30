/**
 * Paymaster and UserOperation type definitions for ERC-4337 v0.6
 */

import type { Address, Hex } from 'viem';

/** ERC-4337 v0.6 UserOperation (unpacked) */
export interface UserOperationV06 {
  sender: Address;
  nonce: Hex;
  initCode: Hex;
  callData: Hex;
  callGasLimit: Hex;
  verificationGasLimit: Hex;
  preVerificationGas: Hex;
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
  paymasterAndData: Hex;
  signature: Hex;
}

/** Partial UserOp without signature and optionally without paymaster data (for sponsorship request) */
export interface PartialUserOperationV06 {
  sender: Address;
  nonce: Hex;
  initCode: Hex;
  callData: Hex;
  callGasLimit: Hex;
  verificationGasLimit: Hex;
  preVerificationGas: Hex;
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
  paymasterAndData?: Hex;
}

/** Gas estimation result from bundler/paymaster */
export interface GasEstimation {
  callGasLimit: Hex;
  verificationGasLimit: Hex;
  preVerificationGas: Hex;
}

/** Gas price result (e.g. from pimlico_getUserOperationGasPrice) */
export interface GasPriceResult {
  slow: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
  standard: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
  fast: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
}

/** Sponsorship request (partial UserOp sent to paymaster) */
export type SponsorshipRequest = PartialUserOperationV06;

/** Sponsorship response - paymaster data and optionally updated gas fields */
export interface SponsorshipResponse {
  paymasterAndData: Hex;
  preVerificationGas?: Hex;
  verificationGasLimit?: Hex;
  callGasLimit?: Hex;
}

/** Paymaster provider name */
export type PaymasterProviderName = 'pimlico' | 'coinbase';

/** Abstract interface for paymaster providers */
export interface PaymasterProvider {
  sponsorUserOperation(
    userOp: PartialUserOperationV06,
    entryPoint: Address
  ): Promise<SponsorshipResponse>;
  estimateUserOperationGas(
    userOp: PartialUserOperationV06,
    entryPoint: Address
  ): Promise<GasEstimation>;
  getGasPrice(chainId: number): Promise<GasPriceResult>;
}

/** Pimlico-specific configuration */
export interface PimlicoConfig {
  apiKey: string;
  bundlerUrl: string;
  sponsorshipPolicyId?: string;
  chainId: number;
}

/** Coinbase CDP-specific configuration */
export interface CoinbasePaymasterConfig {
  paymasterUrl: string;
  bundlerUrl: string;
  apiKey: string;
  chainId: number;
}

/** Top-level paymaster configuration */
export interface PaymasterConfig {
  provider: PaymasterProviderName;
  pimlico?: PimlicoConfig;
  coinbase?: CoinbasePaymasterConfig;
  entryPoint: Address;
  chainId: number;
}
