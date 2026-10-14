import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { fonts, palette, radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

// inverse: charcoal pill for use on the orange header; tinted: translucent pill on the header.
type Variant = 'primary' | 'secondary' | 'inverse' | 'tinted' | 'ghost';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, compact, style }: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isDisabled = disabled || loading;
  const textColor = {
    primary: t.onPrimary,
    secondary: t.text,
    inverse: palette.offWhite,
    tinted: t.onBrand,
    ghost: t.accent,
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        styles[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Ionicons name={icon} size={compact ? 18 : 20} color={textColor} /> : null}
          <Text style={[styles.text, compact && styles.compactText, { color: textColor }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 56,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    compact: { minHeight: 44, paddingHorizontal: spacing.lg },
    content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    primary: { backgroundColor: t.primary },
    secondary: { backgroundColor: t.surfaceAlt },
    inverse: { backgroundColor: palette.charcoal },
    tinted: { backgroundColor: 'rgba(17, 19, 21, 0.12)' },
    ghost: { backgroundColor: 'transparent' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    disabled: { opacity: 0.4 },
    text: { fontFamily: fonts.bold, fontSize: 17 },
    compactText: { fontSize: 15 },
  });
