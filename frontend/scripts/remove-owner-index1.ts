/**
 * Remove owner at index 1 (compromised EOA) from the smart wallet.
 * Uses the new EOA (index 2) to sign. Pimlico paymaster sponsors gas.
 *
 * Env (set in .env.local or export before run):
 *   SIGNER_PRIVATE_KEY - private key of new EOA (0x0a8Cf...)
 *   NEXT_PUBLIC_PIMLICO_API_KEY or PIMLICO_API_KEY
 *   NEXT_PUBLIC_PIMLICO_BUNDLER_URL (optional, default Pimlico Base URL)
 *   NEXT_PUBLIC_BASE_RPC_URL or RPC_URL (optional; if Alchemy times out, try https://mainnet.base.org)
 *   USE_PAYMASTER=false - skip Pimlico paymaster; wallet pays gas (use if sponsorship fails with AA23)
 *   NEXT_PUBLIC_PAYMASTER_PROVIDER=coinbase - use Coinbase bundler (set CDP_API_KEY if AA23 persists with Pimlico)
 *
 * Run from frontend: npx tsx scripts/remove-owner-index1.ts
 * With .env.local: node -r dotenv/config node_modules/.bin/tsx scripts/remove-owner-index1.ts (dotenv from node)
 * Or: export $(cat .env.local | xargs) && npx tsx scripts/remove-owner-index1.ts
 */

