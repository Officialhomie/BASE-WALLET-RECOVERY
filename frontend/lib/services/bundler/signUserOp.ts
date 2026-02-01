/**
 * Sign a UserOperation for Coinbase Smart Wallet (server-side or script).
 * Uses packed (r, s, v) signature format and owner index wrapper.
 */

import {
  encodeAbiParameters,
  encodePacked,
  parseAbiParameters,
  parseSignature,
  size,
} from 'viem';
import type { Hex } from 'viem';

/** Match viem toCoinbaseSmartAccount: 65-byte sig → packed (r, s, v) for signatureData */
export function wrapSignatureForCoinbase(ownerIndex: number, signature: Hex): Hex {
  const signatureData =
    size(signature) !== 65
      ? signature
      : (() => {
          const sig = parseSignature(signature);
          return encodePacked(
            ['bytes32', 'bytes32', 'uint8'],
            [sig.r, sig.s, sig.yParity === 0 ? 27 : 28]
          ) as Hex;
        })();
  return encodeAbiParameters(
    parseAbiParameters('uint8 ownerIndex, bytes signatureData'),
    [ownerIndex, signatureData]
  ) as Hex;
}
