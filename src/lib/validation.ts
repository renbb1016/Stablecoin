import { getAddress, isAddress, parseUnits, type Address } from 'viem';

type SendInput = {
  recipient: string;
  amount: string;
  decimals: number;
  balance: bigint | undefined;
  gasBalance: bigint | undefined;
};

export type SendValidation =
  | { ok: true; to: Address; value: bigint }
  // `error` is null when the form is just incomplete (nothing worth showing yet).
  | { ok: false; error: string | null };

export type AmountValidation = { ok: true; value: bigint } | { ok: false; error: string | null };

export function validateAmount({
  amount,
  decimals,
  balance,
  gasBalance,
}: Omit<SendInput, 'recipient'>): AmountValidation {
  const amt = amount.trim();
  if (!amt) return { ok: false, error: null };
  if (!/^\d*\.?\d*$/.test(amt) || amt === '.') return { ok: false, error: 'Enter a valid amount.' };

  const fraction = amt.split('.')[1] ?? '';
  if (fraction.length > decimals) return { ok: false, error: `Max ${decimals} decimal places.` };

  const value = parseUnits(amt, decimals);
  if (value <= 0n) return { ok: false, error: 'Amount must be greater than 0.' };
  if (balance !== undefined && value > balance) return { ok: false, error: 'Insufficient balance.' };
  if (gasBalance !== undefined && gasBalance === 0n) {
    return { ok: false, error: 'You need some testnet ETH to pay for gas.' };
  }

  return { ok: true, value };
}

export function validateRecipient(recipient: string): { ok: true; to: Address } | { ok: false; error: string | null } {
  const to = recipient.trim();
  if (!to) return { ok: false, error: null };
  if (!isAddress(to, { strict: false })) return { ok: false, error: 'Enter a valid 0x address.' };
  return { ok: true, to: getAddress(to) };
}

export function validateSend({ recipient, ...amountInput }: SendInput): SendValidation {
  const to = validateRecipient(recipient);
  const amount = validateAmount(amountInput);
  if (!recipient.trim() || !amountInput.amount.trim()) return { ok: false, error: null };
  if (!to.ok) return to;
  if (!amount.ok) return amount;
  return { ok: true, to: to.to, value: amount.value };
}

// Users on some locales type "," as the decimal separator.
export const normalizeAmountInput = (text: string) => text.replace(',', '.').replace(/[^\d.]/g, '');
