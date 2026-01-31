import { NextResponse } from 'next/server';

/**
 * GET /api - List available API endpoints
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return NextResponse.json({
    name: 'Smart Wallet Manager API',
    endpoints: [
      {
        path: '/api/paymaster/sponsor',
        method: 'POST',
        description: 'Request paymaster sponsorship for a UserOperation',
        body: 'userOp (required), entryPoint (optional), chainId (optional)',
      },
      {
        path: '/api/bundler/send',
        method: 'POST',
        description: 'Submit a signed UserOperation to the bundler',
        body: 'userOp (required), entryPoint (optional), chainId (optional)',
      },
    ],
    docs: `${baseUrl}/docs`,
  });
}
