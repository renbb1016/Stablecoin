# Stablecoin Send

Mobile app (Expo + React Native + TypeScript) for sending USDC on **Base Sepolia** from a connected wallet (MetaMask, Coinbase Wallet, or any WalletConnect wallet).

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android: Expo Go app, iPhone: Camera app).

Optional: copy `.env.example` to `.env` and set `EXPO_PUBLIC_REOWN_PROJECT_ID` (free at https://dashboard.reown.com). Without it the app uses Reown's public demo ID, which only works in Expo Go.

## Testnet setup (one time)

1. Install MetaMask on the phone.
2. Get Base Sepolia ETH for gas, e.g. from https://www.alchemy.com/faucets/base-sepolia or the Coinbase Developer Platform faucet.
3. Get test USDC from https://faucet.circle.com (pick **Base Sepolia**).

## Demo flow

Connect wallet → see USDC and ETH balances → **Send USDC** → enter the recipient and amount → **Review** → **Confirm & send** → approve in MetaMask → return to the app → it shows pending, then confirmed, with a BaseScan link.

## Project layout

| Path | What |
|---|---|
| `src/app/` | Screens (Expo Router): `index.tsx` wallet home, `send.tsx` send flow |
| `src/config/networks.ts` | Chain + stablecoin config. To support another chain (e.g. Arc testnet), add a config and change `ACTIVE_NETWORK` |
| `src/config/appkit.ts` | Reown AppKit + Wagmi setup |
| `src/hooks/` | `useBalances` (USDC + gas balance), `useSendToken` (ERC-20 transfer + receipt tracking) |
| `src/lib/validation.ts` | Send-form validation |
| `src/theme.ts`, `src/components/` | Placeholder design tokens and UI building blocks |

## Checks

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
