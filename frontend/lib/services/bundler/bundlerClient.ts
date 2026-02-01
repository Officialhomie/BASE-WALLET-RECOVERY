/**
 * Bundler client - eth_sendUserOperation, eth_getUserOperationReceipt, eth_getUserOperationByHash
 */

import type { Address, Hex } from 'viem';
import type { UserOperationV06 } from '@/lib/types/paymaster';

async function bundlerRequest<T>(
  url: string,
  method: string,
  params: unknown[],
  headers: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bundler API error ${res.status}: ${text}`);
  }
  const json = (await res.json()) as {
    result?: T;
    error?: { code: number; message: string };
  };
  if (json.error) {
    throw new Error(
      `Bundler RPC error: ${json.error.message} (${json.error.code})`
    );
  }
  if (json.result === undefined) {
    throw new Error('Bundler RPC: missing result');
  }
  return json.result as T;
}

export interface BundlerConfig {
  bundlerUrl: string;
  /** Optional: for Pimlico, API key in URL; for Coinbase CDP, use Bearer in Authorization header */
  apiKey?: string;
  /** Use Bearer token (for Coinbase CDP). When true, apiKey is not appended to URL. */
  useBearerAuth?: boolean;
}

export interface UserOperationReceipt {
  userOpHash: Hex;
  entryPoint: Address;
  sender: Address;
  nonce: Hex;
  paymaster?: Address;
  actualGasCost: Hex;
  actualGasUsed: Hex;
  success: boolean;
  reason?: string;
  logs: unknown[];
  receipt: {
    blockHash: Hex;
    blockNumber: Hex;
    transactionHash: Hex;
    gasUsed: Hex;
  };
}

export class BundlerClient {
  private readonly url: string;
  private readonly authHeaders: Record<string, string>;

  constructor(config: BundlerConfig) {
    let u = config.bundlerUrl.replace(/\/$/, '');
    const isCoinbaseRpc =
      config.bundlerUrl.includes('coinbase') || config.bundlerUrl.includes('developer.coinbase.com');
    // Coinbase CDP JSON-RPC uses Client API Key in the URL path, not Bearer.
    if (config.apiKey && isCoinbaseRpc && !config.useBearerAuth) {
      u = `${u}/${config.apiKey}`;
      this.authHeaders = {};
    } else if (config.apiKey && config.useBearerAuth) {
      this.authHeaders = { Authorization: `Bearer ${config.apiKey}` };
    } else if (config.apiKey && !u.includes('apikey=')) {
      u = u.includes('?') ? `${u}&apikey=${config.apiKey}` : `${u}?apikey=${config.apiKey}`;
      this.authHeaders = {};
    } else {
      this.authHeaders = {};
    }
    this.url = u;
  }

  async sendUserOperation(
    userOp: UserOperationV06,
    entryPoint: Address
  ): Promise<Hex> {
    return bundlerRequest<Hex>(
      this.url,
      'eth_sendUserOperation',
      [userOp, entryPoint],
      this.authHeaders
    );
  }

  async getUserOperationReceipt(
    userOpHash: Hex,
    entryPoint: Address
  ): Promise<UserOperationReceipt | null> {
    const result = await bundlerRequest<UserOperationReceipt | null>(
      this.url,
      'eth_getUserOperationReceipt',
      [userOpHash, entryPoint],
      this.authHeaders
    );
    return result;
  }

  async getUserOperationByHash(
    userOpHash: Hex
  ): Promise<{ userOperation: UserOperationV06; entryPoint: Address } | null> {
    const result = await bundlerRequest<{
      userOperation: UserOperationV06;
      entryPoint: Address;
    } | null>(this.url, 'eth_getUserOperationByHash', [userOpHash], this.authHeaders);
    return result;
  }
}