// Load .env.local if present (resolve from script dir so it works from any cwd)
try {
  const fs = require('fs');
  const path = require('path');
  // Resolve from script directory so .env.local is found when run via npm from frontend/
  const envPath = path.resolve(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach((line: string) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const m = trimmed.match(/^([^=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
} catch {
  // ignore
}
// Map PIMLICO_* to NEXT_PUBLIC_* if script is run with server env only
if (!process.env.NEXT_PUBLIC_PIMLICO_API_KEY && process.env.PIMLICO_API_KEY) {
  process.env.NEXT_PUBLIC_PIMLICO_API_KEY = process.env.PIMLICO_API_KEY;
}
if (!process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL && process.env.PIMLICO_BUNDLER_URL) {
  process.env.NEXT_PUBLIC_PIMLICO_BUNDLER_URL = process.env.PIMLICO_BUNDLER_URL;
}
if (!process.env.NEXT_PUBLIC_BASE_RPC_URL && process.env.RPC_URL) {
  process.env.NEXT_PUBLIC_BASE_RPC_URL = process.env.RPC_URL;
}
import {
  createPublicClient,
  createWalletClient,
  http,
  type Address,
  type Hex,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  encodeAbiParameters,
  encodePacked,
  numberToHex,
  parseAbiParameters,
  parseSignature,
  size,
} from 'viem';
import { base } from 'viem/chains';
import {
  getUserOperationHash,
  entryPoint06Abi,
  entryPoint06Address,
} from 'viem/account-abstraction';
import { addressToOwnerBytes } from '../lib/utils';
import { encodeRemoveOwnerAtIndex } from '../lib/services/bundler/userOpService';
import { getPaymasterConfig } from '../lib/config/paymaster';
import { createPaymasterClient } from '../lib/services/paymaster/paymasterClient';
import { smartWalletAbi } from '../lib/contracts/abis/SmartWallet';

const DEBUG_LOG_URL = 'http://127.0.0.1:7247/ingest/a5f40433-2739-445d-8ac9-120ec920b4df';
function debugLog(location: string, message: string, data: Record<string, unknown>, hypothesisId: string) {
  const payload = { location, message, data, timestamp: Date.now(), sessionId: 'debug-session', hypothesisId };
  fetch(DEBUG_LOG_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  try {
    const path = require('path');
    const fs = require('fs');
    const logPath = path.join(process.cwd(), 'debug-remove-owner.log');
    fs.appendFileSync(logPath, JSON.stringify(payload) + '\n');
  } catch {
    // ignore
  }
}

const CHAIN_ID = Number(process.env.CHAIN_ID ?? 8453);
const SMART_WALLET = (process.env.SMART_WALLET_ADDRESS ??
  '0xb002749220ec78bee1a2dcf47bc58a308b6d7b4f') as Address;
const REMOVE_INDEX = BigInt(process.env.REMOVE_OWNER_INDEX ?? '1');
const COMPROMISED = (process.env.COMPROMISED_OWNER_ADDRESS ??
  '0xDA6fDF1002bB0E2e5EDC45440C3975dbb54799A8') as Address;
const SIGNER_KEY = process.env.SIGNER_PRIVATE_KEY;
const RPC_URL =
  process.env.RPC_URL ??
  process.env.NEXT_PUBLIC_BASE_RPC_URL ??
  'https://mainnet.base.org';
const OWNER_INDEX_FOR_SIGNATURE = 2; // new EOA is at index 2

// Match viem toCoinbaseSmartAccount: 65-byte sig → packed (r, s, v) for signatureData
function wrapSignature(ownerIndex: number, signature: Hex): Hex {
  const signatureData =
    size(signature) !== 65
      ? signature
      : (() => {
          const sig = parseSignature(signature);
          return encodePacked(
            ['bytes32', 'bytes32', 'uint8'],
            [sig.r, sig.s, sig.yParity === 0 ? 27 : 28]
          ) as Hex;
        })();
  return encodeAbiParameters(
    parseAbiParameters('uint8 ownerIndex, bytes signatureData'),
    [ownerIndex, signatureData]
  ) as Hex;
}

function toReplaySafeTypedData(smartWallet: Address, chainId: number, hash: Hex) {
  return {
    domain: {
      chainId,
      name: 'Coinbase Smart Wallet',
      verifyingContract: smartWallet,
      version: '1',
    },
    types: {
      CoinbaseSmartWalletMessage: [{ name: 'hash', type: 'bytes32' }],
    },
    primaryType: 'CoinbaseSmartWalletMessage' as const,
    message: { hash },
  };
}

async function main() {
  debugLog('remove-owner-index1.ts:main', 'main() started', { usePaymasterEnv: process.env.USE_PAYMASTER }, 'H_sim');
  let raw = (process.env.SIGNER_PRIVATE_KEY ?? '').replace(/^\uFEFF/, '').trim();
  if (!raw) {
    throw new Error(
      'SIGNER_PRIVATE_KEY is not set. Add it to frontend/.env.local: SIGNER_PRIVATE_KEY=0x... (private key of new EOA at index 2)'
    );
  }
  if (!raw.startsWith('0x')) {
    if (/^[a-fA-F0-9]{64}$/.test(raw)) raw = '0x' + raw;
    else {
      throw new Error(
        'SIGNER_PRIVATE_KEY must be 0x followed by 64 hex chars. In .env.local use one line: SIGNER_PRIVATE_KEY=0x... with no spaces around ='
      );
    }
  }
  const SIGNER_KEY = raw;

  const account = privateKeyToAccount(SIGNER_KEY as Hex);
  const transport = http(RPC_URL, {
    timeout: 30_000,
    retryCount: 3,
    retryDelay: 1_000,
  });
  const publicClient = createPublicClient({
    chain: base,
    transport,
  });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport,
  });

  console.log('Smart wallet:', SMART_WALLET);
  console.log('Removing owner at index', REMOVE_INDEX.toString(), '(compromised):', COMPROMISED);
  console.log('Signer (new EOA):', account.address);

  const nonceBigInt = await publicClient.readContract({
    address: entryPoint06Address,
    abi: entryPoint06Abi,
    functionName: 'getNonce',
    args: [SMART_WALLET, 0n],
  });
  const nonceHex = numberToHex(nonceBigInt) as Hex;
  // #region agent log
  debugLog('remove-owner-index1.ts:nonce', 'nonce read', { nonceKey: '0', nonceBigInt: nonceBigInt.toString(), nonceHex }, 'H3');
  // #endregion

  const ownerBytes = addressToOwnerBytes(COMPROMISED) as Hex;
  const onChainOwnerAtIndex1 = await publicClient.readContract({
    address: SMART_WALLET,
    abi: smartWalletAbi,
    functionName: 'ownerAtIndex',
    args: [REMOVE_INDEX],
  }) as Hex;
  // #region agent log
  debugLog('remove-owner-index1.ts:ownerBytes', 'owner bytes vs on-chain', {
    ownerBytesWeSend: ownerBytes,
    onChainOwnerAtIndex1,
    bytesMatch: ownerBytes.toLowerCase() === (onChainOwnerAtIndex1 ?? '').toLowerCase(),
    ownerBytesLen: ownerBytes.length,
    onChainLen: (onChainOwnerAtIndex1 ?? '').length,
  }, 'H1');
  // #endregion

  const callData = encodeRemoveOwnerAtIndex(REMOVE_INDEX, ownerBytes);

  const config = getPaymasterConfig(CHAIN_ID);
  const paymaster = createPaymasterClient(config);
  const gasPrice = await paymaster.getGasPrice(CHAIN_ID);
  const gas = gasPrice.standard;
  // Higher default gas limits to avoid OOG during simulation (bundler will use these for sim too)
  const defaultCallGas = '0xc3500';       // 800000
  const defaultVerificationGas = '0x124f80'; // 1200000
  const defaultPreVerificationGas = '0x30d40'; // 200000
  // #region agent log
  debugLog('remove-owner-index1.ts:gas', 'gas limits before sponsorship (increased for OOG)', {
    callGasLimit: defaultCallGas,
    verificationGasLimit: defaultVerificationGas,
    preVerificationGas: defaultPreVerificationGas,
    maxFeePerGas: gas.maxFeePerGas,
    maxPriorityFeePerGas: gas.maxPriorityFeePerGas,
  }, 'H2');
  // #endregion

  let partialUserOp = {
    sender: SMART_WALLET,
    nonce: nonceHex,
    initCode: '0x' as Hex,
    callData,
    callGasLimit: defaultCallGas as Hex,
    verificationGasLimit: defaultVerificationGas as Hex,
    preVerificationGas: defaultPreVerificationGas as Hex,
    maxFeePerGas: gas.maxFeePerGas,
    maxPriorityFeePerGas: gas.maxPriorityFeePerGas,
  };

  // #region agent log
  debugLog('remove-owner-index1.ts:preSponsor', 'before pm_sponsorUserOperation', {
    sender: partialUserOp.sender,
    entryPoint: config.entryPoint,
    callDataLength: partialUserOp.callData.length,
    callDataPrefix: partialUserOp.callData.slice(0, 20),
  }, 'H4');
  // #endregion

  let gasEstimate: { callGasLimit?: string; verificationGasLimit?: string; preVerificationGas?: string } | null = null;
  try {
    gasEstimate = await paymaster.estimateUserOperationGas(
      { ...partialUserOp, paymasterAndData: '0x' as Hex },
      config.entryPoint
    );
  } catch (e) {
    // #region agent log
    debugLog('remove-owner-index1.ts:estimateGas', 'estimateUserOperationGas failed', {
      errorMessage: e instanceof Error ? e.message : String(e),
    }, 'H2');
    // #endregion
  }
  // Apply bundler gas estimate when available (add 20% buffer to avoid OOG)
  if (gasEstimate) {
    const addBuffer = (v: string | undefined, pct = 20) =>
      v ? numberToHex((BigInt(v) * BigInt(100 + pct)) / 100n) as Hex : undefined;
    partialUserOp = {
      ...partialUserOp,
      callGasLimit: (addBuffer(gasEstimate.callGasLimit) ?? partialUserOp.callGasLimit) as Hex,
      verificationGasLimit: (addBuffer(gasEstimate.verificationGasLimit) ?? partialUserOp.verificationGasLimit) as Hex,
      preVerificationGas: (addBuffer(gasEstimate.preVerificationGas, 30) ?? partialUserOp.preVerificationGas) as Hex,
    };
    debugLog('remove-owner-index1.ts:gasEstimate', 'estimated gas from bundler applied', {
      estimated: gasEstimate,
      weUse: {
        callGasLimit: partialUserOp.callGasLimit,
        verificationGasLimit: partialUserOp.verificationGasLimit,
        preVerificationGas: partialUserOp.preVerificationGas,
      },
    }, 'H2');
  }

  const usePaymaster = process.env.USE_PAYMASTER !== 'false';
  let paymasterAndData: Hex = '0x';

  if (usePaymaster) {
    try {
      const sponsorship = await paymaster.sponsorUserOperation(
        partialUserOp,
        config.entryPoint
      );
      paymasterAndData = sponsorship.paymasterAndData;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('AA23')) {
        console.warn(
          'Sponsorship failed with AA23 (Coinbase Smart Wallet reverts on empty signature during Pimlico simulation). Retry with USE_PAYMASTER=false so the wallet pays gas.'
        );
      }
      throw e;
    }
  } else {
    // #region agent log
    debugLog('remove-owner-index1.ts:noPaymaster', 'using no-paymaster path (wallet pays gas)', { usePaymaster: false }, 'H_sim');
    // #endregion
    console.log('Using no-paymaster path (wallet pays gas). Ensure the smart wallet has ETH on Base.');
  }

  const userOpForHash = {
    ...partialUserOp,
    paymasterAndData,
    signature: '0x' as Hex,
  };

  const userOpHash = getUserOperationHash({
    chainId: CHAIN_ID,
    entryPointAddress: config.entryPoint,
    entryPointVersion: '0.6',
    userOperation: {
      sender: userOpForHash.sender,
      nonce: nonceBigInt,
      initCode: userOpForHash.initCode,
      callData: userOpForHash.callData,
      callGasLimit: BigInt(partialUserOp.callGasLimit),
      verificationGasLimit: BigInt(partialUserOp.verificationGasLimit),
      preVerificationGas: BigInt(partialUserOp.preVerificationGas),
      maxFeePerGas: BigInt(partialUserOp.maxFeePerGas),
      maxPriorityFeePerGas: BigInt(partialUserOp.maxPriorityFeePerGas),
      paymasterAndData: userOpForHash.paymasterAndData,
      signature: userOpForHash.signature,
    },
  });

  // Coinbase Smart Wallet + viem: sign the raw userOpHash (no EIP-191 prefix). Contract verifies via ecrecover(hash).
  const signature = await account.sign({ hash: userOpHash });
  const wrappedSignature = wrapSignature(OWNER_INDEX_FOR_SIGNATURE, signature);

  const signedUserOp = {
    ...userOpForHash,
    signature: wrappedSignature,
  };

  const bundlerUrl =
    config.provider === 'pimlico'
      ? config.pimlico?.bundlerUrl
      : config.coinbase?.bundlerUrl;
  const apiKey =
    config.provider === 'pimlico'
      ? config.pimlico?.apiKey
      : config.coinbase?.apiKey;

  if (!bundlerUrl) throw new Error('Bundler URL not configured');
  const url = bundlerUrl.includes('?') ? `${bundlerUrl}&apikey=${apiKey}` : `${bundlerUrl}?apikey=${apiKey}`;

  // #region agent log
  debugLog('remove-owner-index1.ts:preSend', 'before eth_sendUserOperation', {
    paymasterAndDataLen: signedUserOp.paymasterAndData.length,
    paymasterUsed: signedUserOp.paymasterAndData !== '0x',
  }, 'H_sim');
  // #endregion

  const sendParams = [
    {
      sender: signedUserOp.sender,
      nonce: signedUserOp.nonce,
      initCode: signedUserOp.initCode,
      callData: signedUserOp.callData,
      callGasLimit: signedUserOp.callGasLimit,
      verificationGasLimit: signedUserOp.verificationGasLimit,
      preVerificationGas: signedUserOp.preVerificationGas,
      maxFeePerGas: signedUserOp.maxFeePerGas,
      maxPriorityFeePerGas: signedUserOp.maxPriorityFeePerGas,
      paymasterAndData: signedUserOp.paymasterAndData,
      signature: signedUserOp.signature,
    },
    config.entryPoint,
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_sendUserOperation',
      params: sendParams,
    }),
  });

  const json = (await res.json()) as { result?: Hex; error?: { message: string } };
  // #region agent log
  debugLog('remove-owner-index1.ts:sendResult', 'eth_sendUserOperation response', {
    hasResult: !!json.result,
    hasError: !!json.error,
    errorMessage: json.error?.message,
  }, 'H_sim');
  // #endregion
  if (json.error) {
    throw new Error(`Bundler error: ${json.error.message}`);
  }
  if (!json.result) {
    throw new Error('Bundler: no userOpHash in response');
  }

  console.log('UserOp submitted. userOpHash:', json.result);
  console.log('Wait for inclusion, then check wallet owners again.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
