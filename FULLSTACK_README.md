# Smart Wallet Manager - Full-Stack Platform

A production-grade, full-stack platform for managing Coinbase Smart Wallets with advanced features combining enterprise architecture, lightweight performance, and comprehensive developer tooling.

## 🏗️ Architecture Overview

This is a complete full-stack application with:

- **Frontend**: Next.js 14 (App Router) + TypeScript + shadcn/ui + wagmi + RainbowKit
- **Backend**: Next.js API Routes + Prisma ORM + Redis caching
- **Database**: PostgreSQL for transaction history and analytics
- **Blockchain**: Integration with Base, Ethereum, and testnets
- **Services**: Event indexer, background workers, paymaster & bundler integration
- **Infrastructure**: Docker, CI/CD with GitHub Actions

## 📁 Project Structure

```
BASE-WALLET-RECOVERY/
├── frontend/                   # Next.js 14 application
│   ├── app/                   # App router pages
│   │   ├── api/              # Backend API routes
│   │   ├── dashboard/        # Main dashboard
│   │   └── wallet/[address]/ # Wallet management pages
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── wallet/          # Wallet-specific components
│   │   ├── execution/       # Transaction execution
│   │   └── debug/           # Debug panel
│   ├── lib/                 # Core libraries
│   │   ├── contracts/       # Smart contract ABIs
│   │   ├── hooks/           # React hooks
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── tests/               # Test suites
├── backend/                  # Standalone services
│   ├── indexer/             # Event indexer service
│   └── worker/              # Background job worker
├── database/
│   └── prisma/              # Database schema & migrations
├── contracts/               # Existing Foundry scripts
├── subgraph/                # The Graph subgraph
└── docs/                    # Documentation

```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+ and npm 9+
- Docker and Docker Compose
- Git

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd BASE-WALLET-RECOVERY

# Install frontend dependencies
cd frontend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp frontend/.env.local.example frontend/.env.local

# Edit .env.local with your configuration
# Required:
# - Database URL (PostgreSQL)
# - RPC URLs (Alchemy/QuickNode)
# - WalletConnect Project ID
# - Coinbase Paymaster & Bundler credentials (optional)
```

### 3. Start Database

```bash
# From project root
docker-compose up -d postgres redis

# Wait for services to be healthy
docker-compose ps
```

### 4. Database Setup

```bash
cd frontend

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed
```

### 5. Start Development Server

```bash
# From frontend directory
npm run dev

# Application will be available at http://localhost:3000
```

## 📦 Installation Options

### Option A: Full Stack with Docker (Recommended)

```bash
# Start all services (frontend, database, redis, indexer, worker)
docker-compose up -d

# View logs
docker-compose logs -f frontend

# Stop all services
docker-compose down
```

### Option B: Frontend Only (Lightweight)

```bash
# Use cloud database (Railway, Supabase, etc.)
# Update DATABASE_URL in .env.local

cd frontend
npm run dev
```

### Option C: Development Mode

```bash
# Terminal 1: Database
docker-compose up postgres redis

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Indexer (optional)
cd backend/indexer
npm run dev

# Terminal 4: Worker (optional)
cd backend/worker
npm run dev
```

## 🔧 Configuration

### Environment Variables

Key environment variables you need to configure:

```bash
# Blockchain RPCs
NEXT_PUBLIC_BASE_RPC_URL="https://base-mainnet.g.alchemy.com/v2/YOUR_KEY"
NEXT_PUBLIC_ALCHEMY_API_KEY="your-alchemy-api-key"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_wallet_db"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your-project-id"

# Coinbase Paymaster (optional)
NEXT_PUBLIC_COINBASE_PAYMASTER_URL="https://api.developer.coinbase.com/..."
CDP_API_KEY="your-coinbase-api-key"

# Redis (optional, for caching)
UPSTASH_REDIS_REST_URL="your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

Get your API keys:
- **Alchemy**: https://www.alchemy.com/
- **WalletConnect**: https://cloud.walletconnect.com/
- **Coinbase Developer Platform**: https://www.coinbase.com/developer-platform

### Database Configuration

The platform uses PostgreSQL with Prisma ORM. Schema includes:
- Wallets
- Owners (with history)
- Transactions
- User Operations (ERC-4337)
- Events
- Analytics

```bash
# View database in Prisma Studio
npm run db:studio

# Create new migration
npm run db:migrate

# Reset database (DEV ONLY)
npx prisma migrate reset
```

## 🎨 Features

### 1. Owner Management
- Add owners (address or public key)
- Remove owners with safety checks
- View owner history
- Verify ownership on-chain
- Import/export owner lists

### 2. Transaction Execution
- **Single Execution**: Execute any contract call
- **Batch Builder**: Compose multiple calls with drag-and-drop
- **UserOp Builder**: Build ERC-4337 UserOperations
- **Gas Estimation**: Real-time gas estimates
- **Simulation**: Preview with Tenderly integration
- **Paymaster**: Gasless transactions via Coinbase

### 3. Transaction History
- Complete transaction history
- Filter by type, status, date range
- Event log viewer
- Decoded function calls
- Export to CSV/JSON
- Real-time updates via WebSocket

### 4. Analytics Dashboard
- Gas usage charts
- Transaction timeline
- Owner activity tracking
- Wallet health score
- Cost analysis

### 5. Debug Panel (Scaffold-ETH Style)
- Read functions with auto-generated UI
- Write functions with form validation
- Live event monitoring
- State inspector
- Contract debugger

