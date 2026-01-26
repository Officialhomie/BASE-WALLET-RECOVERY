# Full-Stack Smart Wallet Management Platform Architecture

## Overview
A production-grade, full-stack platform for managing Coinbase Smart Wallets with advanced features combining the best aspects of Next.js enterprise architecture, lightweight performance, and developer tooling.

## Tech Stack

### Frontend Layer
- **Framework**: Next.js 14 (App Router) + TypeScript 5.3+
- **UI Framework**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Web3**: wagmi v2 + viem v2 + RainbowKit v2
- **State Management**: Zustand v4 + TanStack Query v5
- **Forms**: React Hook Form v7 + Zod v3
- **Typography**: Geist Sans + Geist Mono (Vercel fonts)
- **Animations**: Framer Motion v11
- **Charts**: Recharts v2
- **Icons**: Lucide React
- **Testing**: Vitest + Testing Library + Playwright

### Backend Layer
- **API**: Next.js 14 API Routes (Edge Runtime)
- **Database**: PostgreSQL 16 + Prisma ORM v5
- **Cache**: Redis 7 (Upstash)
- **Queue**: BullMQ for background jobs
- **WebSocket**: Pusher for real-time updates
- **Authentication**: NextAuth.js v5 (optional for saved sessions)
- **Rate Limiting**: Upstash Rate Limit
- **Validation**: Zod

### Blockchain Layer
- **RPC Provider**: Alchemy / QuickNode
- **Indexing**: Custom event indexer + The Graph (subgraph)
- **Paymaster**: Coinbase Paymaster API
- **Bundler**: Coinbase Bundler API
- **Simulation**: Tenderly API
- **Gas Oracle**: Custom aggregator

### Smart Contract Layer
- **Main Contract**: Coinbase Smart Wallet (existing)
- **Testing**: Foundry (existing)
- **Deployment**: Foundry scripts (existing)
- **ABI Management**: wagmi CLI for type generation

### Infrastructure
- **Hosting**: Vercel (Frontend + API) + Railway (Database)
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + Axiom
- **Analytics**: Vercel Analytics + PostHog
- **Environment**: .env.local (development) + Vercel Env (production)

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Next.js App Router  │  RainbowKit  │  wagmi  │  TanStack Query │
│  shadcn/ui Components │  Framer Motion │  Zustand State Store   │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ├─── WebSocket (Pusher) ───┐
                │                           │
┌───────────────▼─────────────────────────────────────────────────┐
│                      APPLICATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                    Next.js API Routes                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Wallet     │  Transaction │   Paymaster  │   Bundler    │ │
│  │   Service    │   Service    │   Service    │   Service    │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Indexer    │  Simulation  │   Analytics  │   Webhook    │ │
│  │   Service    │   Service    │   Service    │   Handler    │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ├─── Prisma ORM ────────┐
                │                       │
