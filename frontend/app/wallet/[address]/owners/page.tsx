'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSmartWallet } from '@/lib/hooks/wallet/useSmartWallet';
import { useOwners } from '@/lib/hooks/wallet/useOwners';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { truncateAddress } from '@/lib/utils';
import { Users, Plus, UserMinus } from 'lucide-react';
import type { Address } from 'viem';

export default function OwnersPage() {
  const params = useParams();
  const address = params?.address as string | undefined;
  const walletAddress = (address as Address | undefined) || ('0x' as Address);

  const { ownerCount } = useSmartWallet(walletAddress);
  const { owners, isLoading } = useOwners(walletAddress, ownerCount);

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
        <h1 className="text-2xl font-bold">Owners</h1>
        <p className="text-muted-foreground">
          Add or remove owners for this Smart Wallet.
        </p>
      </div>

      <div className="flex gap-2">
        <Link href={`/wallet/${walletAddress}/owners/add`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add owner
          </Button>
        </Link>
        <Link href={`/wallet/${walletAddress}/owners/remove`}>
          <Button variant="outline" className="gap-2">
            <UserMinus className="h-4 w-4" />
            Remove owner
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current owners ({owners.length})
          </CardTitle>
          <CardDescription>
            Only owners can add or remove other owners. Removing requires signing a UserOperation (can use paymaster).
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
                <li key={owner.index} className="flex items-center justify-between rounded-md border p-3 font-mono text-sm">
                  <span className="text-muted-foreground">Index {owner.index}</span>
                  <span>{owner.address ? truncateAddress(owner.address, 10) : 'Public key (64 bytes)'}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
