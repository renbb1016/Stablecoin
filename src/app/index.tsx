import { Ionicons } from '@expo/vector-icons';
import { useAppKit } from '@reown/appkit-react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from 'wagmi';

import { Banner, BannerText } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LinkText } from '@/components/LinkText';
import { NetworkGuard, useIsWrongNetwork } from '@/components/NetworkGuard';
import { SmileyDollar } from '@/components/SmileyDollar';
import { ACTIVE_NETWORK, addressUrl } from '@/config/networks';
import { useBalances } from '@/hooks/useBalances';
import { formatAmount, shortenAddress } from '@/lib/format';
import { fonts, radius, spacing, type as typeScale, useTheme, useThemedStyles, type Theme } from '@/theme';

const { chain, stablecoin, faucetUrl } = ACTIVE_NETWORK;

export default function HomeScreen() {
  const { isConnected, address } = useAccount();
  return isConnected && address ? <WalletHome address={address} /> : <ConnectScreen />;
}

function ConnectScreen() {
  const { open } = useAppKit();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.connect, { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl }]}>
      <StatusBar style="dark" />
      <View style={styles.connectHero}>
        <SmileyDollar size={170} />
        <Text style={styles.connectTitle}>Send dollars{'\n'}in seconds.</Text>
        <Text style={styles.connectSubtitle}>
          {stablecoin.symbol} on {chain.name}. No bank needed.
        </Text>
      </View>
      <Button title="Connect wallet" icon="wallet" variant="inverse" onPress={() => open()} />
    </View>
  );
}

