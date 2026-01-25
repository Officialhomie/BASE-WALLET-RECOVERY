# UserOperation Templates

These JSON templates are for ERC-4337 UserOperation structures used with Coinbase Smart Wallet bundler and paymaster.

## Field Descriptions

- `sender`: The smart wallet address
- `nonce`: Current nonce from the wallet (query via `entryPoint().getNonce()`)
- `initCode`: Empty for existing wallets, deployment code for new wallets
- `callData`: ABI-encoded function call (e.g., `removeOwnerAtIndex(uint256,bytes)`)
- `callGasLimit`: Estimated gas for the call execution
- `verificationGasLimit`: Gas for signature verification
- `preVerificationGas`: Overhead gas for bundler
- `maxFeePerGas`: Maximum fee per gas unit (EIP-1559)
- `maxPriorityFeePerGas`: Priority fee per gas unit
- `paymasterAndData`: Paymaster address + data (empty if no paymaster)
- `signature`: EIP-712 signature from owner key

## Usage

1. Fill in all fields with actual values
2. Sign the UserOp hash using EIP-712
3. Submit to bundler via Coinbase API or direct RPC

See `docs/pathmaster.md` for detailed instructions.
