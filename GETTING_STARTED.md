# Getting Started Guide

This guide will walk you through setting up the Smart Wallet Manager platform from scratch to having a fully functional local development environment.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] **Node.js** v18.17 or higher ([Download](https://nodejs.org/))
- [ ] **npm** v9 or higher (comes with Node.js)
- [ ] **Docker Desktop** ([Download](https://www.docker.com/products/docker-desktop))
- [ ] **Git** ([Download](https://git-scm.com/))
- [ ] A code editor (VS Code recommended)
- [ ] An Alchemy account for RPC access ([Sign up](https://www.alchemy.com/))
- [ ] A WalletConnect project ID ([Get one](https://cloud.walletconnect.com/))

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd BASE-WALLET-RECOVERY

# Verify you're in the right directory
ls
# You should see: frontend/, backend/, database/, docs/, etc.
```

## Step 2: Set Up API Keys

### 2.1 Alchemy API Key

1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up or log in
3. Create a new app for "Base" network
4. Copy your API key

### 2.2 WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID

### 2.3 (Optional) Coinbase Developer Platform

1. Go to [Coinbase Developer Platform](https://www.coinbase.com/developer-platform)
2. Create an account
3. Get your API key for paymaster/bundler services

## Step 3: Environment Configuration

```bash
# Navigate to frontend directory
cd frontend

# Copy the environment template
cp .env.local.example .env.local

# Open .env.local in your editor
```

Edit `.env.local` with your values:

```bash
# Required: Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Required: Blockchain RPCs
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key-here"
NEXT_PUBLIC_BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"

# Required: WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id-here"

# Required: Database (will be set up in next step)
DATABASE_URL="postgresql://smart_wallet_user:smart_wallet_password@localhost:5432/smart_wallet_db?schema=public"

# Optional: Coinbase Paymaster (skip for now)
# CDP_API_KEY="your-coinbase-api-key"

# Optional: Redis (skip for now, app works without it)
# UPSTASH_REDIS_REST_URL=""
```

## Step 4: Install Dependencies

```bash
# Make sure you're in the frontend directory
cd frontend

# Install all dependencies (this may take 2-3 minutes)
npm install

# Wait for installation to complete
# You should see "added XXX packages" when done
```

## Step 5: Start Database with Docker

```bash
# Go back to project root
cd ..

# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps

# You should see both postgres and redis with status "Up"
```

**Troubleshooting:**
- If port 5432 is already in use: Stop other PostgreSQL instances
- If Docker isn't running: Start Docker Desktop

## Step 6: Set Up Database Schema

```bash
# Go back to frontend directory
cd frontend

# Push Prisma schema to database
npm run db:push

# You should see: "Your database is now in sync with your Prisma schema"
```

**Optional:** View your database in Prisma Studio:

```bash
npm run db:studio

# Opens at http://localhost:5555
```

## Step 7: Start Development Server

```bash
# Make sure you're in frontend directory
npm run dev

# You should see:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# - Ready in 2.5s
```

## Step 8: Test the Application

1. Open your browser to [http://localhost:3000](http://localhost:3000)
2. You should see the landing page
3. Click "Connect Wallet" to test wallet connection
4. Click "Dashboard" to access the main application

## Step 9: Connect Your Wallet

### Option A: Use Coinbase Wallet

1. Install [Coinbase Wallet extension](https://www.coinbase.com/wallet)
2. Click "Connect Wallet" button
3. Select "Coinbase Wallet"
4. Approve the connection

### Option B: Use MetaMask

1. Install [MetaMask](https://metamask.io/)
2. Click "Connect Wallet"
3. Select "MetaMask"
4. Approve the connection

### Option C: Use WalletConnect

1. Click "Connect Wallet"
2. Select "WalletConnect"
3. Scan QR code with mobile wallet

## Step 10: Add Base Network (if needed)

If your wallet doesn't have Base network:

**Base Mainnet:**
- Network Name: Base
- RPC URL: https://mainnet.base.org
- Chain ID: 8453
- Currency Symbol: ETH
- Block Explorer: https://basescan.org

**Base Sepolia (Testnet):**
- Network Name: Base Sepolia
- RPC URL: https://sepolia.base.org
- Chain ID: 84532
- Currency Symbol: ETH
- Block Explorer: https://sepolia.basescan.org

## Step 11: Test with a Smart Wallet

### If you have a Coinbase Smart Wallet:

1. Go to Dashboard
2. Enter your smart wallet address
3. View owners, execute transactions, etc.

### If you don't have a Smart Wallet yet:

You can create one at [Coinbase Wallet](https://www.coinbase.com/wallet) or use testnet to experiment.

## Verification Checklist

After completing all steps, verify:

- [ ] Docker containers are running (`docker-compose ps` shows "Up")
- [ ] Frontend dev server is running at http://localhost:3000
- [ ] You can connect a wallet (see wallet address in header)
- [ ] Database is accessible (can open Prisma Studio)
- [ ] No errors in terminal or browser console

## Common Issues and Solutions

### Issue: "Module not found" errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Port 3000 already in use"

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Issue: "Database connection failed"

```bash
# Check if Docker containers are running
docker-compose ps

# Restart containers
docker-compose down
docker-compose up -d postgres redis

# Wait 10 seconds, then try again
npm run db:push
```

### Issue: "Prisma Client not generated"

```bash
npm run db:generate
```

### Issue: Build errors with Next.js

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

## Next Steps

Now that you have a working development environment:

1. **Read the Architecture**: Check out [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Explore Features**: Try adding/removing owners, executing transactions
3. **Read API Docs**: See available API endpoints in [docs/api/API.md](./docs/api/API.md)
4. **Start Developing**: Check out the codebase and make changes!

## Development Workflow

```bash
# Start your development session
docker-compose up -d postgres redis  # Start database
cd frontend
npm run dev                          # Start dev server

# Make changes to code
# Changes hot-reload automatically

# View database
npm run db:studio                    # Open Prisma Studio

# Run tests
npm run test                         # Unit tests
npm run test:e2e                     # E2E tests

# Before committing
npm run lint                         # Check for linting errors
npm run type-check                   # Check TypeScript
npm run format                       # Format code

# Stop development
# Ctrl+C in terminal (stop dev server)
docker-compose down                  # Stop database
```

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Open a GitHub issue
- **Discord**: Join our community (link)
- **Email**: support@smartwalletmanager.dev

## Pro Tips

1. **VS Code Extensions**: Install these for better DX
   - ESLint
   - Prettier
   - Prisma
   - Tailwind CSS IntelliSense
   - Docker

2. **Terminal Setup**: Use multiple terminals
   - Terminal 1: Dev server
   - Terminal 2: Git commands
   - Terminal 3: Database/Docker commands

3. **Browser DevTools**: Install
   - React Developer Tools
   - Redux DevTools (for debugging)

4. **Hot Reload**: Changes auto-reload, but if stuck:
   - Refresh browser (F5)
   - Restart dev server
   - Clear `.next` folder

---

**Congratulations!** 🎉

You now have a fully functional Smart Wallet Manager development environment. Happy coding!
