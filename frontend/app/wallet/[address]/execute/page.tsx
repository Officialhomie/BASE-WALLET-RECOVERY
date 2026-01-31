'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGasPrice } from '@/lib/hooks/paymaster/usePaymaster';
import { Zap, ArrowLeft } from 'lucide-react';

const CHAIN_ID = 8453; // Base

export default function ExecutePage() {
  const params = useParams();
  const address = params?.address as string | undefined;
  const { data: gasPrice, isLoading: gasLoading } = useGasPrice(CHAIN_ID);

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
          Execute transactions from this Smart Wallet. Gas can be sponsored via Pimlico paymaster when configured.
        </p>
      </div>

      {gasPrice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paymaster gas price (Pimlico)</CardTitle>
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
            Build a UserOperation (target, value, data) and submit with optional paymaster sponsorship. Use the Debug page to test paymaster or call contract methods.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Link href={`/wallet/${address}/debug`}>
            <Button>Open debug &amp; test paymaster</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
