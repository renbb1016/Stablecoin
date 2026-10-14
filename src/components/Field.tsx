import type { ReactNode } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

type Props = TextInputProps & {
  label: string;
  // Rendered inside the input row on the right (e.g. "Paste").
  accessory?: ReactNode;
  hint?: string;
  error?: string | null;
};

export function Field({ label, accessory, hint, error, style, ...inputProps }: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, error ? styles.rowError : null]}>
        <TextInput
          placeholderTextColor={t.textMuted}
          selectionColor={t.primary}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
          style={[styles.input, style]}
          {...inputProps}
        />
        {accessory}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrapper: { gap: spacing.sm },
    label: { fontFamily: fonts.bold, fontSize: 14, color: t.textMuted },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: radius.md,
      paddingRight: spacing.sm,
    },
    rowError: { borderColor: t.danger },
    input: {
      flex: 1,
      minHeight: 60,
      paddingHorizontal: spacing.lg,
      fontFamily: fonts.semibold,
      fontSize: 16,
      color: t.text,
    },
    hint: { fontFamily: fonts.medium, fontSize: 13, color: t.textMuted },
    error: { fontFamily: fonts.semibold, fontSize: 13, color: t.danger },
  });
