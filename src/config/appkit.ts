import { createAppKit, type AppKitNetwork } from '@reown/appkit-react-native';
import { WagmiAdapter } from '@reown/appkit-wagmi-react-native';
import * as Clipboard from 'expo-clipboard';

import { ACTIVE_NETWORK } from '@/config/networks';
import { storage } from '@/lib/storage';

// Reown's public demo ID only works inside Expo Go. Set your own in .env for real builds.
const DEMO_PROJECT_ID = 'b8e39dfb697ba26ac5a77a4b29b35604';
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID || DEMO_PROJECT_ID;

// AppKit's network type is a structural superset of viem's Chain.
export const appNetwork = ACTIVE_NETWORK.chain as AppKitNetwork;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [ACTIVE_NETWORK.chain],
});

export const appKit = createAppKit({
  projectId,
  networks: [appNetwork],
  defaultNetwork: appNetwork,
  adapters: [wagmiAdapter],
  themeVariables: { accent: '#F97316' }, // burnt orange, matches src/theme.ts
  storage,
  clipboardClient: {
    setString: async (value: string) => {
      await Clipboard.setStringAsync(value);
    },
  },
  metadata: {
    name: 'Stablecoin Send',
    description: 'Send USDC on Base Sepolia',
    url: 'https://reown.com/appkit',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
    redirect: { native: 'stablecoinsend://' },
  },
});
