'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSmartWallet } from '@/lib/hooks/wallet/useSmartWallet';
import { useOwners } from '@/lib/hooks/wallet/useOwners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress, getBlockExplorerUrl } from '@/lib/utils';
import { Users, Zap, History, Code, ExternalLink } from 'lucide-react';
import type { Address } from 'viem';

export default function WalletOverviewPage() {
  const params = useParams();
  const address = params?.address as string | undefined;
  const walletAddress = (address as Address | undefined) || ('0x' as Address);

  const { ownerCount, entryPoint, implementation, refetchOwnerCount } = useSmartWallet(walletAddress);
  const { owners, isLoading } = useOwners(walletAddress, ownerCount);
  const chainId = 8453; // Base

  if (!address) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No wallet address provided.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Wallet overview</h1>
        <p className="text-muted-foreground">
          Address: {truncateAddress(walletAddress, 8)}
          <a
            href={getBlockExplorerUrl(chainId, 'address', walletAddress)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
          >
            View on explorer <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Owner count</CardTitle>
          </CardHeader>
          <CardContent>
            {ownerCount !== undefined ? (
              <p className="text-2xl font-bold">{ownerCount.toString()}</p>
            ) : (
              <p className="text-muted-foreground">Loading…</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entry point</CardTitle>
          </CardHeader>
          <CardContent>
            {entryPoint ? (
              <p className="font-mono text-xs break-all">{truncateAddress(entryPoint, 6)}</p>
            ) : (
              <p className="text-muted-foreground">Loading…</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            {implementation ? (
              <p className="font-mono text-xs break-all">{truncateAddress(implementation, 6)}</p>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Owners
          </CardTitle>
          <CardDescription>
            Current owners of this Smart Wallet. Add or remove from the Owners page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading owners…</p>
          ) : owners.length === 0 ? (
            <p className="text-muted-foreground">No owners or contract not deployed at this address.</p>
          ) : (
            <ul className="space-y-2">
              {owners.map((owner) => (
                <li key={owner.index} className="flex items-center justify-between rounded-md border p-2 font-mono text-sm">
                  <span>#{owner.index}</span>
                  <span>{owner.address ? truncateAddress(owner.address, 8) : 'Public key'}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <Link href={`/wallet/${walletAddress}/owners`}>
              <Button variant="outline" size="sm">Manage owners</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
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
        <Link href={`/wallet/${walletAddress}/history`}>
          <Button variant="outline" className="gap-2">
            <History className="h-4 w-4" />
            History
          </Button>
        </Link>
        <Link href={`/wallet/${walletAddress}/debug`}>
          <Button variant="outline" className="gap-2">
            <Code className="h-4 w-4" />
            Debug &amp; test paymaster
          </Button>
        </Link>
      </div>
    </div>
  );
}
