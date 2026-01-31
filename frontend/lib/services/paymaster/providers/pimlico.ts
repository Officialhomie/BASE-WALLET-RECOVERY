/**
 * Pimlico paymaster provider - uses Pimlico v2 API (pm_sponsorUserOperation, etc.)
 */

import type { Address, Hex } from 'viem';
import type {
  PaymasterProvider,
  PimlicoConfig,
  PartialUserOperationV06,
  SponsorshipResponse,
  GasEstimation,
  GasPriceResult,
} from '@/lib/types/paymaster';

/** JSON-RPC request helper */
async function pimlicoRequest<T>(
  url: string,
  method: string,
  params: unknown[]
): Promise<T> {
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
    throw new Error(`Pimlico API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { result?: T; error?: { code: number; message: string; data?: unknown } };
  if (json.error) {
    // #region agent log
    fetch('http://127.0.0.1:7247/ingest/a5f40433-2739-445d-8ac9-120ec920b4df', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'pimlico.ts:pimlicoRequest',
        message: 'Pimlico RPC error full',
        data: { message: json.error.message, code: json.error.code, data: json.error.data },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'PimlicoError',
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(`Pimlico RPC error: ${json.error.message} (${json.error.code})`);
  }
  if (json.result === undefined) {
    throw new Error('Pimlico RPC: missing result');
  }
  return json.result as T;
}

export class PimlicoPaymasterProvider implements PaymasterProvider {
  private readonly url: string;
  private readonly sponsorshipPolicyId?: string;
  private readonly chainId: number;

  constructor(config: PimlicoConfig) {
    const base = config.bundlerUrl.replace(/\/$/, '');
    this.url = base.includes('?') ? `${base}&apikey=${config.apiKey}` : `${base}?apikey=${config.apiKey}`;
    this.sponsorshipPolicyId = config.sponsorshipPolicyId;
    this.chainId = config.chainId;
  }

  async sponsorUserOperation(
    userOp: PartialUserOperationV06,
    entryPoint: Address
  ): Promise<SponsorshipResponse> {
    const params: Record<string, unknown> = {
      sender: userOp.sender,
      nonce: userOp.nonce,
      initCode: userOp.initCode,
      callData: userOp.callData,
      callGasLimit: userOp.callGasLimit,
      verificationGasLimit: userOp.verificationGasLimit,
      preVerificationGas: userOp.preVerificationGas,
      maxFeePerGas: userOp.maxFeePerGas,
      maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
      paymasterAndData: '0x',
      signature: '0x',
    };

    const requestParams: unknown[] = [params, entryPoint];
    if (this.sponsorshipPolicyId) {
      requestParams.push({ sponsorshipPolicyId: this.sponsorshipPolicyId });
    }

    const result = await pimlicoRequest<{
      paymasterAndData: Hex;
      preVerificationGas?: Hex;
      verificationGasLimit?: Hex;
      callGasLimit?: Hex;
    }>(this.url, 'pm_sponsorUserOperation', requestParams);

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
      paymasterAndData: userOp.paymasterAndData ?? '0x',
      signature: '0x',
    };
    const result = await pimlicoRequest<GasEstimation>(
      this.url,
      'eth_estimateUserOperationGas',
      [params, entryPoint]
    );
    return result;
  }

  async getGasPrice(_chainId: number): Promise<GasPriceResult> {
    const result = await pimlicoRequest<{
      slow: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
      standard: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
      fast: { maxFeePerGas: Hex; maxPriorityFeePerGas: Hex };
    }>(this.url, 'pimlico_getUserOperationGasPrice', []);
    return result;
  }
}