┌───────────────▼─────────────────┐  ┌─▼──────────────┐
│       DATA LAYER                │  │  CACHE LAYER   │
├─────────────────────────────────┤  ├────────────────┤
│      PostgreSQL Database        │  │  Redis Cache   │
│  ┌────────────────────────────┐ │  │  - Sessions    │
│  │ Tables:                    │ │  │  - TX Status   │
│  │  - wallets                 │ │  │  - Gas Prices  │
│  │  - owners                  │ │  │  - Rate Limits │
│  │  - transactions            │ │  └────────────────┘
│  │  - events                  │ │
│  │  - user_operations         │ │
│  │  - analytics               │ │
│  └────────────────────────────┘ │
└─────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │   Base RPC   │  EntryPoint  │   Paymaster  │   Bundler    │ │
│  │   Provider   │   Contract   │      API     │     API      │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │ Smart Wallet │  Event Logs  │   The Graph  │   Tenderly   │
│  │   Contract   │   Indexer    │   Subgraph   │  Simulation  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
BASE-WALLET-RECOVERY/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── test.yml
│   └── ISSUE_TEMPLATE/
├── frontend/                          # Next.js 14 Application
│   ├── app/
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Landing page
│   │   ├── providers.tsx             # All context providers
│   │   ├── api/                      # API Routes (Backend)
│   │   │   ├── wallet/
│   │   │   │   ├── [address]/
│   │   │   │   │   ├── owners/route.ts
│   │   │   │   │   ├── transactions/route.ts
│   │   │   │   │   └── events/route.ts
│   │   │   │   └── create/route.ts
│   │   │   ├── paymaster/
│   │   │   │   ├── sponsor/route.ts
│   │   │   │   └── estimate/route.ts
│   │   │   ├── bundler/
│   │   │   │   ├── send/route.ts
│   │   │   │   └── status/route.ts
│   │   │   ├── simulation/
│   │   │   │   └── simulate/route.ts
│   │   │   ├── indexer/
│   │   │   │   ├── sync/route.ts
│   │   │   │   └── webhook/route.ts
│   │   │   └── analytics/
│   │   │       └── stats/route.ts
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Main dashboard
│   │   │   └── layout.tsx
│   │   ├── wallet/
│   │   │   ├── [address]/
│   │   │   │   ├── page.tsx          # Wallet overview
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── owners/
│   │   │   │   │   ├── page.tsx      # Owner management
│   │   │   │   │   ├── add/page.tsx
│   │   │   │   │   └── remove/page.tsx
│   │   │   │   ├── execute/
│   │   │   │   │   ├── page.tsx      # Execute transactions
│   │   │   │   │   ├── single/page.tsx
│   │   │   │   │   ├── batch/page.tsx
│   │   │   │   │   └── userop/page.tsx
│   │   │   │   ├── history/
│   │   │   │   │   └── page.tsx      # Transaction history
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx      # Wallet analytics
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx      # Wallet settings
│   │   │   │   └── debug/
│   │   │   │       └── page.tsx      # Debug panel (Scaffold-ETH style)
│   │   │   └── connect/page.tsx      # Wallet connection
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   ├── wallet/
│   │   │   ├── wallet-overview.tsx
│   │   │   ├── wallet-stats.tsx
│   │   │   ├── owner-list.tsx
│   │   │   ├── owner-card.tsx
│   │   │   ├── add-owner-dialog.tsx
│   │   │   ├── remove-owner-dialog.tsx
│   │   │   ├── owner-type-selector.tsx
│   │   │   └── owner-verification-badge.tsx
│   │   ├── execution/
│   │   │   ├── execute-single-form.tsx
│   │   │   ├── execute-batch-builder.tsx
│   │   │   ├── batch-call-card.tsx
│   │   │   ├── userop-builder.tsx
│   │   │   ├── gas-estimator.tsx
│   │   │   ├── simulation-preview.tsx
│   │   │   └── transaction-simulator.tsx
│   │   ├── history/
│   │   │   ├── transaction-list.tsx
│   │   │   ├── transaction-card.tsx
│   │   │   ├── transaction-details.tsx
│   │   │   ├── event-log-viewer.tsx
│   │   │   ├── filter-panel.tsx
│   │   │   └── export-button.tsx
│   │   ├── analytics/
│   │   │   ├── gas-usage-chart.tsx
│   │   │   ├── transaction-timeline.tsx
│   │   │   ├── owner-activity-chart.tsx
│   │   │   └── wallet-health-score.tsx
│   │   ├── debug/
│   │   │   ├── contract-debugger.tsx
│   │   │   ├── function-caller.tsx
│   │   │   ├── read-functions-panel.tsx
│   │   │   ├── write-functions-panel.tsx
│   │   │   ├── event-listener.tsx
│   │   │   └── state-inspector.tsx
│   │   ├── shared/
│   │   │   ├── wallet-connect-button.tsx
│   │   │   ├── network-switcher.tsx
│   │   │   ├── address-display.tsx
│   │   │   ├── transaction-status.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   └── copy-button.tsx
│   │   └── layout/
│   │       ├── navbar.tsx
│   │       ├── sidebar.tsx
│   │       ├── footer.tsx
│   │       └── theme-toggle.tsx
│   ├── lib/
│   │   ├── contracts/
│   │   │   ├── smartWallet.ts        # Contract instance factory
│   │   │   ├── abis/
│   │   │   │   ├── SmartWallet.ts    # Generated types
│   │   │   │   └── EntryPoint.ts
│   │   │   └── addresses.ts          # Contract addresses
│   │   ├── hooks/
│   │   │   ├── wallet/
│   │   │   │   ├── useSmartWallet.ts
│   │   │   │   ├── useWalletInfo.ts
│   │   │   │   ├── useOwners.ts
│   │   │   │   ├── useAddOwner.ts
│   │   │   │   └── useRemoveOwner.ts
│   │   │   ├── execution/
│   │   │   │   ├── useExecute.ts
│   │   │   │   ├── useExecuteBatch.ts
│   │   │   │   └── useExecuteUserOp.ts
│   │   │   ├── history/
│   │   │   │   ├── useTransactionHistory.ts
│   │   │   │   ├── useEventLogs.ts
│   │   │   │   └── useUserOpHistory.ts
│   │   │   ├── analytics/
│   │   │   │   ├── useGasAnalytics.ts
│   │   │   │   └── useWalletStats.ts
│   │   │   └── shared/
│   │   │       ├── useDebounce.ts
│   │   │       ├── useLocalStorage.ts
│   │   │       └── useWebSocket.ts
│   │   ├── services/
│   │   │   ├── wallet/
│   │   │   │   ├── walletService.ts
│   │   │   │   └── ownerService.ts
│   │   │   ├── paymaster/
│   │   │   │   ├── paymasterClient.ts
│   │   │   │   └── sponsorshipService.ts
│   │   │   ├── bundler/
│   │   │   │   ├── bundlerClient.ts
│   │   │   │   └── userOpService.ts
│   │   │   ├── indexer/
│   │   │   │   ├── eventIndexer.ts
│   │   │   │   └── transactionIndexer.ts
│   │   │   ├── simulation/
│   │   │   │   └── tenderlyClient.ts
│   │   │   └── analytics/
│   │   │       └── analyticsService.ts
│   │   ├── utils/
│   │   │   ├── encoding.ts           # Encode/decode helpers
│   │   │   ├── validation.ts         # Zod schemas
│   │   │   ├── formatting.ts         # Address, number formatting
│   │   │   ├── errors.ts             # Error handling
│   │   │   ├── constants.ts          # App constants
│   │   │   └── helpers.ts            # Misc helpers
│   │   ├── store/
│   │   │   ├── walletStore.ts        # Zustand wallet store
│   │   │   ├── uiStore.ts            # Zustand UI store
│   │   │   └── debugStore.ts         # Zustand debug store
│   │   ├── types/
│   │   │   ├── wallet.ts
│   │   │   ├── transaction.ts
│   │   │   ├── userOp.ts
│   │   │   ├── owner.ts
│   │   │   └── api.ts
│   │   └── config/
│   │       ├── wagmi.ts              # wagmi config
│   │       ├── chains.ts             # Chain configs
│   │       └── env.ts                # Env validation
│   ├── public/
│   │   ├── fonts/
│   │   ├── images/
│   │   └── favicon.ico
│   ├── styles/
│   │   └── globals.css
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── .env.local.example
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── postcss.config.js
│   └── components.json               # shadcn/ui config
├── backend/                           # Standalone services (optional)
│   ├── indexer/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── eventListener.ts
│   │   │   ├── blockProcessor.ts
│   │   │   └── database.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   └── worker/
│       ├── src/
│       │   ├── index.ts
│       │   ├── jobs/
│       │   │   ├── syncTransactions.ts
│       │   │   ├── updateGasPrices.ts
│       │   │   └── cleanupOldData.ts
│       │   └── queue.ts
│       ├── Dockerfile
│       └── package.json
├── contracts/                         # Smart contract layer (existing + new)
│   ├── src/
│   │   └── interfaces/
│   │       └── ICoinbaseSmartWallet.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   └── ... (existing scripts)
│   ├── test/
│   │   ├── SmartWallet.t.sol
│   │   └── ...
│   └── foundry.toml
├── database/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── docker-compose.yml
├── subgraph/                          # The Graph subgraph
│   ├── schema.graphql
│   ├── subgraph.yaml
│   ├── src/
│   │   └── mapping.ts
│   └── package.json
├── docs/
│   ├── api/
│   │   └── API.md
│   ├── architecture/
│   │   ├── ARCHITECTURE.md
│   │   ├── DATABASE.md
│   │   └── SECURITY.md
│   ├── guides/
│   │   ├── GETTING_STARTED.md
│   │   ├── DEPLOYMENT.md
│   │   └── CONTRIBUTING.md
│   └── ... (existing docs)
├── scripts/
│   ├── setup.sh
│   ├── deploy.sh
│   └── ... (existing scripts)
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── README.md
└── package.json
```

## Database Schema (Prisma)

```prisma
model Wallet {
  id                String          @id @default(cuid())
  address           String          @unique
  chainId           Int
  implementation    String?
  entryPoint        String
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  owners            Owner[]
  transactions      Transaction[]
  userOperations    UserOperation[]
  events            Event[]
  analytics         WalletAnalytics?

  @@index([address, chainId])
}