function WalletHome({ address }: { address: `0x${string}` }) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { disconnect } = useAppKit();
  const isWrongNetwork = useIsWrongNetwork();
  const { tokenBalance, gasBalance, isLoading, error } = useBalances(address);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await Clipboard.setStringAsync(address);
    Haptics.selectionAsync().catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openMenu = () =>
    Alert.alert(shortenAddress(address), undefined, [
      { text: 'View on explorer', onPress: () => Linking.openURL(addressUrl(address)) },
      { text: 'Disconnect', style: 'destructive', onPress: () => disconnect() },
      { text: 'Cancel', style: 'cancel' },
    ]);

  const hasNoTokens = tokenBalance === 0n;
  const hasNoGas = gasBalance === 0n;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.homeContent} bounces={false}>
      <StatusBar style="dark" />

      {/* Color-block header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={copyAddress} style={styles.chip} accessibilityRole="button" accessibilityLabel="Copy address">
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={t.onBrand} />
            <Text style={styles.chipText}>{copied ? 'Copied!' : shortenAddress(address)}</Text>
          </Pressable>
          <View style={styles.headerTopRight}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: isWrongNetwork ? t.danger : t.onBrand }]} />
              <Text style={styles.chipText}>{isWrongNetwork ? 'Wrong network' : chain.name}</Text>
            </View>
            <Pressable onPress={openMenu} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Wallet menu">
              <Ionicons name="ellipsis-horizontal" size={18} color={t.onBrand} />
            </Pressable>
          </View>
        </View>

        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Your {stablecoin.symbol}</Text>
          {isLoading ? (
            <ActivityIndicator color={t.onBrand} style={styles.balanceLoader} />
          ) : (
            <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
              ${tokenBalance !== undefined ? formatAmount(tokenBalance, stablecoin.decimals, 2) : '—'}
            </Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <Button
            title="Send"
            icon="arrow-up"
            variant="inverse"
            onPress={() => router.push('/send')}
            disabled={isWrongNetwork}
            style={styles.flex}
          />
          <Button
            title={copied ? 'Copied!' : 'Copy address'}
            icon={copied ? 'checkmark' : 'copy-outline'}
            variant="tinted"
            onPress={copyAddress}
            style={styles.flex}
          />
        </View>
      </View>

      <View style={styles.body}>
        <NetworkGuard />
        {error ? <Banner tone="danger" title="Couldn't load balances" /> : null}

        <Text style={styles.sectionTitle}>Assets</Text>
        <Card style={styles.assets}>
          <AssetRow
            badge="$"
            badgeColor={t.primary}
            badgeText={t.onPrimary}
            name={stablecoin.name}
            symbol={stablecoin.symbol}
            amount={tokenBalance !== undefined ? formatAmount(tokenBalance, stablecoin.decimals, 2) : '—'}
          />
          <View style={styles.divider} />
          <AssetRow
            badge="Ξ"
            badgeColor={t.surfaceAlt}
            badgeText={t.text}
            name="Ether (for gas)"
            symbol={chain.nativeCurrency.symbol}
            amount={gasBalance !== undefined ? formatAmount(gasBalance, chain.nativeCurrency.decimals, 5) : '—'}
          />
        </Card>

        {(hasNoTokens || hasNoGas) && !isWrongNetwork ? (
          <Banner tone="info" title="Top up with testnet funds">
            <BannerText>
              {hasNoTokens ? `Grab free test ${stablecoin.symbol} from Circle's faucet. ` : ''}
              {hasNoGas ? `You also need a little ${chain.nativeCurrency.symbol} on ${chain.name} to pay gas.` : ''}
            </BannerText>
            {hasNoTokens ? <LinkText url={faucetUrl}>Open Circle faucet</LinkText> : null}
          </Banner>
        ) : null}
      </View>
    </ScrollView>
  );
}

type AssetRowProps = {
  badge: string;
  badgeColor: string;
  badgeText: string;
  name: string;
  symbol: string;
  amount: string;
};

function AssetRow({ badge, badgeColor, badgeText, name, symbol, amount }: AssetRowProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.assetRow}>
      <View style={[styles.badge, { backgroundColor: badgeColor }]}>
        <Text style={[styles.badgeText, { color: badgeText }]}>{badge}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.assetName}>{name}</Text>
        <Text style={styles.assetSymbol}>{symbol}</Text>
      </View>
      <Text style={styles.assetAmount}>{amount}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },

    // Connect
    connect: { flex: 1, backgroundColor: t.brand, paddingHorizontal: spacing.xl, justifyContent: 'space-between' },
    connectHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
    connectTitle: {
      fontFamily: fonts.extrabold,
      fontSize: 40,
      lineHeight: 46,
      color: t.onBrand,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    connectSubtitle: { fontFamily: fonts.semibold, fontSize: 16, color: t.onBrand, opacity: 0.75, textAlign: 'center' },

    // Header
    homeContent: { paddingBottom: spacing.xxl },
    header: {
      backgroundColor: t.brand,
      borderBottomLeftRadius: 36,
      borderBottomRightRadius: 36,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.xl,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTopRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(17, 19, 21, 0.12)',
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
    },
    chipText: { fontFamily: fonts.bold, fontSize: 13, color: t.onBrand },
    dot: { width: 8, height: 8, borderRadius: 4 },
    iconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(17, 19, 21, 0.12)',
    },
    balanceBlock: { alignItems: 'center', paddingVertical: spacing.md },
    balanceLabel: { fontFamily: fonts.bold, fontSize: 15, color: t.onBrand, opacity: 0.7 },
    balance: {
      fontFamily: fonts.extrabold,
      fontSize: 56,
      lineHeight: 66,
      color: t.onBrand,
      fontVariant: ['tabular-nums'],
    },
    balanceLoader: { marginVertical: spacing.xl },
    headerActions: { flexDirection: 'row', gap: spacing.md },

    // Body
    body: { padding: spacing.lg, gap: spacing.lg },
    sectionTitle: { fontFamily: fonts.extrabold, fontSize: typeScale.title - 4, color: t.text, marginTop: spacing.xs },
    assets: { gap: spacing.md },
    assetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    badge: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontFamily: fonts.extrabold, fontSize: 20 },
    assetName: { fontFamily: fonts.bold, fontSize: 16, color: t.text },
    assetSymbol: { fontFamily: fonts.medium, fontSize: 13, color: t.textMuted },
    assetAmount: { fontFamily: fonts.extrabold, fontSize: 17, color: t.text, fontVariant: ['tabular-nums'] },
    divider: { height: 1, backgroundColor: t.border },
  });
