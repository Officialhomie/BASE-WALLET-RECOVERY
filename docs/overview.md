# Coinbase Smart Wallet Overview

## Architecture

Coinbase Smart Wallet is an ERC-4337 (Account Abstraction) wallet implementation. Unlike traditional EOAs (Externally Owned Accounts), smart wallets are contracts that can:

- Support multiple owners
- Execute complex logic for authorization
- Use paymasters for gasless transactions
- Upgrade their implementation (UUPS pattern)

## Kernel Ownership Module

The wallet uses a **Kernel-style ownership module** with indexed owner storage:

- Owners are stored in an array, accessible by index
- Each owner can be an EOA address or public key (bytes)
- Owner operations require validation via `validateUserOp()`
- The wallet enforces "at least one owner" constraint

### Key Functions

- `ownerCount()`: Returns total number of owners
- `ownerAtIndex(uint256 index)`: Returns owner bytes at index
- `addOwnerAddress(address owner)`: Adds new EOA owner
- `removeOwnerAtIndex(uint256 index, bytes owner)`: Removes owner at index
- `isOwnerAddress(address)`: Checks if address is an owner

## ERC-4337 Flow

1. **UserOperation Creation**: Craft a UserOp with call data
2. **Signing**: Sign the UserOp hash using EIP-712
3. **Bundler Submission**: Send to bundler (Coinbase CDP)
4. **Paymaster Sponsorship**: Optional gas sponsorship
5. **EntryPoint Execution**: EntryPoint validates and executes
6. **Wallet Execution**: Wallet contract executes the call

## Owner Bytes Format

Owners stored as `bytes` are encoded as:
```
0x000000000000000000000000<20-byte address>
```

This is a 32-byte value with the address right-aligned and left-padded with zeros.

## Recovery Scenario

When an EOA owner is compromised:

- **Problem**: Attacker can drain ETH sent to the compromised EOA
- **Solution**: Use ERC-4337 UserOps with paymaster (no ETH needed)
- **Process**: Add safe owner → Remove compromised owner
- **Constraint**: Cannot remove if `ownerCount == 1`

## Network

This implementation targets **Base Mainnet** (chainId: 8453).