model Owner {
  id              String          @id @default(cuid())
  walletId        String
  wallet          Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)

  index           Int
  ownerType       OwnerType       // ADDRESS, PUBLIC_KEY
  ownerBytes      String
  ownerAddress    String?
  publicKeyX      String?
  publicKeyY      String?

  addedAt         DateTime        @default(now())
  addedInTx       String
  removedAt       DateTime?
  removedInTx     String?
  isActive        Boolean         @default(true)

  @@unique([walletId, index])
  @@index([walletId, isActive])
}

model Transaction {
  id                String          @id @default(cuid())
  walletId          String
  wallet            Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)

  hash              String          @unique
  blockNumber       BigInt
  blockHash         String
  timestamp         DateTime

  from              String
  to                String
  value             String
  data              String?
  gasUsed           String
  gasPrice          String
  status            TxStatus        // SUCCESS, FAILED, PENDING

  type              TxType          // EXECUTE, BATCH, USEROP, OWNER_ADD, OWNER_REMOVE
  functionName      String?
  decodedInput      Json?

  events            Event[]

  @@index([walletId, timestamp])
  @@index([hash])
}

model UserOperation {
  id                    String          @id @default(cuid())
  walletId              String
  wallet                Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)

  userOpHash            String          @unique
  sender                String
  nonce                 BigInt
  callData              String
  callGasLimit          String
  verificationGasLimit  String
  preVerificationGas    String
  maxFeePerGas          String
  maxPriorityFeePerGas  String
  paymasterAndData      String?
  signature             String

  bundlerUrl            String?
  paymasterUrl          String?
  sponsored             Boolean         @default(false)

  status                UserOpStatus    // PENDING, INCLUDED, FAILED
  transactionHash       String?
  blockNumber           BigInt?

  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  @@index([walletId, createdAt])
  @@index([userOpHash])
}

