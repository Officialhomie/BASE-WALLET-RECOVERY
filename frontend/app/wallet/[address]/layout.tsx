import Link from 'next/link';
import { Wallet, Users, Zap, History, Code, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function WalletLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <nav className="flex items-center gap-1">
              <Link href={`/wallet/${address}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Wallet className="h-4 w-4" />
                  Overview
                </Button>
              </Link>
              <Link href={`/wallet/${address}/owners`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Owners
                </Button>
              </Link>
              <Link href={`/wallet/${address}/execute`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Zap className="h-4 w-4" />
                  Execute
                </Button>
              </Link>
              <Link href={`/wallet/${address}/history`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <History className="h-4 w-4" />
                  History
                </Button>
              </Link>
              <Link href={`/wallet/${address}/debug`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Code className="h-4 w-4" />
                  Debug
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
