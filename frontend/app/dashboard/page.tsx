'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Wallet, Users, Zap, History, Code, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <Wallet className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Connect your wallet</h1>
          <p className="text-muted-foreground max-w-md">
            Connect an EOA (e.g. MetaMask, Coinbase Wallet) to view and manage your Smart Wallet.
            If you don&apos;t have a Smart Wallet yet, you can create one from the wallet flow.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the Connect button in the header to connect.
        </p>
        <Link href="/wallet/connect">
          <Button size="lg" className="gap-2">
            Go to Connect
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // For now we use the connected EOA address as the "selected" wallet.
  // In a full flow you might have a list of smart wallets owned by this EOA.
  const walletAddress = address;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your wallet. Use the address below to view a Smart Wallet (if this is your owner address).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href={`/wallet/${walletAddress}`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                View wallet overview and details
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/wallet/${walletAddress}/owners`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add or remove owners
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/wallet/${walletAddress}/execute`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execute</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Execute transactions (paymaster supported)
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href={`/wallet/${walletAddress}/history`}>
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">History</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Transaction history
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>
            Open the wallet page to manage owners, execute transactions, or use the debug panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={`/wallet/${walletAddress}`}>
            <Button variant="outline" className="gap-2">
              <Wallet className="h-4 w-4" />
              Wallet overview
            </Button>
          </Link>
          <Link href={`/wallet/${walletAddress}/owners`}>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              Owners
            </Button>
          </Link>
          <Link href={`/wallet/${walletAddress}/execute`}>
            <Button variant="outline" className="gap-2">
              <Zap className="h-4 w-4" />
              Execute
            </Button>
          </Link>
          <Link href={`/wallet/${walletAddress}/debug`}>
            <Button variant="outline" className="gap-2">
              <Code className="h-4 w-4" />
              Debug &amp; test paymaster
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
