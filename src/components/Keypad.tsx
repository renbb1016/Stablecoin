import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { KeypadKey } from '@/lib/keypad';
import { fonts, radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

const ROWS: KeypadKey[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'back'],
];

type Props = { onKey: (key: KeypadKey) => void; onClear: () => void };

export function Keypad({ onKey, onClear }: Props) {
  const t = useTheme();
  const styles = useThemedStyles(makeStyles);

  const press = (key: KeypadKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onKey(key);
  };

  return (
    <View style={styles.grid}>
      {ROWS.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => press(key)}
              onLongPress={key === 'back' ? onClear : undefined}
              accessibilityRole="button"
              accessibilityLabel={key === 'back' ? 'Delete' : key === '.' ? 'Decimal point' : key}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              {key === 'back' ? (
                <Ionicons name="backspace-outline" size={26} color={t.text} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    grid: { gap: spacing.sm },
    row: { flexDirection: 'row', gap: spacing.sm },
    key: {
      flex: 1,
      height: 58,
      borderRadius: radius.md,
      backgroundColor: t.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    keyPressed: { backgroundColor: t.surfaceAlt, transform: [{ scale: 0.95 }] },
    keyText: { fontFamily: fonts.bold, fontSize: 26, color: t.text },
  });
