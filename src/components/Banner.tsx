import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, radius, spacing, useTheme, type Theme } from '@/theme';

type Tone = 'info' | 'warning' | 'danger';

const toneStyle = (t: Theme, tone: Tone) =>
  ({
    info: { fg: t.accent, bg: t.accentSoft, icon: 'sparkles' as const },
    warning: { fg: t.warning, bg: t.warningSoft, icon: 'swap-horizontal' as const },
    danger: { fg: t.danger, bg: t.dangerSoft, icon: 'alert-circle' as const },
  })[tone];

type Props = { tone: Tone; title: string; children?: ReactNode };

export function Banner({ tone, title, children }: Props) {
  const t = useTheme();
  const { fg, bg, icon } = toneStyle(t, tone);
  return (
    <View style={[styles.banner, { backgroundColor: bg }]} accessibilityRole="alert">
      <View style={styles.titleRow}>
        <Ionicons name={icon} size={18} color={fg} />
        <Text style={[styles.title, { color: fg }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Body text inside a banner, colored for the current theme.
export function BannerText({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: t.text }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  banner: { borderRadius: radius.md, padding: spacing.lg, gap: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: fonts.bold, fontSize: 15 },
  body: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20 },
});
