import { create } from 'zustand';

import { UserProfile } from '@/services/types';
import { clearUserSession, saveUserSession } from '@/services/session-storage';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  profile: UserProfile | null;
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
  setAuth: (session: Session | null, profile: UserProfile | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  (set) => ({
    session: null,
    profile: null,
    isHydrated: false,
    setHydrated: (value) => set({ isHydrated: value }),
    setAuth: (session, profile) => {
      set({ session, profile });
      void saveUserSession({ session, profile });
    },
    clearAuth: () => {
      set({ session: null, profile: null });
      void clearUserSession();
    },
  })
);
