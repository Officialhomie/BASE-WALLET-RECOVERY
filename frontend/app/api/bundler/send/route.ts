import { NextResponse } from 'next/server';
import { BundlerClient } from '@/lib/services/bundler/bundlerClient';
import type { Address } from 'viem';
import type { UserOperationV06 } from '@/lib/types/paymaster';

const ENTRY_POINT_V06: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

function getBundlerConfigFromEnv(chainId: number) {
  const provider = process.env.NEXT_PUBLIC_PAYMASTER_PROVIDER ?? 'pimlico';
  if (provider === 'pimlico') {
    const url =
      process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL ??
      `https://api.pimlico.io/v2/${chainId}/rpc`;
    const apiKey =
      process.env.PIMLICO_API_KEY ?? process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? '';
    return { bundlerUrl: url, apiKey };
  }
  const url = process.env.NEXT_PUBLIC_COINBASE_BUNDLER_URL ?? '';
  const apiKey = process.env.CDP_API_KEY ?? '';
  return { bundlerUrl: url, apiKey };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userOp, entryPoint, chainId } = body as {
      userOp: UserOperationV06;
      entryPoint?: Address;
      chainId?: number;
    };

    if (!userOp?.sender || !userOp?.signature) {
      return NextResponse.json(
        { error: 'Missing required fields: userOp.sender, userOp.signature' },
        { status: 400 }
      );
    }

    const chain = chainId ?? 8453;
    const config = getBundlerConfigFromEnv(chain);
    const bundler = new BundlerClient(config);
    const ep = entryPoint ?? ENTRY_POINT_V06;

    const userOpHash = await bundler.sendUserOperation(userOp, ep);

    return NextResponse.json({ userOpHash });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bundler send failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
