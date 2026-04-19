import { safeStorage } from './safe-storage';

export async function readCache<T>(key: string, fallback: T): Promise<T> {
  try {
    const value = await safeStorage.getItem(key);
    if (!value) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function writeCache<T>(key: string, value: T) {
  try {
    await safeStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache write failures so the app stays responsive offline.
  }
}
