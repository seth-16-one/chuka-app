import EncryptedStorage from 'react-native-encrypted-storage';

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await EncryptedStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch {
      // Ignore secure persistence failures so the app can keep running.
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await EncryptedStorage.removeItem(key);
    } catch {
      // Ignore cleanup failures.
    }
  },
};
