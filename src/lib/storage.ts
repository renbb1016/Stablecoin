import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from '@reown/appkit-react-native';
import { safeJsonParse, safeJsonStringify } from '@walletconnect/safe-json';

// AsyncStorage-backed storage so wallet sessions survive app restarts.
export const storage: Storage = {
  getKeys: async () => (await AsyncStorage.getAllKeys()) as string[],
  getEntries: async <T = any>(): Promise<[string, T][]> => {
    const keys = await AsyncStorage.getAllKeys();
    return Promise.all(
      keys.map(async (key): Promise<[string, T]> => [
        key,
        safeJsonParse((await AsyncStorage.getItem(key)) ?? '') as T,
      ]),
    );
  },
  setItem: async <T = any>(key: string, value: T) => {
    await AsyncStorage.setItem(key, safeJsonStringify(value));
  },
  getItem: async <T = any>(key: string): Promise<T | undefined> => {
    const item = await AsyncStorage.getItem(key);
    return item == null ? undefined : (safeJsonParse(item) as T);
  },
  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },
};
