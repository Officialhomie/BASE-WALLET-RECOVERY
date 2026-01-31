import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Code, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Documentation',
  description: 'Smart Wallet Manager documentation and API reference',
};

export default function DocsPage() {
  return (
    <div className="container max-w-3xl py-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <h1 className="text-3xl font-bold mb-2">Documentation</h1>
      <p className="text-muted-foreground mb-8">
        Guides and API reference for the Smart Wallet Manager.
      </p>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Getting started
            </CardTitle>
            <CardDescription>
              Connect your wallet from the Dashboard or Connect page. Use the wallet address (EOA or Smart Wallet) to view owners, execute transactions, and use the debug panel.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API endpoints
            </CardTitle>
            <CardDescription>
              Server-side API routes for paymaster and bundler (keeps API keys secure).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md bg-muted p-3 font-mono text-sm">
              <p className="font-semibold">POST /api/paymaster/sponsor</p>
              <p className="text-muted-foreground text-xs mt-1">
                Body: &#123; userOp, entryPoint?, chainId? &#125; → returns paymasterAndData and gas fields
              </p>
            </div>
            <div className="rounded-md bg-muted p-3 font-mono text-sm">
              <p className="font-semibold">POST /api/bundler/send</p>
              <p className="text-muted-foreground text-xs mt-1">
                Body: &#123; userOp, entryPoint?, chainId? &#125; → returns &#123; userOpHash &#125;
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testing the paymaster</CardTitle>
            <CardDescription>
              Connect your wallet, go to Dashboard, then open the wallet address. Go to Debug and click &quot;Test paymaster&quot; to verify Pimlico (or Coinbase) sponsorship. Set NEXT_PUBLIC_PIMLICO_API_KEY and NEXT_PUBLIC_PIMLICO_BUNDLER_URL in .env.local (or PIMLICO_API_KEY for server-only API routes).
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              External docs
            </CardTitle>
            <CardDescription>
              Pimlico and ERC-4337 documentation.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <a
              href="https://docs.pimlico.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Pimlico Docs
            </a>
            <a
              href="https://eips.ethereum.org/EIPS/eip-4337"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              ERC-4337 (Account Abstraction)
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
