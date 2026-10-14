import { StyleSheet, View, type ViewProps } from 'react-native';

import { radius, spacing, useThemedStyles, type Theme } from '@/theme';

export function Card({ style, ...props }: ViewProps) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, style]} {...props} />;
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
    },
  });
