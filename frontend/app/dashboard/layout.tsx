import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard" className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="font-semibold">Dashboard</span>
            </Link>
          </div>
          <ConnectButton />
        </div>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}
