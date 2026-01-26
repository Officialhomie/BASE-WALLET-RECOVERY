import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ArrowRight, Wallet, Shield, Zap, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Smart Wallet Manager</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <ConnectButton />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container flex flex-col items-center justify-center gap-8 py-24 md:py-32">
          <div className="flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Manage Your{' '}
              <span className="gradient-text">Smart Wallet</span>
              <br />
              With Confidence
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Full-stack platform for managing Coinbase Smart Wallets. Add owners, execute transactions,
              and monitor your wallet with enterprise-grade tools.
            </p>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/wallet/connect">
                <Button size="lg" variant="outline">
                  Connect Wallet
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-24">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Wallet className="h-8 w-8 text-primary" />
                <CardTitle>Owner Management</CardTitle>
                <CardDescription>
                  Add, remove, and manage wallet owners with ease
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Add address or public key owners</li>
                  <li>• Remove compromised owners</li>
                  <li>• Verify ownership on-chain</li>
                  <li>• Import/export owner lists</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Execute Transactions</CardTitle>
                <CardDescription>
                  Execute single or batch transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Single transaction execution</li>
                  <li>• Batch operations builder</li>
                  <li>• Gas estimation & simulation</li>
                  <li>• Paymaster integration</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Monitor all wallet activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Complete transaction history</li>
                  <li>• Event log viewer</li>
                  <li>• Export to CSV/JSON</li>
                  <li>• Real-time updates</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Code className="h-8 w-8 text-primary" />
                <CardTitle>Developer Tools</CardTitle>
                <CardDescription>
                  Advanced debugging and testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Contract debugger</li>
                  <li>• Function caller UI</li>
                  <li>• Live event monitoring</li>
                  <li>• State inspector</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-24">
          <div className="flex flex-col items-center gap-4 rounded-lg bg-muted p-12 text-center">
            <h2 className="text-3xl font-bold">Ready to get started?</h2>
            <p className="max-w-[600px] text-muted-foreground">
              Connect your wallet and start managing your Coinbase Smart Wallet today.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Launch Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="h-4 w-4" />
            <span>Smart Wallet Manager © 2024</span>
          </div>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/docs" className="hover:text-foreground">
              Documentation
            </Link>
            <Link href="/api" className="hover:text-foreground">
              API
            </Link>
            <Link href="https://github.com" className="hover:text-foreground">
              GitHub
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
