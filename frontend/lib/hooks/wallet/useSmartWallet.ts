import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { smartWalletAbi } from '@/lib/contracts/abis/SmartWallet';
import type { Address } from 'viem';

export function useSmartWallet(walletAddress: Address) {
  // Read owner count
  const { data: ownerCount, refetch: refetchOwnerCount } = useReadContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: 'ownerCount',
  });

  // Read next owner index
  const { data: nextOwnerIndex } = useReadContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: 'nextOwnerIndex',
  });

  // Read removed owners count
  const { data: removedOwnersCount } = useReadContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: 'removedOwnersCount',
  });

  // Read entry point
  const { data: entryPoint } = useReadContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: 'entryPoint',
  });

  // Read implementation
  const { data: implementation } = useReadContract({
    address: walletAddress,
    abi: smartWalletAbi,
    functionName: 'implementation',
  });

  // Write contract hook
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  return {
    // Read data
    ownerCount,
    nextOwnerIndex,
    removedOwnersCount,
    entryPoint,
    implementation,

    // Write functions
    writeContract,
    isPending,
    isSuccess,
    error,

    // Refetch
    refetchOwnerCount,
  };
}

// Hook for watching Smart Wallet events
export function useWatchSmartWalletEvents(
  walletAddress: Address,
  onAddOwner?: (index: bigint, owner: string) => void,
  onRemoveOwner?: (index: bigint, owner: string) => void
) {
  // Watch AddOwner events
  useWatchContractEvent({
    address: walletAddress,
    abi: smartWalletAbi,
    eventName: 'AddOwner',
    onLogs(logs) {
      logs.forEach((log) => {
        if (onAddOwner && log.args.index !== undefined && log.args.owner) {
          onAddOwner(log.args.index, log.args.owner);
        }
      });
    },
  });

  // Watch RemoveOwner events
  useWatchContractEvent({
    address: walletAddress,
    abi: smartWalletAbi,
    eventName: 'RemoveOwner',
    onLogs(logs) {
      logs.forEach((log) => {
        if (onRemoveOwner && log.args.index !== undefined && log.args.owner) {
          onRemoveOwner(log.args.index, log.args.owner);
        }
      });
    },
  });
}
