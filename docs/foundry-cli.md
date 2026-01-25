# Foundry CLI Path

This document covers using Foundry's `cast` and `forge` tools to interact with Coinbase Smart Wallet directly.

## Prerequisites

1. **Foundry Installed**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Environment Variables**
   ```bash
   source .env
   ```

3. **Base RPC Access**
   - Public: `https://mainnet.base.org`
   - Alchemy: `https://base-mainnet.g.alchemy.com/v2/YOUR_KEY`
   - Infura: `https://base-mainnet.infura.io/v3/YOUR_KEY`

## Reading Owner Information

### Owner Count

```bash
cast call $SMART_WALLET_ADDRESS \
  "ownerCount()" \
  --rpc-url $BASE_RPC_URL
```

### Owner at Index

```bash
# Index 0
cast call $SMART_WALLET_ADDRESS \
  "ownerAtIndex(uint256)" \
  0 \
  --rpc-url $BASE_RPC_URL

# Index 1
cast call $SMART_WALLET_ADDRESS \
  "ownerAtIndex(uint256)" \
  1 \
  --rpc-url $BASE_RPC_URL
```

### Check if Address is Owner

```bash
cast call $SMART_WALLET_ADDRESS \
  "isOwnerAddress(address)" \
  $OWNER_ADDRESS \
  --rpc-url $BASE_RPC_URL
```

## Removing Owner (Direct Call)

### Prepare Owner Bytes

Owner bytes must be 32 bytes with address right-aligned:

```bash
OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8
OWNER_BYTES=$(cast --to-bytes32 "0x000000000000000000000000${OWNER_ADDRESS:2}")
```

### Encode Function Call

```bash
INDEX=1
CALL_DATA=$(cast calldata \
  "removeOwnerAtIndex(uint256,bytes)" \
  $INDEX \
  $OWNER_BYTES)
```

### Send Transaction

**Warning**: This requires ETH in the signer's EOA. If the signer is compromised, use the paymaster path instead.

```bash
cast send $SMART_WALLET_ADDRESS \
  "removeOwnerAtIndex(uint256,bytes)" \
  $INDEX \
  $OWNER_BYTES \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Using Foundry Scripts

### Read Owners

```bash
forge script scripts/readOwner.s.sol:ReadOwner \
  --rpc-url base \
  -vvv
```

### Remove Owner

```bash
# Set required env vars
export OWNER_INDEX_TO_REMOVE=1
export COMPROMISED_OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8

forge script scripts/removeOwner.s.sol:RemoveOwner \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

### Dynamic Read Call

```bash
# Set function selector and args
export FUNCTION_SELECTOR=$(cast sig "ownerCount()")
export FUNCTION_ARGS="0x"

forge script scripts/dynamicRead.s.sol:DynamicRead \
  --rpc-url base \
  -vvv
```

### Dynamic Write Call

```bash
# Set target, value, and call data
export TARGET_ADDRESS=$SMART_WALLET_ADDRESS
export CALL_VALUE=0
export CALL_DATA=$(cast calldata "addOwnerAddress(address)" $NEW_OWNER)

forge script scripts/dynamicWrite.s.sol:DynamicWrite \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

## Gas Estimation

Estimate gas before sending:

```bash
cast estimate $SMART_WALLET_ADDRESS \
  "removeOwnerAtIndex(uint256,bytes)" \
  $INDEX \
  $OWNER_BYTES \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

## Transaction Monitoring

```bash
# Send and get tx hash
TX_HASH=$(cast send ... --json | jq -r '.transactionHash')

# Wait for receipt
cast receipt $TX_HASH --rpc-url $BASE_RPC_URL

# View transaction
cast tx $TX_HASH --rpc-url $BASE_RPC_URL
```

## Encoding Helper Functions

### Address to Owner Bytes

```bash
addr_to_owner_bytes() {
  local addr=$1
  echo "0x000000000000000000000000${addr:2}"
}
```

### Encode Multiple Arguments

```bash
cast calldata "function(uint256,bytes,address)" 1 "0x..." "0x..."
```

## Limitations

**Direct Foundry calls require ETH in the signer account**. For compromised EOAs:

- ❌ Cannot use `cast send` if signer is compromised (ETH gets drained)
- ✅ Use paymaster path instead (see `docs/pathmaster.md`)
- ✅ Or use a different, safe owner key for signing

## Troubleshooting

### "insufficient funds for gas"

- Signer EOA has no ETH
- Use paymaster path or fund a safe signer

### "LastOwner" error

- Only one owner remains
- Add another owner first

### "WrongOwnerAtIndex" error

- Owner bytes don't match
- Re-read `ownerAtIndex()` and verify encoding

### "Unauthorized" error

- Signer is not an owner
- Use a key that controls an owner address
