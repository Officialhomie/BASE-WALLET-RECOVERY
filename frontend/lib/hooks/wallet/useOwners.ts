import { useReadContracts } from 'wagmi';
import { smartWalletAbi } from '@/lib/contracts/abis/SmartWallet';
import { addressToOwnerBytes, isOwnerBytesAddress, ownerBytesToAddress } from '@/lib/utils';
import type { Address } from 'viem';
import { useCallback, useMemo } from 'react';

export type OwnerType = 'address' | 'public_key';

export interface Owner {
  index: number;
  ownerBytes: string;
  type: OwnerType;
  address?: Address;
  publicKeyX?: string;
  publicKeyY?: string;
}

export function useOwners(walletAddress: Address, ownerCount?: bigint) {
  const count = ownerCount ? Number(ownerCount) : 0;

  // Generate array of owner indices
  const ownerIndices = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  );

  // Batch read all owners
  const { data: ownersData, isLoading, refetch } = useReadContracts({
    contracts: ownerIndices.map((index) => ({
      address: walletAddress,
      abi: smartWalletAbi,
      functionName: 'ownerAtIndex',
      args: [BigInt(index)],
    })),
  });

  // Parse owner data
  const owners = useMemo(() => {
    if (!ownersData) return [];

    return ownersData
      .map((result, index) => {
        if (result.status !== 'success' || !result.result) return null;

        const ownerBytes = result.result as string;
        const isAddress = isOwnerBytesAddress(ownerBytes);

        const owner: Owner = {
          index,
          ownerBytes,
          type: isAddress ? 'address' : 'public_key',
        };

        if (isAddress) {
          owner.address = ownerBytesToAddress(ownerBytes) as Address;
        } else {
          // Public key is 64 bytes (32 bytes X + 32 bytes Y)
          owner.publicKeyX = '0x' + ownerBytes.slice(2, 66);
          owner.publicKeyY = '0x' + ownerBytes.slice(66);
        }

        return owner;
      })
      .filter((owner): owner is Owner => owner !== null);
  }, [ownersData]);

  return {
    owners,
    isLoading,
    refetch,
  };
}

// Hook for checking if an address is an owner
export function useIsOwner(walletAddress: Address, address?: Address) {
  const { data: isOwner } = useReadContracts({
    contracts: address
      ? [
          {
            address: walletAddress,
            abi: smartWalletAbi,
            functionName: 'isOwnerAddress',
            args: [address],
          },
        ]
      : [],
  });

  return {
    isOwner: isOwner?.[0]?.result as boolean | undefined,
  };
}

// Hook for checking if public key is an owner
export function useIsOwnerPublicKey(
  walletAddress: Address,
  publicKeyX?: string,
  publicKeyY?: string
) {
  const { data: isOwner } = useReadContracts({
    contracts:
      publicKeyX && publicKeyY
        ? [
            {
              address: walletAddress,
              abi: smartWalletAbi,
              functionName: 'isOwnerPublicKey',
              args: [publicKeyX as `0x${string}`, publicKeyY as `0x${string}`],
            },
          ]
        : [],
  });

  return {
    isOwner: isOwner?.[0]?.result as boolean | undefined,
  };
}
