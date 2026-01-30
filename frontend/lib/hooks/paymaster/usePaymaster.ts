'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import type { Address, Hex } from 'viem';
import { createPaymasterClient } from '@/lib/services/paymaster/paymasterClient';
import { getPaymasterConfig } from '@/lib/config/paymaster';
import type {
  GasPriceResult,
  GasEstimation,
  SponsorshipResponse,
  PartialUserOperationV06,
} from '@/lib/types/paymaster';

/**
 * Get current gas price from the configured paymaster (e.g. Pimlico).
 */
export function useGasPrice(chainId: number) {
  return useQuery({
    queryKey: ['paymaster', 'gasPrice', chainId],
    queryFn: async (): Promise<GasPriceResult> => {
      const config = getPaymasterConfig(chainId);
      const paymaster = createPaymasterClient(config);
      return paymaster.getGasPrice(chainId);
    },
    enabled: !!chainId,
  });
}

/**
 * Check if sponsorship is available for a partial UserOperation.
 */
export function useSponsorshipCheck(
  userOp: PartialUserOperationV06 | null,
  entryPoint: Address,
  chainId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['paymaster', 'sponsorshipCheck', userOp?.sender, userOp?.nonce, chainId],
    queryFn: async (): Promise<SponsorshipResponse | null> => {
      if (!userOp) return null;
      const config = getPaymasterConfig(chainId);
      const paymaster = createPaymasterClient(config);
      return paymaster.sponsorUserOperation(userOp, entryPoint);
    },
    enabled: enabled && !!userOp && !!chainId,
  });
}

/**
 * Estimate gas for a partial UserOperation.
 */
export function useGasEstimate(
  userOp: PartialUserOperationV06 | null,
  entryPoint: Address,
  chainId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['paymaster', 'gasEstimate', userOp?.sender, userOp?.nonce, chainId],
    queryFn: async (): Promise<GasEstimation> => {
      if (!userOp) throw new Error('No userOp');
      const config = getPaymasterConfig(chainId);
      const paymaster = createPaymasterClient(config);
      return paymaster.estimateUserOperationGas(userOp, entryPoint);
    },
    enabled: enabled && !!userOp && !!chainId,
  });
}

/**
 * Request sponsorship (mutation) - useful when building a UserOp step-by-step.
 */
export function useRequestSponsorship(chainId: number) {
  return useMutation({
    mutationFn: async (params: {
      userOp: PartialUserOperationV06;
      entryPoint?: Address;
    }): Promise<SponsorshipResponse> => {
      const config = getPaymasterConfig(chainId);
      const paymaster = createPaymasterClient(config);
      const entryPoint = params.entryPoint ?? config.entryPoint;
      return paymaster.sponsorUserOperation(params.userOp, entryPoint);
    },
  });
}
