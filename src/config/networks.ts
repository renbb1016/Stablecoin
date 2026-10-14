import type { Address, Chain } from 'viem';
import { baseSepolia } from 'viem/chains';

export type Stablecoin = {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
};

export type NetworkConfig = {
  chain: Chain;
  stablecoin: Stablecoin;
  explorerUrl: string;
  faucetUrl: string;
};

// Circle's testnet USDC on Base Sepolia: https://developers.circle.com/stablecoins/usdc-contract-addresses
export const BASE_SEPOLIA: NetworkConfig = {
  chain: baseSepolia,
  stablecoin: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    decimals: 6,
  },
  explorerUrl: 'https://sepolia.basescan.org',
  faucetUrl: 'https://faucet.circle.com',
};

// To support another chain (e.g. Arc testnet), add a NetworkConfig above and point this at it.
export const ACTIVE_NETWORK = BASE_SEPOLIA;

export const txUrl = (hash: string) => `${ACTIVE_NETWORK.explorerUrl}/tx/${hash}`;
export const addressUrl = (address: string) => `${ACTIVE_NETWORK.explorerUrl}/address/${address}`;
