import { NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { entryPoint06Address, entryPoint06Abi } from 'viem/account-abstraction';
import type { Address } from 'viem';

const ENTRY_POINT = entryPoint06Address;

function getRpcUrl(chainId: number): string {
  if (chainId === 8453) {
    return process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://mainnet.base.org';
  }
  return process.env.NEXT_PUBLIC_BASE_RPC_URL ?? 'https://mainnet.base.org';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sender = searchParams.get('sender') as Address | null;
    const chainId = Number(searchParams.get('chainId') ?? 8453);

    if (!sender || !sender.startsWith('0x')) {
      return NextResponse.json(
        { error: 'Missing or invalid query: sender (0x address)' },
        { status: 400 }
      );
    }

    const transport = http(getRpcUrl(chainId), { timeout: 10_000 });
    const publicClient = createPublicClient({
      chain: base,
      transport,
    });

    const nonce = await publicClient.readContract({
      address: ENTRY_POINT,
      abi: entryPoint06Abi,
      functionName: 'getNonce',
      args: [sender, 0n],
    });

    const nonceHex = `0x${nonce.toString(16)}` as `0x${string}`;
    return NextResponse.json({ nonce: nonceHex, sender, chainId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get nonce';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
