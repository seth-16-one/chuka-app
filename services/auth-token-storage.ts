import { safeStorage } from './safe-storage';
import { secureStorage } from './secure-storage';

type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_TOKENS_KEY = 'auth_tokens';
const LEGACY_AUTH_TOKEN_KEY = 'auth_token';

export async function saveAuthTokens(tokens: AuthTokenPair): Promise<void> {
  try {
    await secureStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // Keep auth flow non-blocking if secure storage is unavailable.
  }
}

export async function loadAuthTokens(): Promise<AuthTokenPair | null> {
  try {
    const secureRaw = await secureStorage.getItem(AUTH_TOKENS_KEY);
    if (secureRaw) {
      const parsed = JSON.parse(secureRaw) as Partial<AuthTokenPair> | null;
      if (parsed?.accessToken && parsed?.refreshToken) {
        return {
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken,
        };
      }
    }

    const legacyToken = await safeStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
    if (!legacyToken) {
      return null;
    }

    const migratedTokens = {
      accessToken: legacyToken,
      refreshToken: legacyToken,
    };

    await saveAuthTokens(migratedTokens);
    await safeStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    return migratedTokens;
  } catch {
    return null;
  }
}

export async function clearAuthTokens(): Promise<void> {
  try {
    await secureStorage.removeItem(AUTH_TOKENS_KEY);
    await safeStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}
