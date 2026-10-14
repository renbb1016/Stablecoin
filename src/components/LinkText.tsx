import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import { fonts, spacing, useTheme } from '@/theme';

export function LinkText({ url, children }: { url: string; children: string }) {
  const t = useTheme();
  return (
    <Pressable accessibilityRole="link" onPress={() => Linking.openURL(url)} hitSlop={8} style={styles.row}>
      <Text style={[styles.link, { color: t.accent }]}>{children}</Text>
      <Ionicons name="open-outline" size={15} color={t.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'center' },
  link: { fontFamily: fonts.bold, fontSize: 14 },
});
