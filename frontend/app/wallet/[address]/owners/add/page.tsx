'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function AddOwnerPage() {
  const params = useParams();
  const address = params?.address as string | undefined;

  if (!address) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No wallet address provided.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl">
      <Link href={`/wallet/${address}/owners`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to owners
      </Link>
      <div>
        <h1 className="text-2xl font-bold">Add owner</h1>
        <p className="text-muted-foreground">
          Add a new owner (address or public key) to this Smart Wallet. This requires a transaction from an existing owner.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Use the contract debug panel or execute flow to call addOwnerAddress / addOwnerPublicKey with the wallet ABI.
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
