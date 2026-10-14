import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatUnits, type Address } from 'viem';
import { useAccount } from 'wagmi';

import { AmountDisplay } from '@/components/AmountDisplay';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Keypad } from '@/components/Keypad';
import { LinkText } from '@/components/LinkText';
import { NetworkGuard, useIsWrongNetwork } from '@/components/NetworkGuard';
import { PulseRing } from '@/components/PulseRing';
import { SmileyDollar } from '@/components/SmileyDollar';
import { SuccessCheck } from '@/components/SuccessCheck';
import { ACTIVE_NETWORK, txUrl } from '@/config/networks';
import { useBalances } from '@/hooks/useBalances';
import { useSendToken } from '@/hooks/useSendToken';
import { formatAmount, shortenAddress } from '@/lib/format';
import { applyKey, type KeypadKey } from '@/lib/keypad';
import { validateAmount, validateRecipient } from '@/lib/validation';
import { fonts, radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

const { chain, stablecoin } = ACTIVE_NETWORK;

type Step = 'amount' | 'recipient' | 'review';
const STEP_TITLES: Record<Step, string> = { amount: 'Send', recipient: 'Who to?', review: 'Review' };

export default function SendScreen() {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { address, isConnected } = useAccount();
  const isWrongNetwork = useIsWrongNetwork();
  const { tokenBalance, gasBalance, refetch } = useBalances(address);
  const { send, status, hash, error, reset } = useSendToken();

  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  // Snapshot of what was submitted, so the result screen survives the post-send balance refresh.
  const [sent, setSent] = useState<{ to: Address; value: bigint } | null>(null);

  const checkAmount = useCallback(
    (value: string) => validateAmount({ amount: value, decimals: stablecoin.decimals, balance: tokenBalance, gasBalance }),
    [tokenBalance, gasBalance],
  );
  const amountCheck = useMemo(() => checkAmount(amount), [checkAmount, amount]);
  const recipientCheck = useMemo(() => validateRecipient(recipient), [recipient]);

  const inFlight = status !== 'idle' && sent !== null;

  useEffect(() => {
    if (status === 'confirmed') refetch();
  }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back steps through the flow before leaving the screen.
  const goBack = useCallback(() => {
    if (!inFlight && step === 'review') return setStep('recipient');
    if (!inFlight && step === 'recipient') return setStep('amount');
    router.back();
  }, [inFlight, step]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (inFlight || step === 'amount') return false;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [goBack, inFlight, step]);

  const header = (
    <Stack.Screen
      options={{
        title: inFlight ? '' : STEP_TITLES[step],
        headerLeft: () => (
          <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={t.text} />
          </Pressable>
        ),
      }}
    />
  );

  if (!isConnected || !address) {
    return (
      <View style={styles.centered}>
        {header}
        <SmileyDollar size={90} />
        <Text style={styles.statusBody}>Connect your wallet first.</Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const amountLabel = (value: bigint) => formatAmount(value, stablecoin.decimals, 6);
  const isSelf = recipientCheck.ok && recipientCheck.to.toLowerCase() === address.toLowerCase();

  const onKey = (key: KeypadKey) => {
    const next = applyKey(amount, key, stablecoin.decimals);
    if (next === amount) {
      if (key !== 'back') setShakeKey((k) => k + 1); // rejected key (too many decimals / digits)
      return;
    }
    const before = checkAmount(amount);
    const after = checkAmount(next);
    if (!after.ok && after.error && (before.ok || !before.error)) {
      setShakeKey((k) => k + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }
    setAmount(next);
  };

  const fillMax = () => {
    if (tokenBalance === undefined) return;
    Haptics.selectionAsync().catch(() => {});
    setAmount(formatUnits(tokenBalance, stablecoin.decimals));
  };

  const pasteRecipient = async () => setRecipient((await Clipboard.getStringAsync()).trim());

  const submit = (to: Address, value: bigint) => {
    setSent({ to, value });
    send(to, value);
  };

  const startOver = () => {
    reset();
    setSent(null);
    setStep('amount');
    setRecipient('');
    setAmount('');
  };

  // --- Status: waiting on wallet / chain, success, failure ---
  if (inFlight && sent) {
    return (
      <ScrollView contentContainerStyle={[styles.statusScreen, { paddingBottom: insets.bottom + spacing.xl }]}>
        {header}
        <View style={styles.statusHero}>
          {status === 'awaiting-wallet' ? (
            <>
              <PulseRing icon="wallet-outline" size={150} />
              <Text style={styles.statusTitle}>Check your wallet</Text>
              <Text style={styles.statusBody}>Approve the payment in your wallet app, then come back here.</Text>
            </>
          ) : null}
          {status === 'pending' ? (
            <>
              <PulseRing icon="paper-plane" size={150} />
              <Text style={styles.statusTitle}>Sending…</Text>
              <Text style={styles.statusBody}>Waiting for {chain.name} to confirm it. Usually a few seconds.</Text>
            </>
          ) : null}
          {status === 'confirmed' ? (
            <>
              <SuccessCheck size={150} />
              <Text style={styles.statusTitle}>Sent!</Text>
              <Text style={styles.statusBody}>
                <Text style={styles.statusStrong}>${amountLabel(sent.value)} {stablecoin.symbol}</Text> is on its way to{' '}
                <Text style={styles.statusStrong}>{shortenAddress(sent.to)}</Text>.
              </Text>
              <View style={styles.winkRow}>
                <SmileyDollar size={34} mood="wink" />
                <Text style={styles.winkText}>Nice one!</Text>
              </View>
            </>
          ) : null}
          {status === 'failed' ? (
            <>
              <View style={styles.failIcon}>
                <Ionicons name="close" size={64} color={t.background} />
              </View>
              <Text style={styles.statusTitle}>Payment didn’t go through</Text>
              <Text style={styles.statusBody}>{error}</Text>
            </>
          ) : null}
          {hash ? <LinkText url={txUrl(hash)}>View on explorer</LinkText> : null}
        </View>

        {status === 'confirmed' ? (
          <View style={styles.actions}>
            <Button title="Done" onPress={() => router.back()} />
            <Button title="Send another" variant="secondary" onPress={startOver} />
          </View>
        ) : null}
        {status === 'failed' ? (
          <View style={styles.actions}>
            <Button title="Try again" icon="refresh" onPress={() => submit(sent.to, sent.value)} />
            <Button
              title="Edit payment"
              variant="secondary"
              onPress={() => {
                reset();
                setSent(null);
                setStep('review');
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    );
  }

  // --- Step 3: review ---
  if (step === 'review' && amountCheck.ok && recipientCheck.ok) {
    const { value } = amountCheck;
    const { to } = recipientCheck;
    return (
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        {header}
        <NetworkGuard />
        <Card style={styles.reviewCard}>
          <SmileyDollar size={64} />
          <Text style={styles.muted}>You’re sending</Text>
          <Text style={styles.reviewAmount}>${amountLabel(value)}</Text>
          <Text style={styles.reviewSymbol}>{stablecoin.symbol}</Text>
          <View style={styles.divider} />
          <ReviewRow label="To" value={shortenAddress(to)} detail={to} />
          <ReviewRow label="Network" value={chain.name} />
          <ReviewRow label="Network fee" value={`Paid in ${chain.nativeCurrency.symbol}`} detail="Shown in your wallet" />
        </Card>
        {isSelf ? <Banner tone="warning" title="That’s your own address" /> : null}
        <View style={styles.actions}>
          <Button title="Confirm & send" icon="paper-plane" onPress={() => submit(to, value)} disabled={isWrongNetwork} />
          <Button title="Edit" variant="ghost" onPress={() => setStep('amount')} />
        </View>
      </ScrollView>
    );
  }

  // --- Step 2: recipient ---
  if (step === 'recipient' && amountCheck.ok) {
    return (
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {header}
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sendingPill}>
            <SmileyDollar size={28} animateIn={false} />
            <Text style={styles.sendingPillText}>
              Sending ${amountLabel(amountCheck.value)} {stablecoin.symbol}
            </Text>
          </View>
          <Field
            label="Recipient address"
            placeholder="0x…"
            value={recipient}
            onChangeText={setRecipient}
            autoFocus
            error={recipientCheck.ok ? null : recipientCheck.error}
            hint={recipientCheck.ok ? `Looks good · ${shortenAddress(recipientCheck.to)}` : 'Paste the wallet address you’re paying.'}
            accessory={
              <Button title="Paste" icon="clipboard-outline" variant="secondary" compact onPress={pasteRecipient} />
            }
          />
          {isSelf ? <Banner tone="warning" title="That’s your own address" /> : null}
          <Button title="Review" onPress={() => setStep('review')} disabled={!recipientCheck.ok} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // --- Step 1: amount (keypad) ---
  const amountError = !amountCheck.ok ? amountCheck.error : null;
  return (
    <View style={[styles.amountScreen, { paddingBottom: insets.bottom + spacing.md }]}>
      {header}
      <NetworkGuard />
      <View style={styles.amountTop}>
        {amount === '' ? (
          <View style={styles.mascotBlock}>
            <SmileyDollar size={110} />
            <Text style={styles.prompt}>How much are we sending?</Text>
          </View>
        ) : null}
        <AmountDisplay amount={amount} symbol={stablecoin.symbol} invalid={!!amountError} shakeKey={shakeKey} />
        <View style={styles.availableRow}>
          <Text style={styles.muted}>
            Available{' '}
            {tokenBalance !== undefined ? `${formatAmount(tokenBalance, stablecoin.decimals, 2)} ${stablecoin.symbol}` : '—'}
          </Text>
          <Pressable onPress={fillMax} style={styles.maxChip} accessibilityRole="button" accessibilityLabel="Use max balance">
            <Text style={styles.maxText}>Max</Text>
          </Pressable>
        </View>
        <Text style={styles.amountError}>{amountError ?? ' '}</Text>
      </View>
      <Keypad onKey={onKey} onClear={() => setAmount('')} />
      <Button
        title="Next"
        icon="arrow-forward"
        onPress={() => setStep('recipient')}
        disabled={!amountCheck.ok || isWrongNetwork}
        style={styles.nextButton}
      />
    </View>
  );
}

function ReviewRow({ label, value, detail }: { label: string; value: string; detail?: string }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.muted}>{label}</Text>
      <View style={styles.reviewValueCol}>
        <Text style={styles.reviewValue}>{value}</Text>
        {detail ? (
          <Text style={styles.reviewDetail} selectable numberOfLines={1} ellipsizeMode="middle">
            {detail}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
    content: { padding: spacing.lg, gap: spacing.lg },
    actions: { gap: spacing.sm },
    muted: { fontFamily: fonts.semibold, fontSize: 14, color: t.textMuted },
    divider: { height: 1, alignSelf: 'stretch', backgroundColor: t.border },

    // Amount step
    amountScreen: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md },
    amountTop: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    mascotBlock: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
    prompt: { fontFamily: fonts.bold, fontSize: 18, color: t.text },
    availableRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    maxChip: {
      backgroundColor: t.accentSoft,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.md,
      paddingVertical: 5,
    },
    maxText: { fontFamily: fonts.extrabold, fontSize: 13, color: t.accent },
    amountError: { fontFamily: fonts.semibold, fontSize: 14, color: t.danger, minHeight: 20 },
    nextButton: { marginTop: spacing.xs },

    // Recipient step
    sendingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      gap: spacing.sm,
      backgroundColor: t.surface,
      borderRadius: radius.pill,
      paddingLeft: 6,
      paddingRight: spacing.lg,
      paddingVertical: 6,
    },
    sendingPillText: { fontFamily: fonts.bold, fontSize: 15, color: t.text },

    // Review step
    reviewCard: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
    reviewAmount: { fontFamily: fonts.extrabold, fontSize: 44, color: t.text, fontVariant: ['tabular-nums'] },
    reviewSymbol: { fontFamily: fonts.semibold, fontSize: 15, color: t.textMuted, marginTop: -6, marginBottom: spacing.sm },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', gap: spacing.lg, paddingTop: spacing.sm },
    reviewValueCol: { flexShrink: 1, alignItems: 'flex-end' },
    reviewValue: { fontFamily: fonts.bold, fontSize: 15, color: t.text },
    reviewDetail: { fontFamily: fonts.medium, fontSize: 12, color: t.textMuted, maxWidth: 200 },

    // Status
    statusScreen: { flexGrow: 1, padding: spacing.lg, justifyContent: 'space-between', gap: spacing.xl },
    statusHero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingTop: spacing.xxl },
    statusTitle: { fontFamily: fonts.extrabold, fontSize: 30, color: t.text, textAlign: 'center', marginTop: spacing.md },
    statusBody: {
      fontFamily: fonts.medium,
      fontSize: 16,
      lineHeight: 23,
      color: t.textMuted,
      textAlign: 'center',
      maxWidth: 320,
    },
    statusStrong: { fontFamily: fonts.bold, color: t.text },
    winkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: t.surface,
      borderRadius: radius.pill,
      paddingLeft: 6,
      paddingRight: spacing.lg,
      paddingVertical: 6,
      marginTop: spacing.xs,
    },
    winkText: { fontFamily: fonts.bold, fontSize: 15, color: t.text },
    failIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: t.danger,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