### 6. Multi-chain Support
- Base Mainnet & Sepolia
- Ethereum Mainnet & Sepolia
- Optimism, Arbitrum (extensible)
- Easy network switching

## 🛠️ Development

### Project Commands

```bash
# Frontend
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run format           # Format with Prettier

# Database
npm run db:push          # Push schema changes
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Testing
npm run test             # Run unit tests (Vitest)
npm run test:ui          # Vitest UI
npm run test:e2e         # E2E tests (Playwright)

# Contracts
npm run wagmi:generate   # Generate contract types
```

### Adding New Components

```bash
# Add shadcn/ui component
npx shadcn-ui@latest add <component-name>

# Example: Add dialog component
npx shadcn-ui@latest add dialog
```

### Code Structure

**Frontend Components:**
- `/components/ui/` - Base UI components (shadcn/ui)
- `/components/wallet/` - Wallet-specific features
- `/components/execution/` - Transaction execution
- `/components/debug/` - Debug panel

**Hooks:**
- `/lib/hooks/wallet/` - Smart wallet interactions
- `/lib/hooks/execution/` - Transaction execution
- `/lib/hooks/history/` - Transaction history

**Services:**
- `/lib/services/wallet/` - Wallet service layer
- `/lib/services/paymaster/` - Paymaster integration
- `/lib/services/bundler/` - Bundler integration

## 🧪 Testing

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npm run test src/lib/utils.test.ts
```

### Integration Tests

```bash
# Test API routes
npm run test:integration
```

### E2E Tests

```bash
# Run Playwright tests
npm run test:e2e

# Run in UI mode
npm run test:e2e -- --ui

# Run specific test
npm run test:e2e tests/wallet-management.spec.ts
```

## 📚 API Documentation

### REST API Endpoints

#### Wallet Endpoints
- `GET /api/wallet/[address]` - Get wallet info
- `GET /api/wallet/[address]/owners` - List owners
- `GET /api/wallet/[address]/transactions` - Transaction history
- `GET /api/wallet/[address]/events` - Event logs
- `GET /api/wallet/[address]/analytics` - Analytics data

#### Execution Endpoints
- `POST /api/wallet/[address]/execute` - Execute transaction
- `POST /api/wallet/[address]/batch` - Execute batch
- `POST /api/wallet/[address]/simulate` - Simulate transaction

#### Paymaster Endpoints
- `POST /api/paymaster/sponsor` - Request sponsorship
- `POST /api/paymaster/estimate` - Estimate gas

#### Bundler Endpoints
- `POST /api/bundler/send` - Submit UserOp
- `GET /api/bundler/status/[hash]` - Get UserOp status

See full API documentation at `/docs/api/API.md`

## 🔒 Security

### Best Practices Implemented

1. **Input Validation**: All inputs validated with Zod schemas
2. **Rate Limiting**: API endpoints protected with Upstash Rate Limit
3. **CSRF Protection**: Built-in Next.js CSRF tokens
4. **SQL Injection Prevention**: Prisma parameterized queries
5. **XSS Prevention**: React auto-escaping + CSP headers
6. **Error Handling**: No sensitive data in error messages
7. **Environment Isolation**: Separate dev/staging/prod configs

### Security Considerations

- Never commit `.env.local` or private keys
- Use environment variables for all secrets
- Implement proper authentication for production
- Enable HTTPS in production
- Regular dependency updates
- Monitor error logs for suspicious activity

See `/docs/security-notes.md` for detailed security guidelines.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Deploy to production
vercel --prod
```

Environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local.example`
3. Redeploy

### Self-Hosted with Docker

```bash
# Build and run production containers
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale worker=3
```

### Railway / Render

1. Connect GitHub repository
2. Add environment variables
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `cd frontend && npm start`
5. Add PostgreSQL addon

## 📊 Monitoring & Analytics

### Built-in Monitoring

- **Vercel Analytics**: Automatically enabled
- **Speed Insights**: Page load metrics
- **Error Tracking**: Sentry integration (configure with `SENTRY_DSN`)
- **Logging**: Axiom for structured logs
- **Uptime**: Better Uptime monitoring

### Custom Metrics

Access custom metrics at:
- `/api/analytics/stats` - Platform statistics
- `/api/analytics/gas` - Gas price history

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Format with Prettier before committing
- Write tests for new features
- Update documentation

## 📖 Additional Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System architecture
- [Database Schema](./docs/DATABASE.md) - Database design
- [API Reference](./docs/api/API.md) - Complete API docs
- [Deployment Guide](./docs/guides/DEPLOYMENT.md) - Deployment instructions
- [Security Notes](./docs/security-notes.md) - Security guidelines
- [Foundry CLI Usage](./docs/foundry-cli.md) - CLI commands
- [Contributing Guide](./docs/guides/CONTRIBUTING.md) - How to contribute

## 🎯 Roadmap

- [ ] Multi-sig threshold support
- [ ] Social recovery (guardians)
- [ ] Session keys (temporary permissions)
- [ ] Automated transaction scheduling
- [ ] DeFi integration (swap, stake)
- [ ] NFT viewer and management
- [ ] Mobile app (React Native)
- [ ] Public API & SDK

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Coinbase Smart Wallet](https://www.coinbase.com/wallet/smart-wallet)
- [shadcn/ui](https://ui.shadcn.com/)
- [wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)
- [Scaffold-ETH 2](https://scaffoldeth.io/)
- [Vercel](https://vercel.com/)

## 💬 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Discussions: GitHub Discussions
- Twitter: @smartwallet

---

**Built with ❤️ for the Web3 community**
