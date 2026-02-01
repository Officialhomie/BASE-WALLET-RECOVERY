import { NextResponse } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { getUserOperationHash, entryPoint06Address } from 'viem/account-abstraction';
import type { Address, Hex } from 'viem';
import { BundlerClient } from '@/lib/services/bundler/bundlerClient';
import { wrapSignatureForCoinbase } from '@/lib/services/bundler/signUserOp';
import type { PartialUserOperationV06, UserOperationV06 } from '@/lib/types/paymaster';

const ENTRY_POINT = entryPoint06Address;

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
  const url = process.env.NEXT_PUBLIC_COINBASE_BUNDLER_URL ?? 'https://api.developer.coinbase.com/rpc/v1/base';
  const apiKey = process.env.CDP_API_KEY ?? '';
  return { bundlerUrl: url, apiKey };
}

/** Body: partial UserOp with paymaster (after /api/paymaster/sponsor). Server signs with SIGNER_PRIVATE_KEY and submits. */
export async function POST(request: Request) {
  try {
    const raw = (process.env.SIGNER_PRIVATE_KEY ?? '').replace(/^\uFEFF/, '').trim();
    if (!raw) {
      return NextResponse.json(
        {
          error:
            'SIGNER_PRIVATE_KEY not set. Set it in Vercel (or .env) to execute from the app. For local runs use scripts/remove-owner-index1.ts.',
        },
        { status: 501 }
      );
    }
    const signerKey = raw.startsWith('0x') ? (raw as Hex) : (`0x${raw}` as Hex);
    const ownerIndex = Number(process.env.OWNER_INDEX_FOR_SIGNATURE ?? '0');

    const body = await request.json();
    const partial = body as PartialUserOperationV06 & { paymasterAndData: Hex };
    const {
      sender,
      nonce,
      initCode = '0x',
      callData,
      callGasLimit,
      verificationGasLimit,
      preVerificationGas,
      maxFeePerGas,
      maxPriorityFeePerGas,
      paymasterAndData = '0x',
    } = partial;

    if (!sender || !nonce || !callData) {
      return NextResponse.json(
        { error: 'Missing required fields: sender, nonce, callData' },
        { status: 400 }
      );
    }

    const chainId = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 8453);

    const userOpForHash = {
      sender: sender as Address,
      nonce: BigInt(nonce),
      initCode: (initCode as Hex) ?? '0x',
      callData: callData as Hex,
      callGasLimit: BigInt(callGasLimit ?? '0x186a0'),
      verificationGasLimit: BigInt(verificationGasLimit ?? '0x30d40'),
      preVerificationGas: BigInt(preVerificationGas ?? '0xc350'),
      maxFeePerGas: BigInt(maxFeePerGas ?? '0x5b08082fa'),
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas ?? '0x12a05f200'),
      paymasterAndData: (paymasterAndData as Hex) ?? '0x',
      signature: '0x' as Hex,
    };

    const userOpHash = getUserOperationHash({
      chainId,
      entryPointAddress: ENTRY_POINT,
      entryPointVersion: '0.6',
      userOperation: userOpForHash,
    });

    const account = privateKeyToAccount(signerKey);
    const signature = await account.sign({ hash: userOpHash });
    const wrappedSignature = wrapSignatureForCoinbase(ownerIndex, signature);

    const signedUserOp: UserOperationV06 = {
      sender: partial.sender,
      nonce: partial.nonce,
      initCode: (partial.initCode as Hex) ?? '0x',
      callData: partial.callData,
      callGasLimit: (partial.callGasLimit as Hex) ?? '0x186a0',
      verificationGasLimit: (partial.verificationGasLimit as Hex) ?? '0x30d40',
      preVerificationGas: (partial.preVerificationGas as Hex) ?? '0xc350',
      maxFeePerGas: (partial.maxFeePerGas as Hex) ?? '0x5b08082fa',
      maxPriorityFeePerGas: (partial.maxPriorityFeePerGas as Hex) ?? '0x12a05f200',
      paymasterAndData: (partial.paymasterAndData as Hex) ?? '0x',
      signature: wrappedSignature,
    };

    const config = getBundlerConfigFromEnv(chainId);
    const bundler = new BundlerClient(config);
    const resultHash = await bundler.sendUserOperation(signedUserOp, ENTRY_POINT);

    return NextResponse.json({ userOpHash: resultHash });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Execute failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
