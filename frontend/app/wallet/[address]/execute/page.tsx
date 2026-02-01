'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGasPrice } from '@/lib/hooks/paymaster/usePaymaster';
import { encodeExecute } from '@/lib/services/bundler/userOpService';
import { Zap, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { Address } from 'viem';

const CHAIN_ID = 8453; // Base
const ENTRY_POINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as const;

function parseValue(value: string): bigint {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  if (trimmed.startsWith('0x')) return BigInt(trimmed);
  return BigInt(trimmed);
}

export default function ExecutePage() {
  const params = useParams();
  const address = params?.address as string | undefined;
  const { data: gasPrice, isLoading: gasLoading } = useGasPrice(CHAIN_ID);

  const [target, setTarget] = useState('');
  const [value, setValue] = useState('0');
  const [data, setData] = useState('0x');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [userOpHash, setUserOpHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecute = async () => {
    if (!address) return;
    setStatus('loading');
    setUserOpHash(null);
    setErrorMessage(null);
    try {
      const resNonce = await fetch(
        `/api/wallet/nonce?sender=${encodeURIComponent(address)}&chainId=${CHAIN_ID}`
      );
      if (!resNonce.ok) {
        const d = await resNonce.json().catch(() => ({}));
        throw new Error(d.error || 'Failed to get nonce');
      }
      const { nonce } = (await resNonce.json()) as { nonce: `0x${string}` };

      const valueWei = parseValue(value);
      const dataHex = data.trim().startsWith('0x') ? (data.trim() as `0x${string}`) : (`0x${data.trim()}` as `0x${string}`);
      const callData = encodeExecute(target as Address, valueWei, dataHex);

      const gas = gasPrice?.standard ?? {
        maxFeePerGas: '0x5b08082fa' as `0x${string}`,
        maxPriorityFeePerGas: '0x12a05f200' as `0x${string}`,
      };

      const partial = {
        sender: address as Address,
        nonce,
        initCode: '0x' as const,
        callData,
        callGasLimit: '0x186a0' as const,
        verificationGasLimit: '0x30d40' as const,
        preVerificationGas: '0xc350' as const,
        maxFeePerGas: gas.maxFeePerGas,
        maxPriorityFeePerGas: gas.maxPriorityFeePerGas,
      };

      const resSponsor = await fetch('/api/paymaster/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userOp: partial,
          entryPoint: ENTRY_POINT,
          chainId: CHAIN_ID,
        }),
      });
      if (!resSponsor.ok) {
        const d = await resSponsor.json().catch(() => ({}));
        throw new Error(d.error || 'Sponsorship failed');
      }
      const sponsor = (await resSponsor.json()) as {
        paymasterAndData: `0x${string}`;
        preVerificationGas?: string;
        verificationGasLimit?: string;
        callGasLimit?: string;
      };

      const withPaymaster = {
        ...partial,
        paymasterAndData: sponsor.paymasterAndData,
        ...(sponsor.preVerificationGas && { preVerificationGas: sponsor.preVerificationGas as `0x${string}` }),
        ...(sponsor.verificationGasLimit && { verificationGasLimit: sponsor.verificationGasLimit as `0x${string}` }),
        ...(sponsor.callGasLimit && { callGasLimit: sponsor.callGasLimit as `0x${string}` }),
      };

      const resExecute = await fetch('/api/bundler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withPaymaster),
      });
      const execData = await resExecute.json().catch(() => ({}));
      if (!resExecute.ok) {
        throw new Error(execData.error || 'Execute failed');
      }
      setUserOpHash(execData.userOpHash ?? null);
      setStatus('success');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Unknown error');
      setStatus('error');
    }
  };

  if (!address) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No wallet address provided.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href={`/wallet/${address}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to wallet
      </Link>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-7 w-7" />
          Execute
        </h1>
        <p className="text-muted-foreground">
          Execute a transaction from this Smart Wallet. Requires SIGNER_PRIVATE_KEY on the server (owner EOA). Gas can be sponsored when paymaster is configured.
        </p>
      </div>

      {gasPrice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paymaster gas price</CardTitle>
            <CardDescription>
              Current gas price from paymaster (standard tier).
            </CardDescription>
          </CardHeader>
          <CardContent className="font-mono text-sm">
            <p>maxFeePerGas: {gasPrice.standard.maxFeePerGas}</p>
            <p>maxPriorityFeePerGas: {gasPrice.standard.maxPriorityFeePerGas}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Execute transaction</CardTitle>
          <CardDescription>
            Call execute(target, value, data) on the Smart Wallet. Target must be a valid address. Value in wei (0 or hex). Data as hex (0x for no calldata).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="target" className="text-sm font-medium">Target address</label>
            <input
              id="target"
              placeholder="0x..."
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="value" className="text-sm font-medium">Value (wei, hex or decimal)</label>
            <input
              id="value"
              placeholder="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="data" className="text-sm font-medium">Calldata (hex)</label>
            <input
              id="data"
              placeholder="0x"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono"
            />
          </div>
          <Button
            onClick={handleExecute}
            disabled={status === 'loading' || gasLoading}
            className="gap-2"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Execute
          </Button>
          {status === 'success' && userOpHash && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>UserOp submitted. Hash: <span className="font-mono break-all">{userOpHash}</span></span>
            </p>
          )}
          {status === 'error' && errorMessage && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Debug &amp; test paymaster</CardTitle>
          <CardDescription>
            Test paymaster connection without executing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/wallet/${address}/debug`}>
            <Button variant="outline">Open debug panel</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
