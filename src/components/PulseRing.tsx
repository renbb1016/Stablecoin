import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; size?: number };

// Looping "ripple" around an icon, used while waiting on the wallet or the chain.
export function PulseRing({ icon, size = 120 }: Props) {
  const t = useTheme();
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const core = size * 0.55;
  const ring = {
    width: core,
    height: core,
    borderRadius: core / 2,
    backgroundColor: t.primary,
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={[styles.abs, ring]} />
      <View style={[styles.core, { width: core, height: core, borderRadius: core / 2, backgroundColor: t.primary }]}>
        <Ionicons name={icon} size={core * 0.45} color={t.onPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  abs: { position: 'absolute' },
  core: { alignItems: 'center', justifyContent: 'center' },
});
