import { useAppKit } from '@reown/appkit-react-native';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import { Banner, BannerText } from '@/components/Banner';
import { Button } from '@/components/Button';
import { appNetwork } from '@/config/appkit';
import { ACTIVE_NETWORK } from '@/config/networks';
import { friendlyError } from '@/hooks/useSendToken';

export function useIsWrongNetwork() {
  const { isConnected, chainId } = useAccount();
  return isConnected && chainId !== ACTIVE_NETWORK.chain.id;
}

// Shown when the connected wallet is on a different chain than the app supports.
export function NetworkGuard() {
  const { switchNetwork } = useAppKit();
  const isWrongNetwork = useIsWrongNetwork();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isWrongNetwork) return null;

  const onSwitch = async () => {
    setSwitching(true);
    setError(null);
    try {
      await switchNetwork(appNetwork);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Banner tone="warning" title={`Switch to ${ACTIVE_NETWORK.chain.name}`}>
      <BannerText>Your wallet is on a different network. Approve the switch in your wallet app.</BannerText>
      {error ? <BannerText>{error}</BannerText> : null}
      <Button title="Switch network" icon="swap-horizontal" compact onPress={onSwitch} loading={switching} />
    </Banner>
  );
}
