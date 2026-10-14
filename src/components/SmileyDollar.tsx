import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { fonts, useTheme } from '@/theme';

type Props = {
  size?: number;
  mood?: 'happy' | 'wink';
  // Bounce + wiggle when the mascot first appears.
  animateIn?: boolean;
};

// The app mascot: a coin with a smiling dollar-sign face.
export function SmileyDollar({ size = 120, mood = 'happy', animateIn = true }: Props) {
  const t = useTheme();
  const [scale] = useState(() => new Animated.Value(animateIn ? 0 : 1));
  const [tilt] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!animateIn) return;
    const wiggle = (to: number) =>
      Animated.timing(tilt, { toValue: to, duration: 110, easing: Easing.inOut(Easing.quad), useNativeDriver: true });
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
      wiggle(1),
      wiggle(-1),
      wiggle(0.5),
      wiggle(0),
    ]).start();
  }, [animateIn, scale, tilt]);

  const rotate = tilt.interpolate({ inputRange: [-1, 1], outputRange: ['-10deg', '10deg'] });

  return (
    <Animated.View
      style={{ width: size, height: size, transform: [{ scale }, { rotate }] }}
      accessibilityRole="image"
      accessibilityLabel="Smiling dollar coin"
    >
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Circle cx={60} cy={60} r={58} fill={t.mascotRim} />
        <Circle cx={60} cy={60} r={50} fill={t.mascotCoin} />
        {/* cheeks */}
        <Circle cx={30} cy={66} r={6} fill={t.mascotRim} opacity={0.8} />
        <Circle cx={90} cy={66} r={6} fill={t.mascotRim} opacity={0.8} />
        {/* eyes */}
        <Circle cx={42} cy={38} r={5.5} fill={t.mascotFace} />
        {mood === 'wink' ? (
          <Path d="M72 39 Q78 32 84 39" stroke={t.mascotFace} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        ) : (
          <Circle cx={78} cy={38} r={5.5} fill={t.mascotFace} />
        )}
        <SvgText
          x={60}
          y={79}
          fontSize={42}
          fontFamily={fonts.extrabold}
          fontWeight="800"
          fill={t.mascotFace}
          textAnchor="middle"
        >
          $
        </SvgText>
        {/* smile */}
        <Path d="M44 88 Q60 101 76 88" stroke={t.mascotFace} strokeWidth={5} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}
