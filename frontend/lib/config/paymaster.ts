/**
 * Centralized paymaster configuration from env
 */

import type { Address } from 'viem';
import type { PaymasterConfig, PaymasterProviderName } from '@/lib/types/paymaster';

const ENTRY_POINT_V06: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

const BASE_CHAIN_ID = 8453;
const BASE_SEPOLIA_CHAIN_ID = 84532;

export function getPaymasterConfig(chainId: number = BASE_CHAIN_ID): PaymasterConfig {
  const provider = (process.env.NEXT_PUBLIC_PAYMASTER_PROVIDER ?? 'pimlico') as PaymasterProviderName;
  const pimlicoApiKey = process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? '';
  const pimlicoBundlerUrl =
    process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL ??
    `https://api.pimlico.io/v2/${chainId}/rpc`;
  const pimlicoPolicyId = process.env.NEXT_PUBLIC_PIMLICO_SPONSORSHIP_POLICY_ID;
  const coinbasePaymasterUrl = process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL ?? '';
  const coinbaseBundlerUrl = process.env.NEXT_PUBLIC_COINBASE_BUNDLER_URL ?? '';
  const cdpApiKey = process.env.CDP_API_KEY ?? '';

  return {
    provider,
    entryPoint: ENTRY_POINT_V06,
    chainId,
    pimlico: {
      apiKey: pimlicoApiKey,
      bundlerUrl: pimlicoBundlerUrl,
      sponsorshipPolicyId: pimlicoPolicyId,
      chainId,
    },
    coinbase: {
      paymasterUrl: coinbasePaymasterUrl,
      bundlerUrl: coinbaseBundlerUrl,
      apiKey: cdpApiKey,
      chainId,
    },
  };
}

export { ENTRY_POINT_V06, BASE_CHAIN_ID, BASE_SEPOLIA_CHAIN_ID };
