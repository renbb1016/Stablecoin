import { erc20Abi, type Address } from 'viem';
import { useBalance, useReadContract } from 'wagmi';

import { ACTIVE_NETWORK } from '@/config/networks';

const REFRESH_MS = 15_000;

// Stablecoin balance plus native balance (needed to pay gas) for the active network.
export function useBalances(address: Address | undefined) {
  const { chain, stablecoin } = ACTIVE_NETWORK;

  const token = useReadContract({
    address: stablecoin.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: chain.id,
    query: { enabled: !!address, refetchInterval: REFRESH_MS },
  });

  const gas = useBalance({
    address,
    chainId: chain.id,
    query: { enabled: !!address, refetchInterval: REFRESH_MS },
  });

  return {
    tokenBalance: token.data,
    gasBalance: gas.data?.value,
    isLoading: token.isLoading || gas.isLoading,
    error: token.error ?? gas.error,
    refetch: () => Promise.all([token.refetch(), gas.refetch()]),
  };
}
