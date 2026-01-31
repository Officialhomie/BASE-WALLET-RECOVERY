/**
 * UserOperation utilities - build UserOp, encode call data
 */

import { encodeFunctionData } from 'viem';
import type { Address, Hex } from 'viem';
import type { PartialUserOperationV06, UserOperationV06 } from '@/lib/types/paymaster';
import { smartWalletAbi } from '@/lib/contracts/abis/SmartWallet';

const ENTRY_POINT_V06: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

/**
 * Encode removeOwnerAtIndex(index, owner) call data for the smart wallet.
 * owner must be the bytes from ownerAtIndex(index) (e.g. 32-byte padded address).
 */
export function encodeRemoveOwnerAtIndex(
  index: bigint,
  ownerBytes: Hex
): Hex {
  return encodeFunctionData({
    abi: smartWalletAbi,
    functionName: 'removeOwnerAtIndex',
    args: [index, ownerBytes],
  });
}

/**
 * Encode addOwnerAddress(owner) call data for the smart wallet.
 */
export function encodeAddOwnerAddress(owner: Address): Hex {
  return encodeFunctionData({
    abi: smartWalletAbi,
    functionName: 'addOwnerAddress',
    args: [owner],
  });
}

/**
 * Encode execute(target, value, data) call data for the smart wallet.
 */
export function encodeExecute(
  target: Address,
  value: bigint,
  data: Hex
): Hex {
  return encodeFunctionData({
    abi: smartWalletAbi,
    functionName: 'execute',
    args: [target, value, data],
  });
}

/**
 * Build a partial UserOperation (no signature, no paymaster data) for sponsorship request.
 */
export function buildPartialUserOp(params: {
  sender: Address;
  nonce: Hex;
  callData: Hex;
  callGasLimit: Hex;
  verificationGasLimit: Hex;
  preVerificationGas: Hex;
  maxFeePerGas: Hex;
  maxPriorityFeePerGas: Hex;
  initCode?: Hex;
}): PartialUserOperationV06 {
  return {
    sender: params.sender,
    nonce: params.nonce,
    initCode: params.initCode ?? '0x',
    callData: params.callData,
    callGasLimit: params.callGasLimit,
    verificationGasLimit: params.verificationGasLimit,
    preVerificationGas: params.preVerificationGas,
    maxFeePerGas: params.maxFeePerGas,
    maxPriorityFeePerGas: params.maxPriorityFeePerGas,
  };
}

/**
 * Build a full UserOperation (with paymasterAndData and signature) ready for submission.
 */
export function buildSignedUserOp(
  partial: PartialUserOperationV06,
  signature: Hex
): UserOperationV06 {
  return {
    ...partial,
    paymasterAndData: partial.paymasterAndData ?? '0x',
    signature,
  };
}

export { ENTRY_POINT_V06 };
