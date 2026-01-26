# Smart Wallet Manager

A comprehensive platform for managing Coinbase Smart Wallets, combining enterprise-grade web interface with powerful CLI tools for wallet recovery and management.

## 🎯 Two Ways to Use This Platform

### 🌐 **Full-Stack Web Application** (Recommended for most users)
Modern, production-ready web interface with:
- Visual owner management (add/remove owners)
- Transaction execution & batch operations
- Real-time transaction history & analytics
- Debug panel for developers
- Multi-chain support (Base, Ethereum, testnets)
- No CLI knowledge required

**👉 [Get Started with Web App](./GETTING_STARTED.md)**

### 🛠️ **CLI Tools** (For advanced users & recovery scenarios)
Minimal, robust command-line toolkit for:
- Emergency wallet recovery when owner is compromised
- Foundry-based direct contract interaction
- Gasless execution via Coinbase paymaster (ERC-4337)
- Scripting and automation

**👉 [CLI Documentation](#cli-tools-section)**

---

## Overview

This repository provides:

- **Full-Stack Web Platform**: Next.js 14 app with comprehensive wallet management
- **Reading owner information** from Coinbase Smart Wallet
- **Removing compromised owners** without sending ETH to them
- **Transaction execution** (single & batch) with gas estimation
- **Transaction history** with event logs and analytics
- **Developer debug panel** with live contract interaction
- **Two execution paths**: Web UI + API or Foundry CLI + Coinbase paymaster

## 🚀 Quick Start - Web Platform

### Get Up and Running in 5 Minutes

```bash
# 1. Clone repository
git clone https://github.com/Officialhomie/BASE-WALLET-RECOVERY.git
cd BASE-WALLET-RECOVERY

# 2. Install dependencies
cd frontend
npm install

# 3. Set up environment
cp .env.local.example .env.local
# Edit .env.local with your API keys

# 4. Start database
cd ..
docker-compose up -d postgres redis

# 5. Set up database schema
cd frontend
npm run db:push

# 6. Start development server
npm run dev

# Open http://localhost:3000
```

**📖 Detailed setup guide:** [GETTING_STARTED.md](./GETTING_STARTED.md)

**🏗️ Architecture overview:** [ARCHITECTURE.md](./ARCHITECTURE.md)

**📚 Full documentation:** [FULLSTACK_README.md](./FULLSTACK_README.md)

---

## 📋 Problem Statement (CLI Use Case)

When a Coinbase Smart Wallet owner EOA is compromised:
- Attacker can drain any ETH sent to the compromised address
- Traditional transactions fail (no gas)
- **Solution**: Use ERC-4337 UserOperations with paymaster sponsorship OR use the Web Platform

## Quick Start - CLI Tools

### Prerequisites

1. **Foundry** installed ([foundryup](https://book.getfoundry.sh/getting-started/installation))
2. **Base Mainnet RPC** access
3. **Coinbase Developer Platform** account (for paymaster path)

### Setup

```bash
# Clone repository
git clone https://github.com/Officialhomie/BASE-WALLET-RECOVERY.git
cd BASE-WALLET-RECOVERY

# Install dependencies (if needed)
forge install

# Copy environment template
cp .env.example .env

# Edit .env with your values
# - SMART_WALLET_ADDRESS
# - SAFE_OWNER_ADDRESS
# - COMPROMISED_OWNER_ADDRESS
# - PRIVATE_KEY (safe owner)
# - CDP_API_KEY (for paymaster)
```

### Read Owner Information

```bash
forge script scripts/readOwner.s.sol:ReadOwner --rpc-url base -vvv
```

### Remove Compromised Owner

**Option A: Foundry (if signer is safe)**
```bash
export OWNER_INDEX_TO_REMOVE=1
forge script scripts/removeOwner.s.sol:RemoveOwner \
  --rpc-url base \
  --broadcast \
  --private-key $PRIVATE_KEY \
  -vvv
```

**Option B: Coinbase Paymaster (if signer is compromised)**
See [docs/pathmaster.md](docs/pathmaster.md) for detailed instructions.

## Documentation

- **[Overview](docs/overview.md)**: Coinbase Smart Wallet architecture and concepts
- **[Ownership Flows](docs/ownership-flows.md)**: Step-by-step owner management
- **[Paymaster Path](docs/pathmaster.md)**: Gasless execution via Coinbase paymaster
- **[Foundry CLI](docs/foundry-cli.md)**: Direct contract interaction commands
- **[Agent Instructions](docs/agent-instructions.md)**: Autonomous execution protocol
- **[Security Notes](docs/security-notes.md)**: Security considerations and best practices
- **[Extensions](docs/extensions.md)**: Future enhancement ideas

## Repository Structure

```
BASE-WALLET-RECOVERY/
├── README.md                 # This file
├── foundry.toml              # Foundry configuration
├── .env.example              # Environment variable template
├── .gitignore                # Git ignore rules
├── abi/
│   └── SmartWallet.json      # Contract ABI
├── scripts/
│   ├── readOwner.s.sol       # Read owner information
│   ├── removeOwner.s.sol    # Remove owner by index
│   ├── dynamicRead.s.sol    # Generic read calls
│   ├── dynamicWrite.s.sol   # Generic write calls
│   ├── interfaces/
│   │   └── CoinbaseSmartWallet.sol  # Contract interface
│   └── userop-templates/     # UserOperation JSON templates
└── docs/                     # Documentation
```

## Key Features

### 1. Owner Management

- Read owner count and owner at index
- Remove owner by index (with validation)
- Support for owner bytes encoding

### 2. Dynamic ABI Interactions

- Generic read calls for any view function
- Generic write calls via `execute()`
- Flexible function encoding

### 3. Dual Execution Paths

- **Foundry Path**: Direct contract calls (requires ETH in signer)
- **Paymaster Path**: ERC-4337 UserOps with gas sponsorship (no ETH needed)

### 4. Safety Features

- Pre-execution validation
- Owner count checks
- Owner bytes verification
- Post-execution confirmation

## Usage Examples

### Check Owner Count

```bash
cast call $SMART_WALLET_ADDRESS "ownerCount()" --rpc-url $BASE_RPC_URL
```

### Remove Owner at Index 1

```bash
# Prepare owner bytes
OWNER_ADDRESS=0xda6fdf1002bb0e2e5edc45440c3975dbb54799a8
OWNER_BYTES=$(cast --to-bytes32 "0x000000000000000000000000${OWNER_ADDRESS:2}")

# Execute removal
cast send $SMART_WALLET_ADDRESS \
  "removeOwnerAtIndex(uint256,bytes)" \
  1 \
  $OWNER_BYTES \
  --rpc-url $BASE_RPC_URL \
  --private-key $PRIVATE_KEY
```

See [docs/foundry-cli.md](docs/foundry-cli.md) for more examples.

## Important Notes

### ⚠️ Security Warnings

- **Never commit private keys** to git
- **Always verify owner bytes** before removal
- **Test on fork/testnet** first if possible
- **Cannot remove last owner** (wallet becomes unusable)

### 🔒 When to Use Each Path

- **Foundry Path**: Use when your signer EOA is safe and has ETH
- **Paymaster Path**: Use when signer is compromised or has no ETH

### 📋 Prerequisites for Removal

1. `ownerCount() > 1` (at least 2 owners)
2. You control at least one safe owner key
3. Know the exact index of the compromised owner
4. Owner bytes match exactly (left-padded address)

## Network

This implementation targets **Base Mainnet** (chainId: 8453).

## Contributing

Contributions welcome! Please:
1. Follow existing code style
2. Add documentation for new features
3. Include tests where applicable
4. Update this README if needed

## License

MIT

## Disclaimer

This tool is provided as-is for legitimate wallet recovery purposes. Users are responsible for:
- Verifying all operations before execution
- Securing their private keys
- Understanding the risks involved
- Testing on testnets before mainnet use

No guarantees are provided. Use at your own risk.

## Support

For issues or questions:
- Check [docs/](docs/) for detailed guides
- Review [docs/security-notes.md](docs/security-notes.md) for safety information
- Open an issue on GitHub

## References

- [Coinbase Developer Platform](https://docs.cdp.coinbase.com)
- [ERC-4337 Specification](https://eips.ethereum.org/EIPS/eip-4337)
- [Foundry Book](https://book.getfoundry.sh)
- [Base Network](https://base.org)
