import { NextResponse } from 'next/server';
import { createPaymasterClient } from '@/lib/services/paymaster/paymasterClient';
import type { Address } from 'viem';
import type { PartialUserOperationV06 } from '@/lib/types/paymaster';

const ENTRY_POINT_V06: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

function getPaymasterConfigFromEnv(chainId: number) {
  const provider = (process.env.NEXT_PUBLIC_PAYMASTER_PROVIDER ?? 'pimlico') as 'pimlico' | 'coinbase';
  return {
    provider,
    entryPoint: ENTRY_POINT_V06,
    chainId,
    pimlico: {
      apiKey: process.env.PIMLICO_API_KEY ?? process.env.NEXT_PUBLIC_PIMLICO_API_KEY ?? '',
      bundlerUrl:
        process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL ??
        `https://api.pimlico.io/v2/${chainId}/rpc`,
      sponsorshipPolicyId: process.env.NEXT_PUBLIC_PIMLICO_SPONSORSHIP_POLICY_ID,
      chainId,
    },
    coinbase: {
      paymasterUrl: process.env.NEXT_PUBLIC_COINBASE_PAYMASTER_URL ?? '',
      bundlerUrl: process.env.NEXT_PUBLIC_COINBASE_BUNDLER_URL ?? '',
      apiKey: process.env.CDP_API_KEY ?? '',
      chainId,
    },
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userOp, entryPoint, chainId } = body as {
      userOp: PartialUserOperationV06;
      entryPoint?: Address;
      chainId?: number;
    };

    if (!userOp?.sender || !userOp?.nonce || !userOp?.callData) {
      return NextResponse.json(
        { error: 'Missing required fields: userOp.sender, userOp.nonce, userOp.callData' },
        { status: 400 }
      );
    }

    const chain = chainId ?? 8453;
    const config = getPaymasterConfigFromEnv(chain);
    const paymaster = createPaymasterClient(config);
    const ep = entryPoint ?? config.entryPoint;

    const result = await paymaster.sponsorUserOperation(userOp, ep);

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sponsorship failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
