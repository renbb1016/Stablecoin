import { formatUnits } from 'viem';

export const shortenAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

// Formats a raw token amount for display, trimming to `maxDecimals` without rounding up.
export function formatAmount(value: bigint, decimals: number, maxDecimals = 4): string {
  const [whole, fraction = ''] = formatUnits(value, decimals).split('.');
  const trimmed = fraction.slice(0, maxDecimals).replace(/0+$/, '');
  const wholeWithCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return trimmed ? `${wholeWithCommas}.${trimmed}` : wholeWithCommas;
}
