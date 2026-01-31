'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGasPrice } from '@/lib/hooks/paymaster/usePaymaster';
import { getPaymasterConfig } from '@/lib/config/paymaster';
import { Code, ArrowLeft, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { Address } from 'viem';

const CHAIN_ID = 8453; // Base
const ENTRY_POINT = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789' as const;

export default function DebugPage() {
  const params = useParams();
  const address = params?.address as string | undefined;
  const walletAddress = address as Address | undefined;
  const [sponsorTestResult, setSponsorTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const { data: gasPrice, isLoading: gasLoading } = useGasPrice(CHAIN_ID);
  const config = typeof window !== 'undefined' ? getPaymasterConfig(CHAIN_ID) : null;

  const testPaymasterConnection = async () => {
    if (!walletAddress) return;
    setSponsorTestResult({ status: 'loading' });
    try {
      const dummyUserOp = {
        sender: walletAddress,
        nonce: '0x0',
        initCode: '0x',
        callData: '0x51945447' as `0x${string}`, // execute selector placeholder
        callGasLimit: '0x186a0',
        verificationGasLimit: '0x30d40',
        preVerificationGas: '0xc350',
        maxFeePerGas: '0x5b08082fa',
        maxPriorityFeePerGas: '0x12a05f200',
      };
      const res = await fetch('/api/paymaster/sponsor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userOp: dummyUserOp,
          entryPoint: ENTRY_POINT,
          chainId: CHAIN_ID,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSponsorTestResult({
          status: 'error',
          message: data.error || res.statusText || 'Request failed',
        });
        return;
      }
      if (data.paymasterAndData && data.paymasterAndData !== '0x') {
        setSponsorTestResult({
          status: 'success',
          message: `Paymaster OK. paymasterAndData length: ${(data.paymasterAndData as string).length} chars`,
        });
      } else {
        setSponsorTestResult({
          status: 'success',
          message: 'Paymaster responded but no sponsorship (policy or balance?). Check dashboard.',
        });
      }
    } catch (e) {
      setSponsorTestResult({
        status: 'error',
        message: e instanceof Error ? e.message : 'Network or client error',
      });
    }
  };

  if (!walletAddress) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No wallet address provided.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <Link href={`/wallet/${walletAddress}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to wallet
      </Link>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Code className="h-7 w-7" />
          Debug &amp; test paymaster
        </h1>
        <p className="text-muted-foreground">
          Verify Pimlico (or Coinbase) paymaster connection and gas prices. Run a sponsorship test against the API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Paymaster config
          </CardTitle>
          <CardDescription>
            Current provider and chain from env (NEXT_PUBLIC_PAYMASTER_PROVIDER, chainId).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 font-mono text-sm">
          <p>Provider: {config?.provider ?? '—'}</p>
          <p>Chain ID: {CHAIN_ID}</p>
          <p>Entry point: {ENTRY_POINT}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gas price (from paymaster)</CardTitle>
          <CardDescription>
            pimlico_getUserOperationGasPrice result. Only available when using Pimlico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gasLoading ? (
            <p className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </p>
          ) : gasPrice ? (
            <div className="font-mono text-sm space-y-1">
              <p>Slow: maxFee={gasPrice.slow.maxFeePerGas} priority={gasPrice.slow.maxPriorityFeePerGas}</p>
              <p>Standard: maxFee={gasPrice.standard.maxFeePerGas} priority={gasPrice.standard.maxPriorityFeePerGas}</p>
              <p>Fast: maxFee={gasPrice.fast.maxFeePerGas} priority={gasPrice.fast.maxPriorityFeePerGas}</p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Not available. Set NEXT_PUBLIC_PIMLICO_API_KEY and NEXT_PUBLIC_PIMLICO_BUNDLER_URL for Pimlico.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Test paymaster connection</CardTitle>
          <CardDescription>
            Calls POST /api/paymaster/sponsor with a dummy UserOp for this wallet. Verifies API key and paymaster endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={testPaymasterConnection}
            disabled={sponsorTestResult.status === 'loading'}
            className="gap-2"
          >
            {sponsorTestResult.status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Test paymaster
          </Button>
          {sponsorTestResult.status === 'success' && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {sponsorTestResult.message}
            </p>
          )}
          {sponsorTestResult.status === 'error' && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {sponsorTestResult.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How to test a full sponsored flow</CardTitle>
          <CardDescription>
            To run a real sponsored UserOperation you need to: 1) Build partial UserOp (nonce, callData, gas), 2) Call /api/paymaster/sponsor to get paymasterAndData, 3) Compute UserOp hash and sign with the Smart Wallet owner, 4) POST /api/bundler/send with the signed UserOp. The useExecuteUserOp hook in the app does this when you provide a signUserOp function (e.g. from a custom signer or backend).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
