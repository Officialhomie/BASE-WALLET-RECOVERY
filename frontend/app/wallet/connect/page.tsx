'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function WalletConnectPage() {
  const router = useRouter();

  return (
    <div className="container max-w-lg py-16">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            <CardTitle>Connect Wallet</CardTitle>
          </div>
          <CardDescription>
            Connect your EOA (MetaMask, Coinbase Wallet, etc.) to manage Smart Wallets.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <ConnectButton />
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
