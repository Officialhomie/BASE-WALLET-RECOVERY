'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function RemoveOwnerPage() {
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
        <h1 className="text-2xl font-bold">Remove owner</h1>
        <p className="text-muted-foreground">
          Remove an owner at a given index. Use removeOwnerAtIndex(index, ownerBytes). Gas can be sponsored via Pimlico paymaster.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Use the Execute page with paymaster or the Debug panel to call removeOwnerAtIndex. You need the owner bytes from ownerAtIndex(index).
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Link href={`/wallet/${address}/execute`}>
            <Button variant="outline">Execute</Button>
          </Link>
          <Link href={`/wallet/${address}/debug`}>
            <Button variant="outline">Debug panel</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
