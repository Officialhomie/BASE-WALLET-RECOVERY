/**
 * High-level sponsorship service - request sponsorship, merge into UserOp, submit
 */

import type { Address, Hex } from 'viem';
import type {
  PaymasterProvider,
  PartialUserOperationV06,
  SponsorshipResponse,
  UserOperationV06,
} from '@/lib/types/paymaster';
import type { BundlerClient } from '@/lib/services/bundler/bundlerClient';

const ENTRY_POINT_V06: Address =
  '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789';

export interface SponsorshipServiceConfig {
  paymaster: PaymasterProvider;
  bundler: BundlerClient;
  entryPoint?: Address;
}

/**
 * Request paymaster sponsorship for a partial UserOperation.
 */
export async function requestSponsorship(
  paymaster: PaymasterProvider,
  userOp: PartialUserOperationV06,
  entryPoint: Address = ENTRY_POINT_V06
): Promise<SponsorshipResponse> {
  return paymaster.sponsorUserOperation(userOp, entryPoint);
}

/**
 * Merge sponsorship response into a partial UserOp (adds paymasterAndData and optional gas fields).
 */
export function mergeSponsorshipIntoUserOp(
  userOp: PartialUserOperationV06,
  sponsorship: SponsorshipResponse
): PartialUserOperationV06 {
  return {
    ...userOp,
    paymasterAndData: sponsorship.paymasterAndData,
    ...(sponsorship.preVerificationGas && {
      preVerificationGas: sponsorship.preVerificationGas,
    }),
    ...(sponsorship.verificationGasLimit && {
      verificationGasLimit: sponsorship.verificationGasLimit,
    }),
    ...(sponsorship.callGasLimit && {
      callGasLimit: sponsorship.callGasLimit,
    }),
  };
}

/**
 * Submit a signed UserOperation to the bundler.
 */
export async function submitSponsoredUserOp(
  bundler: BundlerClient,
  signedUserOp: UserOperationV06,
  entryPoint: Address = ENTRY_POINT_V06
): Promise<Hex> {
  return bundler.sendUserOperation(signedUserOp, entryPoint);
}

/**
 * SponsorshipService - high-level helper that holds paymaster + bundler and entry point.
 */
export class SponsorshipService {
  private readonly paymaster: PaymasterProvider;
  private readonly bundler: BundlerClient;
  private readonly entryPoint: Address;

  constructor(config: SponsorshipServiceConfig) {
    this.paymaster = config.paymaster;
    this.bundler = config.bundler;
    this.entryPoint = config.entryPoint ?? ENTRY_POINT_V06;
  }

  async requestSponsorship(
    userOp: PartialUserOperationV06
  ): Promise<SponsorshipResponse> {
    return requestSponsorship(this.paymaster, userOp, this.entryPoint);
  }

  mergeSponsorshipIntoUserOp(
    userOp: PartialUserOperationV06,
    sponsorship: SponsorshipResponse
  ): PartialUserOperationV06 {
    return mergeSponsorshipIntoUserOp(userOp, sponsorship);
  }

  async submitUserOperation(signedUserOp: UserOperationV06): Promise<Hex> {
    return submitSponsoredUserOp(this.bundler, signedUserOp, this.entryPoint);
  }
}

export { ENTRY_POINT_V06 };
