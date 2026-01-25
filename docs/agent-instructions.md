# Agent Execution Protocol

This document provides step-by-step instructions for autonomous agents to execute owner removal operations on Coinbase Smart Wallet.

## Pre-Conditions

Before starting, verify:

1. ✅ `SMART_WALLET_ADDRESS` is set and valid
2. ✅ `ownerCount() > 1` (cannot remove last owner)
3. ✅ Safe owner key is available and not compromised
4. ✅ Network RPC endpoint is accessible
5. ✅ If using paymaster: CDP API key is valid

## Execution Flow

### Phase 1: Validation

**Step 1.1**: Read current owner count
```bash
cast call $SMART_WALLET_ADDRESS "ownerCount()" --rpc-url $BASE_RPC_URL
```
**Expected**: Returns `uint256 > 1`
**On Failure**: Abort with error "Cannot remove owner: only one owner remains"

**Step 1.2**: Read owner at target index
```bash
cast call $SMART_WALLET_ADDRESS "ownerAtIndex(uint256)" $OWNER_INDEX --rpc-url $BASE_RPC_URL
```
**Expected**: Returns bytes matching `COMPROMISED_OWNER_ADDRESS`
**On Failure**: Abort with error "Owner mismatch at index"

**Step 1.3**: Verify safe owner exists
```bash
cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $SAFE_OWNER_ADDRESS --rpc-url $BASE_RPC_URL
```
**Expected**: Returns `true`
**On Failure**: Abort with error "Safe owner not found"

### Phase 2: Preparation

**Step 2.1**: Encode owner bytes
```bash
OWNER_BYTES=$(cast --to-bytes32 "0x000000000000000000000000${COMPROMISED_OWNER_ADDRESS:2}")
```

**Step 2.2**: Encode function call
```bash
CALL_DATA=$(cast calldata "removeOwnerAtIndex(uint256,bytes)" $OWNER_INDEX $OWNER_BYTES)
```

**Step 2.3**: Choose execution path
- If signer EOA is compromised → Use paymaster path
- If signer EOA is safe → Use direct Foundry path

### Phase 3: Execution

#### Path A: Direct Foundry (Safe Signer)

**Step 3A.1**: Estimate gas
```bash
GAS_ESTIMATE=$(cast estimate $SMART_WALLET_ADDRESS "removeOwnerAtIndex(uint256,bytes)" $OWNER_INDEX $OWNER_BYTES --rpc-url $BASE_RPC_URL --private-key $PRIVATE_KEY)
```

**Step 3A.2**: Send transaction
```bash
TX_HASH=$(cast send $SMART_WALLET_ADDRESS "removeOwnerAtIndex(uint256,bytes)" $OWNER_INDEX $OWNER_BYTES --rpc-url $BASE_RPC_URL --private-key $PRIVATE_KEY --json | jq -r '.transactionHash')
```

**Step 3A.3**: Wait for confirmation
```bash
cast receipt $TX_HASH --rpc-url $BASE_RPC_URL --confirmations 1
```

#### Path B: Paymaster (Compromised Signer)

**Step 3B.1**: Get nonce from EntryPoint
```bash
ENTRY_POINT=$(cast call $SMART_WALLET_ADDRESS "entryPoint()" --rpc-url $BASE_RPC_URL)
NONCE=$(cast call $ENTRY_POINT "getNonce(address,uint256)" $SMART_WALLET_ADDRESS 0 --rpc-url $BASE_RPC_URL)
```

**Step 3B.2**: Request paymaster sponsorship
```bash
PAYMASTER_DATA=$(curl -X POST $COINBASE_PAYMASTER_URL/sponsor \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userOp": {...}}' | jq -r '.paymasterAndData')
```

**Step 3B.3**: Sign UserOp (EIP-712)
- Compute hash: `getUserOpHashWithoutChainId(userOp)`
- Sign with safe owner key
- Set `userOp.signature`

**Step 3B.4**: Submit to bundler
```bash
TX_HASH=$(curl -X POST $COINBASE_BUNDLER_URL/send \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"userOp": {...}}' | jq -r '.transactionHash')
```

**Step 3B.5**: Wait for confirmation
```bash
cast receipt $TX_HASH --rpc-url $BASE_RPC_URL --confirmations 1
```

### Phase 4: Validation

**Step 4.1**: Verify owner count decreased
```bash
NEW_COUNT=$(cast call $SMART_WALLET_ADDRESS "ownerCount()" --rpc-url $BASE_RPC_URL)
```
**Expected**: `NEW_COUNT == OLD_COUNT - 1`
**On Failure**: Log warning "Owner count mismatch"

**Step 4.2**: Verify compromised owner removed
```bash
IS_OWNER=$(cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $COMPROMISED_OWNER_ADDRESS --rpc-url $BASE_RPC_URL)
```
**Expected**: Returns `false`
**On Failure**: Abort with error "Owner removal failed"

**Step 4.3**: Verify safe owner still present
```bash
IS_SAFE_OWNER=$(cast call $SMART_WALLET_ADDRESS "isOwnerAddress(address)" $SAFE_OWNER_ADDRESS --rpc-url $BASE_RPC_URL)
```
**Expected**: Returns `true`
**On Failure**: Abort with error "Safe owner lost"

## Error Recovery

### Retry Logic

- Network errors: Retry up to 3 times with exponential backoff
- Gas estimation failures: Increase gas limit by 20%
- Paymaster rejections: Check API key and balance

### Timeout Handling

- RPC calls: 30 second timeout
- Bundler submission: 60 second timeout
- Transaction confirmation: 5 minute timeout

### Failure Modes

1. **Pre-condition failure**: Abort immediately, log error
2. **Execution failure**: Retry once, then abort
3. **Validation failure**: Alert user, do not proceed

## Post-Conditions

After successful execution:

1. ✅ `ownerCount()` decreased by 1
2. ✅ `isOwnerAddress(compromised)` returns `false`
3. ✅ `isOwnerAddress(safe)` returns `true`
4. ✅ Transaction is confirmed on-chain
5. ✅ No `RemoveOwner` event for wrong index

## Logging

Log all steps with:
- Timestamp
- Step identifier
- Input parameters (masked for sensitive data)
- Output results
- Error messages (if any)

## Security Checks

Before execution:
- ✅ Verify all addresses are checksummed
- ✅ Validate owner bytes encoding
- ✅ Confirm index is within bounds
- ✅ Check transaction nonce is correct

During execution:
- ✅ Monitor for unexpected revert reasons
- ✅ Verify gas usage is reasonable
- ✅ Confirm paymaster charges (if applicable)

After execution:
- ✅ Validate on-chain state matches expectations
- ✅ Check for any unexpected events
- ✅ Verify wallet is still functional
