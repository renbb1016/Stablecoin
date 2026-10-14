import '@/polyfills';

import {
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AppKit, AppKitProvider } from '@reown/appkit-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { WagmiProvider } from 'wagmi';

import { appKit, wagmiAdapter } from '@/config/appkit';
import { fonts, useTheme } from '@/theme';

const queryClient = new QueryClient();

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const t = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const ready = fontsLoaded || !!fontError; // fall back to system font rather than hang

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider instance={appKit}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: t.background },
              headerTintColor: t.text,
              headerTitleStyle: { fontFamily: fonts.bold, fontSize: 18 },
              headerShadowVisible: false,
              headerBackButtonDisplayMode: 'minimal',
              contentStyle: { backgroundColor: t.background },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="send" options={{ title: 'Send' }} />
          </Stack>
          <StatusBar style="auto" />
          {/* Workaround so the AppKit modal opens on Android with Expo Router:
              https://github.com/expo/expo/issues/32991#issuecomment-2489620459 */}
          <View style={styles.modalHost} pointerEvents="box-none">
            <AppKit />
          </View>
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

const styles = StyleSheet.create({
  modalHost: { ...StyleSheet.absoluteFill },
});