model Event {
  id              String          @id @default(cuid())
  walletId        String
  wallet          Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)
  transactionId   String?
  transaction     Transaction?    @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  eventName       String          // AddOwner, RemoveOwner, Upgraded
  blockNumber     BigInt
  transactionHash String
  logIndex        Int

  args            Json            // Event arguments
  timestamp       DateTime

  @@index([walletId, eventName])
  @@index([transactionHash])
}

model WalletAnalytics {
  id                    String          @id @default(cuid())
  walletId              String          @unique
  wallet                Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)

  totalTransactions     Int             @default(0)
  totalUserOps          Int             @default(0)
  totalGasUsed          String          @default("0")
  totalGasSpent         String          @default("0")

  ownersAddedCount      Int             @default(0)
  ownersRemovedCount    Int             @default(0)
  currentOwnerCount     Int             @default(0)

  lastActivityAt        DateTime?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt
}

enum OwnerType {
  ADDRESS
  PUBLIC_KEY
}

enum TxStatus {
  SUCCESS
  FAILED
  PENDING
}

enum TxType {
  EXECUTE
  BATCH
  USEROP
  OWNER_ADD
  OWNER_REMOVE
  UPGRADE
  OTHER
}

enum UserOpStatus {
  PENDING
  INCLUDED
  FAILED
}
```

## API Routes

### Wallet Routes
- `GET /api/wallet/[address]` - Get wallet info
- `GET /api/wallet/[address]/owners` - List owners
- `GET /api/wallet/[address]/transactions` - Get transaction history
- `GET /api/wallet/[address]/events` - Get event logs
- `GET /api/wallet/[address]/analytics` - Get wallet analytics

### Execution Routes
- `POST /api/wallet/[address]/execute` - Execute single transaction
- `POST /api/wallet/[address]/batch` - Execute batch transactions
- `POST /api/wallet/[address]/simulate` - Simulate transaction

### Owner Management Routes
- `POST /api/wallet/[address]/owners/add` - Add owner
- `POST /api/wallet/[address]/owners/remove` - Remove owner
- `GET /api/wallet/[address]/owners/verify` - Verify owner

### Paymaster Routes
- `POST /api/paymaster/sponsor` - Request sponsorship
- `POST /api/paymaster/estimate` - Estimate UserOp gas

### Bundler Routes
- `POST /api/bundler/send` - Submit UserOp
- `GET /api/bundler/status/[hash]` - Get UserOp status

### Simulation Routes
- `POST /api/simulation/simulate` - Simulate with Tenderly

### Indexer Routes
- `POST /api/indexer/sync` - Trigger manual sync
- `POST /api/indexer/webhook` - Webhook handler for events

### Analytics Routes
- `GET /api/analytics/stats` - Get platform stats
- `GET /api/analytics/gas` - Get gas price history

## Key Features

### 1. Owner Management
- **Visual Owner Dashboard**: See all owners with type badges (Address/PubKey)
- **Add Owner Wizard**: Step-by-step flow for adding owners
- **Remove Owner with Safety**: Warnings when removing last owner
- **Owner Verification**: Verify ownership on-chain
- **Import/Export**: Backup owners as JSON

### 2. Transaction Execution
- **Single Execution**: Execute any contract call
- **Batch Builder**: Drag-and-drop batch composer
- **UserOp Builder**: Build and submit UserOperations
- **Gas Estimation**: Real-time gas estimates
- **Simulation**: Preview execution with Tenderly
- **Paymaster Integration**: Gasless transactions

### 3. Transaction History
- **Filterable List**: Filter by type, status, date
- **Detailed View**: Decode input/output, view logs
- **Export**: Download history as CSV/JSON
- **Real-time Updates**: WebSocket for live updates

### 4. Analytics Dashboard
- **Gas Usage Charts**: Visualize gas spending over time
- **Transaction Timeline**: Activity timeline
- **Owner Activity**: Track owner operations
- **Wallet Health Score**: Security and activity score

### 5. Debug Panel (Scaffold-ETH Style)
- **Read Functions**: Auto-generated UI for view functions
- **Write Functions**: Auto-generated UI for state-changing functions
- **Event Listener**: Live event monitoring
- **State Inspector**: Inspect contract state
- **Function Caller**: Generic function caller with ABI

### 6. Advanced Features
- **Multi-chain Support**: Base, Ethereum, Optimism, Arbitrum
- **Network Switcher**: Easy network switching
- **Dark/Light Mode**: Fully themed
- **PWA Support**: Installable web app
- **Notifications**: Email/push for important events
- **Social Recovery**: UI for guardian-based recovery (future)

## Security Features

1. **Input Validation**: All inputs validated with Zod
2. **Rate Limiting**: Prevent API abuse
3. **CSRF Protection**: NextAuth.js CSRF tokens
4. **SQL Injection Prevention**: Prisma parameterized queries
5. **XSS Prevention**: React auto-escaping + CSP headers
6. **Error Handling**: No sensitive data in error messages
7. **Audit Logging**: All critical operations logged
8. **Environment Isolation**: Separate dev/staging/prod configs

## Performance Optimizations

1. **Code Splitting**: Route-based splitting
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: Geist fonts with font-display: swap
4. **Caching**: Redis for API responses, React Query for client
5. **Edge Runtime**: API routes on Edge for low latency
6. **Bundle Analysis**: Regular bundle size monitoring
7. **Lazy Loading**: Lazy load heavy components
8. **Virtual Lists**: Virtualize long transaction lists

## Deployment Strategy

### Development
```bash
docker-compose up -d           # Start Postgres + Redis
npm run db:push                # Sync Prisma schema
npm run dev                    # Start Next.js dev server
```

### Production (Vercel)
```bash
# Automated via GitHub Actions
1. Push to main branch
2. Vercel builds and deploys frontend + API routes
3. Database migrations run automatically
4. Environment variables from Vercel dashboard
```

### Self-hosted
```bash
docker-compose -f docker-compose.prod.yml up -d
# Includes: Next.js, PostgreSQL, Redis, Indexer, Worker
```

## Monitoring & Observability

- **Error Tracking**: Sentry
- **Logging**: Axiom (structured logs)
- **Analytics**: PostHog (product analytics)
- **Uptime**: Better Uptime
- **Performance**: Vercel Speed Insights
- **Metrics**: Custom metrics dashboard

## Testing Strategy

1. **Unit Tests**: Vitest for utils, hooks, services
2. **Integration Tests**: API route testing
3. **E2E Tests**: Playwright for critical user flows
4. **Contract Tests**: Foundry tests (existing)
5. **Visual Regression**: Chromatic (Storybook)
6. **Load Testing**: k6 for API endpoints

## Documentation

- **API Docs**: OpenAPI/Swagger
- **Component Docs**: Storybook
- **Architecture Docs**: ADRs (Architecture Decision Records)
- **User Guides**: In-app help + external docs
- **Developer Docs**: Setup, contribution guidelines

## Future Enhancements

1. **Multi-sig Support**: Threshold signatures
2. **Social Recovery**: Guardian-based recovery
3. **Session Keys**: Temporary permissions
4. **Automated Strategies**: Scheduled transactions
5. **DeFi Integration**: Swap, stake directly from wallet
6. **NFT Support**: View and manage NFTs
7. **Mobile App**: React Native companion app
8. **API SDK**: JavaScript SDK for developers
