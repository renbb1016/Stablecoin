export type KeypadKey = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | '0' | 'back';

const MAX_DIGITS = 12;

// Applies one keypad press to the amount string, keeping it a well-formed decimal.
export function applyKey(current: string, key: KeypadKey, decimals: number): string {
  if (key === 'back') return current.slice(0, -1);

  if (key === '.') {
    if (decimals === 0 || current.includes('.')) return current;
    return current === '' ? '0.' : `${current}.`;
  }

  if (current === '0') return key; // replace a lone leading zero
  const fraction = current.split('.')[1];
  if (fraction !== undefined && fraction.length >= decimals) return current;
  if (current.replace('.', '').length >= MAX_DIGITS) return current;
  return current + key;
}
