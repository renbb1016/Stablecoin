import { BaseError, erc20Abi, UserRejectedRequestError, type Address } from 'viem';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

import { ACTIVE_NETWORK } from '@/config/networks';

export type SendStatus = 'idle' | 'awaiting-wallet' | 'pending' | 'confirmed' | 'failed';

export function friendlyError(error: unknown): string {
  if (error instanceof BaseError) {
    if (error.walk((e) => e instanceof UserRejectedRequestError)) {
      return 'You rejected the request in your wallet.';
    }
    return error.shortMessage;
  }
  return error instanceof Error ? error.message : 'Something went wrong.';
}

// Sends the active network's stablecoin via ERC-20 `transfer` and tracks it until mined.
export function useSendToken() {
  const { chain, stablecoin } = ACTIVE_NETWORK;
  const write = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash: write.data, chainId: chain.id });

  let status: SendStatus = 'idle';
  if (write.isPending) status = 'awaiting-wallet';
  else if (write.isError) status = 'failed';
  else if (write.data) {
    if (receipt.isError || receipt.data?.status === 'reverted') status = 'failed';
    else if (receipt.data?.status === 'success') status = 'confirmed';
    else status = 'pending';
  }

  const rawError = write.error ?? receipt.error;
  const error =
    status !== 'failed'
      ? null
      : rawError
        ? friendlyError(rawError)
        : 'The transaction reverted on-chain.';

  const send = (to: Address, value: bigint) =>
    write.writeContract({
      address: stablecoin.address,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, value],
      chainId: chain.id,
    });

  return { send, status, hash: write.data, error, reset: write.reset };
}
