import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { fonts, type as typeScale, useThemedStyles, type Theme } from '@/theme';

type Props = {
  amount: string;
  symbol: string;
  invalid?: boolean;
  // Bump this number to trigger a shake (e.g. when an over-balance amount is typed).
  shakeKey?: number;
};

// Giant centered amount for the keypad screen; shrinks as the number gets longer.
export function AmountDisplay({ amount, symbol, invalid, shakeKey = 0 }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [shake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!shakeKey) return;
    shake.setValue(0);
    Animated.sequence(
      [10, -10, 7, -7, 3, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 45, useNativeDriver: true }),
      ),
    ).start();
  }, [shakeKey, shake]);

  const shown = amount || '0';
  const size = shown.length <= 6 ? typeScale.display : shown.length <= 9 ? 50 : 38;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ translateX: shake }] }]}>
      <Text
        style={[styles.amount, { fontSize: size, lineHeight: size * 1.15 }, !amount && styles.placeholder, invalid && styles.invalid]}
        numberOfLines={1}
        accessibilityLabel={`${shown} ${symbol}`}
      >
        <Text style={styles.dollar}>$</Text>
        {shown}
      </Text>
      <Text style={styles.symbol}>{symbol}</Text>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: { alignItems: 'center' },
    amount: { fontFamily: fonts.extrabold, color: t.text, fontVariant: ['tabular-nums'] },
    dollar: { color: t.primary },
    placeholder: { color: t.textMuted },
    invalid: { color: t.danger },
    symbol: { fontFamily: fonts.semibold, fontSize: 15, color: t.textMuted, marginTop: 2 },
  });
