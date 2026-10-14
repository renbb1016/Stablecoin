import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CHECK_LENGTH = 70;

// Circle pops in, then the checkmark draws itself, then a success haptic.
export function SuccessCheck({ size = 120 }: { size?: number }) {
  const t = useTheme();
  const [scale] = useState(() => new Animated.Value(0));
  const [draw] = useState(() => new Animated.Value(CHECK_LENGTH));

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 140, useNativeDriver: true }),
      Animated.timing(draw, { toValue: 0, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    });
  }, [scale, draw]);

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ scale }] }} accessibilityLabel="Payment sent">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={60} r={58} fill={t.mascotRim} opacity={0.35} />
        <Circle cx={60} cy={60} r={46} fill={t.primary} />
        <AnimatedPath
          d="M39 61 L54 76 L83 46"
          stroke={t.onPrimary}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={CHECK_LENGTH}
          strokeDashoffset={draw}
        />
      </Svg>
    </Animated.View>
  );
}
