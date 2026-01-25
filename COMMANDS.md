# Quick Command Reference

## Environment Setup

```bash
# Load environment variables
source .env

# Verify RPC connection
cast block-number --rpc-url $BASE_RPC_URL
```

## Owner Information

### Read Owner Count
```bash
cast call $SMART_WALLET_ADDRESS "ownerCount()" --rpc-url $BASE_RPC_URL
```

### Read Owner at Index
```bash
# Index 0
cast call $SMART_WALLET_ADDRESS "ownerAtIndex(uint256)" 0 --rpc-url $BASE_RPC_URL

# Index 1
cast call $SMART_WALLET_ADDRESS "ownerAtIndex(uint256)" 1 --rpc-url $BASE_RPC_URL
```

### Check if Address is Owner
```bash
cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $OWNER_ADDRESS --rpc-url $BASE_RPC_URL
```

## Remove Owner (Foundry Path)

### Prepare Owner Bytes
```bash
OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8
OWNER_BYTES=$(cast --to-bytes32 "0x000000000000000000000000${OWNER_ADDRESS:2}")
```

### Estimate Gas
```bash
cast estimate $SMART_WALLET_ADDRESS \
  "removeOwnerAtIndex(uint256,bytes)" \
  1 \
  $OWNER_BYTES \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Execute Removal
```bash
cast send $SMART_WALLET_ADDRESS \
  "removeOwnerAtIndex(uint256,bytes)" \
  1 \
  $OWNER_BYTES \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY \
  --gas-limit 200000
```

## Foundry Scripts

### Read Owners
```bash
forge script scripts/readOwner.s.sol:ReadOwner \
  --rpc-url base \
  -vvv
```

### Remove Owner
```bash
export OWNER_INDEX_TO_REMOVE=1
export COMPROMISED_OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8

forge script scripts/removeOwner.s.sol:RemoveOwner \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

### Dynamic Read
```bash
export FUNCTION_SELECTOR=$(cast sig "ownerCount()")
export FUNCTION_ARGS="0x"

forge script scripts/dynamicRead.s.sol:DynamicRead \
  --rpc-url base \
  -vvv
```

### Dynamic Write
```bash
export TARGET_ADDRESS=$SMART_WALLET_ADDRESS
export CALL_VALUE=0
export CALL_DATA=$(cast calldata "addOwnerAddress(address)" $NEW_OWNER)

forge script scripts/dynamicWrite.s.sol:DynamicWrite \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

## Transaction Monitoring

### Get Transaction Hash
```bash
TX_HASH=$(cast send ... --json | jq -r '.transactionHash')
```

### View Transaction
```bash
cast tx $TX_HASH --rpc-url $BASE_RPC_URL
```

### Get Receipt
```bash
cast receipt $TX_HASH --rpc-url $BASE_RPC_URL
```

### Wait for Confirmation
```bash
cast receipt $TX_HASH --rpc-url $BASE_RPC_URL --confirmations 1
```

## Paymaster Path (Coinbase)

### Get EntryPoint
```bash
ENTRY_POINT=$(cast call $SMART_WALLET_ADDRESS "entryPoint()" --rpc-url $BASE_RPC_URL)
```

### Get Nonce
```bash
NONCE=$(cast call $ENTRY_POINT "getNonce(address,uint256)" $SMART_WALLET_ADDRESS 0 --rpc-url $BASE_RPC_URL)
```

### Request Paymaster Sponsorship
```bash
curl -X POST $COINBASE_PAYMASTER_URL/sponsor \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d @scripts/userop-templates/removeOwner.json
```

### Submit to Bundler
```bash
curl -X POST $COINBASE_BUNDLER_URL/send \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d @scripts/userop-templates/removeOwner.json
```

## Validation After Removal

### Verify Owner Count
```bash
cast call $SMART_WALLET_ADDRESS "ownerCount()" --rpc-url $BASE_RPC_URL
```

### Verify Owner Removed
```bash
cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $COMPROMISED_OWNER_ADDRESS --rpc-url $BASE_RPC_URL
# Should return: false
```

### Verify Safe Owner Still Present
```bash
cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $SAFE_OWNER_ADDRESS --rpc-url $BASE_RPC_URL
# Should return: true
```

## Helper Functions

### Address to Owner Bytes
```bash
addr_to_owner_bytes() {
  local addr=$1
  echo "0x000000000000000000000000${addr:2}"
}

# Usage
OWNER_BYTES=$(addr_to_owner_bytes $OWNER_ADDRESS)
```

### Encode Function Call
```bash
encode_call() {
  local func=$1
  shift
  cast calldata "$func" "$@"
}

# Usage
CALL_DATA=$(encode_call "removeOwnerAtIndex(uint256,bytes)" 1 $OWNER_BYTES)
```

## Troubleshooting

### Check RPC Connection
```bash
cast block-number --rpc-url $BASE_RPC_URL
```

### Check Wallet Balance
```bash
cast balance $SMART_WALLET_ADDRESS --rpc-url $BASE_RPC_URL
```

### Decode Revert Reason
```bash
cast run $TX_HASH --rpc-url $BASE_RPC_URL
```

### Get Gas Price
```bash
cast gas-price --rpc-url $BASE_RPC_URL
```
