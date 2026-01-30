import { http, cookieStorage, createConfig, createStorage } from 'wagmi';
import { base, baseSepolia, mainnet, sepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';

/**
 * Wagmi config for wallet connection and chain RPC.
 * For paymaster/bundler (Pimlico or Coinbase) see lib/config/paymaster.ts and lib/services/paymaster.
 */
export function getConfig() {
  return createConfig({
    chains: [base, baseSepolia, mainnet, sepolia],
    connectors: [
      injected(),
      coinbaseWallet({
        appName: process.env.NEXT_PUBLIC_APP_NAME || 'Smart Wallet Manager',
        preference: 'all',
      }),
      walletConnect({
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
      }),
    ],
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
      [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
      [mainnet.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL),
      [sepolia.id]: http(process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL),
    },
  });
}

declare module 'wagmi' {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
