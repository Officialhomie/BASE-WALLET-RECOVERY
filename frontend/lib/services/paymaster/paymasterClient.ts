/**
 * Paymaster client factory - returns the appropriate provider based on config
 */

import type { PaymasterConfig, PaymasterProvider, PaymasterProviderName } from '@/lib/types/paymaster';
import { PimlicoPaymasterProvider } from './providers/pimlico';
import { CoinbasePaymasterProvider } from './providers/coinbase';

const ENTRY_POINT_V06 = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as const;

export function createPaymasterClient(config: PaymasterConfig): PaymasterProvider {
  const provider = (config.provider ?? 'pimlico') as PaymasterProviderName;

  switch (provider) {
    case 'pimlico': {
      const pimlico = config.pimlico;
      if (!pimlico?.apiKey || !pimlico?.bundlerUrl) {
        throw new Error(
          'Pimlico paymaster requires pimlico.apiKey and pimlico.bundlerUrl in config'
        );
      }
      return new PimlicoPaymasterProvider({
        apiKey: pimlico.apiKey,
        bundlerUrl: pimlico.bundlerUrl,
        sponsorshipPolicyId: pimlico.sponsorshipPolicyId,
        chainId: config.chainId ?? pimlico.chainId,
      });
    }
    case 'coinbase': {
      const coinbase = config.coinbase;
      if (!coinbase?.apiKey || !coinbase?.paymasterUrl) {
        throw new Error(
          'Coinbase paymaster requires coinbase.apiKey and coinbase.paymasterUrl in config'
        );
      }
      return new CoinbasePaymasterProvider({
        paymasterUrl: coinbase.paymasterUrl,
        bundlerUrl: coinbase.bundlerUrl,
        apiKey: coinbase.apiKey,
        chainId: config.chainId ?? coinbase.chainId,
      });
    }
    default:
      if (config.pimlico?.apiKey && config.pimlico?.bundlerUrl) {
        return new PimlicoPaymasterProvider({
          apiKey: config.pimlico.apiKey,
          bundlerUrl: config.pimlico.bundlerUrl,
          sponsorshipPolicyId: config.pimlico.sponsorshipPolicyId,
          chainId: config.chainId ?? config.pimlico.chainId,
        });
      }
      throw new Error(
        `Unknown paymaster provider: ${provider}. Use "pimlico" or "coinbase".`
      );
  }
}

export { ENTRY_POINT_V06 };
