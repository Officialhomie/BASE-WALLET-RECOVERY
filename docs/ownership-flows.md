# Ownership Management Flows

## Reading Owner Information

### Get Owner Count

```bash
cast call $SMART_WALLET "ownerCount()" --rpc-url $BASE_RPC_URL
```

Or use the Foundry script:
```bash
forge script scripts/readOwner.s.sol:ReadOwner --rpc-url base -vvv
```

### Get Owner at Index

```bash
cast call $SMART_WALLET "ownerAtIndex(uint256)" 0 --rpc-url $BASE_RPC_URL
cast call $SMART_WALLET "ownerAtIndex(uint256)" 1 --rpc-url $BASE_RPC_URL
```

## Removing an Owner

### Prerequisites

1. `ownerCount > 1` (cannot remove last owner)
2. You control at least one other owner key
3. Know the exact index and owner bytes

### Step-by-Step: Remove Owner at Index 1

#### 1. Verify Current State

```bash
# Read owner count
cast call $SMART_WALLET "ownerCount()" --rpc-url $BASE_RPC_URL

# Read owner at index 1
cast call $SMART_WALLET "ownerAtIndex(uint256)" 1 --rpc-url $BASE_RPC_URL
```

Expected output for owner bytes:
```
0x000000000000000000000000da6fdf1002bb0e2e5edc45440c3975dbb54799a8
```

#### 2. Prepare Owner Bytes

Owner bytes must match exactly what's stored. For EOA addresses:
```solidity
bytes memory ownerBytes = abi.encodePacked(bytes12(0), ownerAddress);
```

This creates: `0x000000000000000000000000<address>`

#### 3. Execute Removal

**Option A: Foundry Script (Direct Call)**

```bash
# Set environment variables
export SMART_WALLET_ADDRESS=0x...
export OWNER_INDEX_TO_REMOVE=1
export COMPROMISED_OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8

# Run script
forge script scripts/removeOwner.s.sol:RemoveOwner \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

**Option B: Coinbase Paymaster Path (Gasless)**

See `docs/pathmaster.md` for UserOp submission via bundler.

#### 4. Validate Removal

```bash
# Verify owner count decreased
cast call $SMART_WALLET "ownerCount()" --rpc-url $BASE_RPC_URL

# Verify owner at index 1 is different (or index 1 no longer exists)
cast call $SMART_WALLET "ownerAtIndex(uint256)" 1 --rpc-url $BASE_RPC_URL
```

## Adding an Owner

### Using Foundry

```solidity
CoinbaseSmartWallet wallet = CoinbaseSmartWallet(payable(SMART_WALLET));
wallet.addOwnerAddress(newOwnerAddress);
```

### Using Coinbase Paymaster

Craft UserOp with `callData` encoding `addOwnerAddress(address)` and submit via bundler.

## Owner Index Invariants

- Indices are **0-based**
- After removal, remaining owners **may shift indices** (implementation-dependent)
- Always re-read `ownerAtIndex()` after modifications
- The `LastOwner` error prevents removing when `ownerCount == 1`

## Error Handling

Common errors:

- `LastOwner`: Attempted to remove the only remaining owner
- `WrongOwnerAtIndex`: Owner bytes don't match at the specified index
- `NoOwnerAtIndex`: Index is out of bounds
- `Unauthorized`: Caller is not an owner

## Safety Checks

Before removing:

1. ✅ Verify `ownerCount() > 1`
2. ✅ Read `ownerAtIndex(index)` and confirm bytes match
3. ✅ Ensure you control at least one other owner
4. ✅ Test on a fork first (if possible)
