# Stablecoin

This is the first prototype for the frontend

## What you need

- [Node.js](https://nodejs.org) 20 or newer
- A free [Expo account](https://expo.dev/signup)
- A phone with these apps installed:
  - **Expo Go** (App Store / Google Play): runs the app while developing
  - **MetaMask** (or another WalletConnect wallet): signs the payments

## 1. Install

```bash
git clone https://github.com/renbb1016/Stablecoin.git
cd Stablecoin
npm install
```

Optional: copy `.env.example` to `.env` and set your own `EXPO_PUBLIC_REOWN_PROJECT_ID` (free at https://dashboard.reown.com). Without it, the app uses Reown's public demo ID, which works in Expo Go.

## 2. Sign in to Expo

Use the same account on your computer and in Expo Go on your phone.

```bash
npx expo login
```

## 3. Start the dev server

```bash
cd C:\Users\Renbb\OneDrive\Blockchain_Stablecoin\stablecoin-send
npx expo start --tunnel
```

`--tunnel` lets your phone connect even if it isn't on the same Wi-Fi as your computer. The first run may ask to install `@expo/ngrok`. Say yes.

When it's ready, the terminal shows a QR code.

## 4. Open the app on your phone

- **iPhone:** scan the QR code with the Camera app.
- **Android:** open Expo Go and tap **Scan QR code**.

You can also open the project from **Development servers** in Expo Go.

The first load takes about a minute. After you edit code, the app reloads automatically. To force a reload, shake the phone and tap **Reload**, or press `r` in the terminal.

## 5. Get testnet funds (one time)

1. In MetaMask, add the **Base Sepolia** network.
2. Get Base Sepolia ETH for gas, for example from https://www.alchemy.com/faucets/base-sepolia.
3. Get test USDC from https://faucet.circle.com (choose **Base Sepolia**).

## 6. Test a payment

1. Tap **Connect wallet** and approve the connection in MetaMask.
2. Check that your USDC and ETH balances show on the home screen.
3. Tap **Send** and enter an amount on the keypad. Entering more than your balance makes the amount shake.
4. Tap **Next**, paste the recipient's `0x…` address, then tap **Review**.
5. Tap **Confirm & send** and approve the transaction in MetaMask.
6. Switch back to the app. It shows the pending state, then **Sent!**, with a link to the transaction on BaseScan.

## Code checks

```bash
npx tsc --noEmit    # type check
npx expo lint       # lint
npx expo-doctor     # check dependencies and config
```

