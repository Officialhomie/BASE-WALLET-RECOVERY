import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Providers } from './providers';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Smart Wallet Manager',
    template: '%s | Smart Wallet Manager',
  },
  description: 'Full-stack platform for managing Coinbase Smart Wallets',
  keywords: [
    'Smart Wallet',
    'Coinbase',
    'Base',
    'ERC-4337',
    'Account Abstraction',
    'Web3',
  ],
  authors: [
    {
      name: 'Smart Wallet Team',
    },
  ],
  creator: 'Smart Wallet Manager',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Smart Wallet Manager',
    description: 'Full-stack platform for managing Coinbase Smart Wallets',
    siteName: 'Smart Wallet Manager',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Wallet Manager',
    description: 'Full-stack platform for managing Coinbase Smart Wallets',
    creator: '@smartwallet',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
