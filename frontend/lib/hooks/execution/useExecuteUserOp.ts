'use client';

import { useMutation } from '@tanstack/react-query';
import type { Address, Hex } from 'viem';
import { createPaymasterClient } from '@/lib/services/paymaster/paymasterClient';
import { SponsorshipService } from '@/lib/services/paymaster/sponsorshipService';
import { BundlerClient } from '@/lib/services/bundler/bundlerClient';
import {
  buildPartialUserOp,
  buildSignedUserOp,
} from '@/lib/services/bundler/userOpService';
import { getPaymasterConfig } from '@/lib/config/paymaster';
import type { PartialUserOperationV06, UserOperationV06 } from '@/lib/types/paymaster';

export interface ExecuteUserOpParams {
  /** Smart wallet address (sender) */
  sender: Address;
  /** Encoded call data (e.g. from encodeRemoveOwnerAtIndex or encodeExecute) */
  callData: Hex;
  /** Chain ID */
  chainId: number;
  /** Nonce (hex) from EntryPoint.getNonce(sender, 0) */
  nonce: Hex;
  /** Gas limits - if not provided, use defaults or request from paymaster */
  callGasLimit?: Hex;
  verificationGasLimit?: Hex;
  preVerificationGas?: Hex;
  maxFeePerGas?: Hex;
  maxPriorityFeePerGas?: Hex;
  /** Signer: (userOpHash) => signature (hex) */
  signUserOp: (userOp: PartialUserOperationV06) => Promise<Hex>;
}

export interface ExecuteUserOpResult {
  userOpHash: Hex;
}

async function executeUserOp(params: ExecuteUserOpParams): Promise<ExecuteUserOpResult> {
  const config = getPaymasterConfig(params.chainId);
  const paymaster = createPaymasterClient(config);

  const gasPrice = await paymaster.getGasPrice(params.chainId);
  const gas = gasPrice.standard;

  const partial: PartialUserOperationV06 = buildPartialUserOp({
    sender: params.sender,
    nonce: params.nonce,
    callData: params.callData,
    callGasLimit: params.callGasLimit ?? '0x186a0',
    verificationGasLimit: params.verificationGasLimit ?? '0x30d40',
    preVerificationGas: params.preVerificationGas ?? '0xc350',
    maxFeePerGas: params.maxFeePerGas ?? gas.maxFeePerGas,
    maxPriorityFeePerGas: params.maxPriorityFeePerGas ?? gas.maxPriorityFeePerGas,
  });

  const sponsorship = await paymaster.sponsorUserOperation(
    partial,
    config.entryPoint
  );

  const withPaymaster: PartialUserOperationV06 = {
    ...partial,
    paymasterAndData: sponsorship.paymasterAndData,
    ...(sponsorship.preVerificationGas && {
      preVerificationGas: sponsorship.preVerificationGas,
    }),
    ...(sponsorship.verificationGasLimit && {
      verificationGasLimit: sponsorship.verificationGasLimit,
    }),
    ...(sponsorship.callGasLimit && { callGasLimit: sponsorship.callGasLimit }),
  };

  const signature = await params.signUserOp(withPaymaster);
  const signedUserOp: UserOperationV06 = buildSignedUserOp(
    { ...withPaymaster, paymasterAndData: sponsorship.paymasterAndData },
    signature
  );

  const bundlerUrl =
    config.provider === 'pimlico'
      ? config.pimlico?.bundlerUrl
      : config.coinbase?.bundlerUrl;
  const apiKey =
    config.provider === 'pimlico'
      ? config.pimlico?.apiKey
      : config.coinbase?.apiKey;

  if (!bundlerUrl) {
    throw new Error('Bundler URL not configured');
  }

  const bundler = new BundlerClient({ bundlerUrl, apiKey });
  const userOpHash = await bundler.sendUserOperation(
    signedUserOp,
    config.entryPoint
  );

  return { userOpHash };
}

export function useExecuteUserOp() {
  return useMutation({
    mutationFn: executeUserOp,
  });
}
