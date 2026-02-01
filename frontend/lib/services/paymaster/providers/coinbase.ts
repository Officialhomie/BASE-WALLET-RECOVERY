/**
 * Coinbase CDP paymaster provider (legacy) - uses Coinbase Developer Platform API
 */

import type { Address, Hex } from 'viem';
import type {
  PaymasterProvider,
  CoinbasePaymasterConfig,
  PartialUserOperationV06,
  SponsorshipResponse,
  GasEstimation,
  GasPriceResult,
} from '@/lib/types/paymaster';

/**
 * Coinbase CDP JSON-RPC (paymaster/bundler) uses the Client API Key in the URL path,
 * not Bearer. Secret API Keys require a JWT and are for REST only.
 * @see https://docs.cdp.coinbase.com/get-started/docs/cdp-api-keys
 */
async function coinbaseRequest<T>(
  baseUrl: string,
  apiKey: string,
  method: string,
  params: unknown[]
): Promise<T> {
  const url = apiKey
    ? `${baseUrl.replace(/\/$/, '')}/${apiKey}`
    : baseUrl;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coinbase CDP API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };
  if (json.error) {
    throw new Error(
      `Coinbase CDP RPC error: ${json.error.message} (${json.error.code})`
    );
  }
  if (json.result === undefined) {
    throw new Error('Coinbase CDP RPC: missing result');
  }
  return json.result as T;
}

/**
 * Coinbase CDP does not expose pimlico_getUserOperationGasPrice.
 * We return standard/fast/slow with same values from a default.
 */
function defaultGasPrice(): GasPriceResult {
  const maxFee = '0x5b08082fa' as Hex; // ~24.5 gwei
  const maxPriority = '0x12a05f200' as Hex; // 5 gwei
  return {
    slow: { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority },
    standard: { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority },
    fast: { maxFeePerGas: maxFee, maxPriorityFeePerGas: maxPriority },
  };
}

export class CoinbasePaymasterProvider implements PaymasterProvider {
  private readonly paymasterUrl: string;
  private readonly apiKey: string;
  private readonly chainId: number;

  constructor(config: CoinbasePaymasterConfig) {
    this.paymasterUrl = config.paymasterUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.chainId = config.chainId;
  }

  async sponsorUserOperation(
    userOp: PartialUserOperationV06,
    entryPoint: Address
  ): Promise<SponsorshipResponse> {
    const params = {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      callGasLimit: userOp.callGasLimit,
      verificationGasLimit: userOp.verificationGasLimit,
      preVerificationGas: userOp.preVerificationGas,
      maxFeePerGas: userOp.maxFeePerGas,
      maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
      paymasterAndData: '0x' as Hex,
      signature: '0x' as Hex,
    };

    const result = await coinbaseRequest<{
      paymasterAndData: Hex;
      preVerificationGas?: Hex;
      verificationGasLimit?: Hex;
      callGasLimit?: Hex;
    }>(this.paymasterUrl, this.apiKey, 'pm_sponsorUserOperation', [
      params,
      entryPoint,
    ]);

    return {
      paymasterAndData: result.paymasterAndData,
      preVerificationGas: result.preVerificationGas,
      verificationGasLimit: result.verificationGasLimit,
      callGasLimit: result.callGasLimit,
    };
  }

  async estimateUserOperationGas(
    userOp: PartialUserOperationV06,
    entryPoint: Address
  ): Promise<GasEstimation> {
    const params = {
      ...userOp,
      paymasterAndData: userOp.paymasterAndData ?? ('0x' as Hex),
      signature: '0x' as Hex,
    };
    const result = await coinbaseRequest<GasEstimation>(
      this.paymasterUrl,
      this.apiKey,
      'eth_estimateUserOperationGas',
      [params, entryPoint]
    );
    return result;
  }

  async getGasPrice(_chainId: number): Promise<GasPriceResult> {
    return defaultGasPrice();
  }
}
