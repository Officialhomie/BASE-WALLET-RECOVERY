'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History, ArrowLeft } from 'lucide-react';

export default function HistoryPage() {
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
    <div className="space-y-8">
      <Link href={`/wallet/${address}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to wallet
      </Link>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <History className="h-7 w-7" />
          Transaction history
        </h1>
        <p className="text-muted-foreground">
          Past transactions and UserOperations for this wallet.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Transaction history can be loaded from a block explorer or indexer. For now, use the block explorer link from the wallet overview.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href={`https://basescan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            View on BaseScan →
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
