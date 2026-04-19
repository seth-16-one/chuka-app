import type { Session } from '@supabase/supabase-js';

import { safeStorage } from './safe-storage';
import { secureStorage } from './secure-storage';
import type { UserProfile } from './types';

export type StoredUserSession = {
  session: Session | null;
  profile: UserProfile | null;
};

const USER_SESSION_KEY = 'user_session';

export async function saveUserSession(payload: StoredUserSession): Promise<void> {
  try {
    await secureStorage.setItem(USER_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Session persistence should never crash the app.
  }
}

export async function loadUserSession(): Promise<StoredUserSession | null> {
  try {
    const secureRaw = await secureStorage.getItem(USER_SESSION_KEY);
    if (secureRaw) {
      const parsed = JSON.parse(secureRaw) as Partial<StoredUserSession> | null;
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      return {
        session: parsed.session ?? null,
        profile: parsed.profile ?? null,
      };
    }

    const legacyRaw = await safeStorage.getItem(USER_SESSION_KEY);
    if (!legacyRaw) {
      return null;
    }

    const parsed = JSON.parse(legacyRaw) as Partial<StoredUserSession> | null;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const nextSession = {
      session: parsed.session ?? null,
      profile: parsed.profile ?? null,
    };

    await secureStorage.setItem(USER_SESSION_KEY, JSON.stringify(nextSession));
    await safeStorage.removeItem(USER_SESSION_KEY);
    return nextSession;
  } catch {
    return null;
  }
}

export async function clearUserSession(): Promise<void> {
  try {
    await secureStorage.removeItem(USER_SESSION_KEY);
    await safeStorage.removeItem(USER_SESSION_KEY);
  } catch {
    // Ignore cleanup failures.
  }
}
