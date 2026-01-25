# Coinbase Paymaster & Bundler Path

This document explains how to use Coinbase's paymaster and bundler infrastructure to execute owner removal **without sending ETH to the compromised EOA**.

## Why Use Paymaster?

When a compromised EOA has a drainer bot attached:
- Any ETH sent is immediately swept
- Traditional transactions fail
- **Solution**: ERC-4337 UserOps with paymaster sponsorship

The paymaster pays gas fees, so no ETH touches the compromised address.

## Prerequisites

1. **Coinbase Developer Platform (CDP) Account**
   - Sign up at https://portal.cdp.coinbase.com
   - Create a project
   - Get API key

2. **Bundler Endpoint**
   - Default: `https://api.cdp.coinbase.com/v1/bundler`
   - Or use Pimlico/Stackup alternatives

3. **Paymaster Endpoint**
   - Default: `https://api.cdp.coinbase.com/v1/paymaster`
   - Supports fiat or token sponsorship

## UserOperation Structure

A UserOp contains:

```json
{
  "sender": "0x<smart_wallet_address>",
  "nonce": "0x<nonce>",
  "initCode": "0x",
  "callData": "0x<abi_encoded_function_call>",
  "callGasLimit": "0x<gas_limit>",
  "verificationGasLimit": "0x<verification_gas>",
  "preVerificationGas": "0x<pre_verification_gas>",
  "maxFeePerGas": "0x<max_fee>",
  "maxPriorityFeePerGas": "0x<priority_fee>",
  "paymasterAndData": "0x<paymaster_address><paymaster_data>",
  "signature": "0x<eip712_signature>"
}
```

## Step-by-Step: Remove Owner via Paymaster

### 1. Get Current Nonce

Query the EntryPoint for the wallet's nonce:

```bash
ENTRY_POINT=$(cast call $SMART_WALLET "entryPoint()" --rpc-url $BASE_RPC_URL)
NONCE=$(cast call $ENTRY_POINT "getNonce(address,uint256)" $SMART_WALLET 0 --rpc-url $BASE_RPC_URL)
```

### 2. Encode Call Data

For `removeOwnerAtIndex(uint256 index, bytes owner)`:

```bash
INDEX=1
OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8
OWNER_BYTES=$(cast --to-bytes32 "0x000000000000000000000000${OWNER_ADDRESS:2}")

CALL_DATA=$(cast calldata "removeOwnerAtIndex(uint256,bytes)" $INDEX $OWNER_BYTES)
```

### 3. Get Paymaster Data

Request paymaster sponsorship from Coinbase API:

```bash
curl -X POST $COINBASE_PAYMASTER_URL/sponsor \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userOp": {
      "sender": "'$SMART_WALLET'",
      "nonce": "'$NONCE'",
      "callData": "'$CALL_DATA'",
      ...
    }
  }'
```

Response includes `paymasterAndData`.

### 4. Sign UserOp

Compute EIP-712 hash and sign with your safe owner key:

```javascript
// Pseudocode
const userOpHash = wallet.getUserOpHashWithoutChainId(userOp);
const signature = signEIP712(userOpHash, safeOwnerPrivateKey);
userOp.signature = signature;
```

### 5. Submit to Bundler

Send UserOp to Coinbase bundler:

```bash
curl -X POST $COINBASE_BUNDLER_URL/send \
  -H "Authorization: Bearer $CDP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userOp": { ... }
  }'
```

Bundler returns a transaction hash.

### 6. Wait for Confirmation

Monitor the transaction:

```bash
cast tx $TX_HASH --rpc-url $BASE_RPC_URL
```

## Alternative: Using SDK

Coinbase provides SDKs for easier integration:

### JavaScript/TypeScript

```typescript
import { CoinbaseSmartWallet } from '@coinbase/smart-wallet-sdk';

const wallet = new CoinbaseSmartWallet({
  apiKey: process.env.CDP_API_KEY,
  network: 'base',
});

const userOp = await wallet.createUserOperation({
  target: smartWalletAddress,
  data: removeOwnerCallData,
});

const sponsored = await wallet.sponsorUserOperation(userOp);
await wallet.sendUserOperation(sponsored);
```

### Python

Use `web3.py` with custom UserOp encoding, or find a Python SDK wrapper.

## Gas Estimation

Estimate gas limits:

```bash
# Call gas limit (for execution)
cast estimate $SMART_WALLET "removeOwnerAtIndex(uint256,bytes)" $INDEX $OWNER_BYTES --rpc-url $BASE_RPC_URL

# Verification gas (for signature check)
# Typically 100000-200000 for owner validation
```

## Paymaster Types

Coinbase supports:

1. **Fiat Paymaster**: Pay with credit/debit card
2. **Token Paymaster**: Pay with USDC/USDC Base

Configure in CDP dashboard.

## Error Handling

Common errors:

- `Unauthorized`: Signature validation failed
- `LastOwner`: Cannot remove last owner
- `WrongOwnerAtIndex`: Owner bytes mismatch
- Paymaster rejection: Insufficient balance or policy violation

## Security Notes

- Paymaster sponsorship is **not free** (costs fiat or tokens)
- Always validate UserOp before signing
- Use testnet first to verify flow
- Monitor for unexpected paymaster charges

## References

- [Coinbase Developer Docs](https://docs.cdp.coinbase.com)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [EIP-712 Signing](https://eips.ethereum.org/EIPS/eip-712)
