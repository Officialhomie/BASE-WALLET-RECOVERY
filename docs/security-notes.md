# Security Notes

## Threat Model

This recovery tool addresses the scenario where:
- A Coinbase Smart Wallet has multiple owners
- One owner EOA is compromised (private key leaked)
- Attacker has a drainer bot that sweeps any ETH sent to the compromised EOA
- Goal: Remove compromised owner without sending ETH to it

## Security Assumptions

1. **At least one owner remains uncompromised**
   - If all owners are compromised, recovery is impossible
   - Always verify `isOwnerAddress(safeOwner)` before proceeding

2. **Safe owner key is secure**
   - Private key must be stored securely (hardware wallet, encrypted)
   - Never commit private keys to git
   - Use environment variables or secure key management

3. **Network is trusted**
   - RPC endpoints should be from reputable providers
   - Consider using multiple RPC endpoints for redundancy

4. **Paymaster is legitimate**
   - Only use official Coinbase CDP paymaster
   - Verify paymaster address matches documentation
   - Monitor for unexpected charges

## Risks

### High Risk

1. **Removing the wrong owner**
   - Always verify owner bytes match before removal
   - Double-check index values
   - Test on fork/testnet first if possible

2. **Removing last owner**
   - Wallet becomes unusable
   - Always check `ownerCount > 1` before removal

3. **Private key exposure**
   - Never log or commit private keys
   - Use hardware wallets when possible
   - Rotate keys after recovery if feasible

### Medium Risk

1. **Race conditions**
   - Attacker could remove you first if they're monitoring
   - Execute removal quickly after validation
   - Consider batching add+remove in one transaction

2. **Gas estimation errors**
   - Underestimation causes transaction failure
   - Add 20% buffer to gas estimates
   - Monitor gas prices on Base

3. **Paymaster policy changes**
   - Coinbase may change sponsorship policies
   - Have backup funding method ready
   - Monitor paymaster responses

### Low Risk

1. **Network congestion**
   - Base can experience high traffic
   - Use higher priority fees if urgent
   - Consider off-peak execution times

2. **RPC endpoint failures**
   - Use multiple RPC providers
   - Implement retry logic with backoff

## Best Practices

### Before Execution

- ✅ Verify all environment variables are set correctly
- ✅ Test on a fork or testnet first
- ✅ Read current state (owner count, indices)
- ✅ Confirm safe owner key is accessible
- ✅ Check network connectivity and RPC health

### During Execution

- ✅ Log all operations for audit trail
- ✅ Monitor transaction status closely
- ✅ Verify gas prices are reasonable
- ✅ Watch for unexpected revert reasons

### After Execution

- ✅ Validate on-chain state matches expectations
- ✅ Confirm compromised owner is removed
- ✅ Verify safe owner still has access
- ✅ Test wallet functionality (if possible)
- ✅ Document recovery process for future reference

## Key Management

### Environment Variables

Store sensitive data in `.env` (never commit):
```bash
PRIVATE_KEY=0x...  # Safe owner private key
CDP_API_KEY=...    # Coinbase API key
```

### Hardware Wallets

For production use, consider:
- Using hardware wallet for signing
- Integrating with Ledger/Trezor via `cast wallet`
- Using multi-sig for additional safety

### Key Rotation

After successful recovery:
- Consider rotating the safe owner key
- Add additional owners for redundancy
- Set up monitoring for wallet activity

## Incident Response

If something goes wrong:

1. **Immediate Actions**
   - Stop all operations
   - Document what happened
   - Check on-chain state

2. **Assessment**
   - Determine if wallet is still accessible
   - Check if funds are at risk
   - Verify owner status

3. **Recovery**
   - If wallet is locked, may need to add new owner
   - If funds are at risk, move them immediately
   - Contact Coinbase support if needed

## Compliance

- This tool is for legitimate wallet recovery only
- Do not use for unauthorized access
- Respect terms of service for all services used
- Comply with local regulations regarding crypto operations

## Disclaimer

This tool is provided as-is for educational and recovery purposes. Users are responsible for:
- Verifying all operations before execution
- Securing their private keys
- Understanding the risks involved
- Testing on testnets before mainnet use

No guarantees are provided regarding:
- Success of recovery operations
- Paymaster availability or costs
- Network conditions or RPC reliability
- Wallet contract behavior
