import { useEffect } from 'react';

import { apiClient } from '@/services/api-client';
import { createSessionFromTokens, toUserProfile } from '@/services/auth';
import { isSupabaseReady, supabase } from '@/services/supabase';
import { loadUserSession } from '@/services/session-storage';
import { useAuthStore } from '@/store/auth-store';

export function useAuthBootstrap() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setHydrated = useAuthStore((state) => state.setHydrated);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const cachedSession = useAuthStore((state) => state.session);
  const cachedProfile = useAuthStore((state) => state.profile);

  useEffect(() => {
    let active = true;

    async function bootstrapAuth() {
      try {
        if (cachedSession && cachedProfile) {
          if (active) {
            setHydrated(true);
          }
          return;
        }

        const storedUserSession = await loadUserSession();
        if (storedUserSession?.session && active) {
          const storedProfile =
            storedUserSession.profile ??
            (storedUserSession.session.user
              ? {
                  id: storedUserSession.session.user.id,
                  fullName:
                    storedUserSession.session.user.user_metadata?.full_name ||
                    storedUserSession.session.user.email ||
                    '',
                  email: storedUserSession.session.user.email || '',
                  role: storedUserSession.session.user.user_metadata?.role || 'student',
                  regNumber: storedUserSession.session.user.user_metadata?.reg_number,
                  staffNumber: storedUserSession.session.user.user_metadata?.staff_number,
                  department: storedUserSession.session.user.user_metadata?.department,
                  phone: storedUserSession.session.user.user_metadata?.phone,
                  bio: storedUserSession.session.user.user_metadata?.bio,
                  avatarUrl: storedUserSession.session.user.user_metadata?.avatar_url,
                }
              : null);

          if (storedProfile) {
            setAuth(storedUserSession.session, storedProfile);
            setHydrated(true);
            return;
          }
        }

        if (isSupabaseReady && supabase) {
          const {
            data: { session: supabaseSession },
          } = await supabase.auth.getSession();

          if (supabaseSession?.user && active) {
            const storedProfile = cachedProfile ?? {
              id: supabaseSession.user.id,
              fullName: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email || '',
              email: supabaseSession.user.email || '',
              role: supabaseSession.user.user_metadata?.role || 'student',
              regNumber: supabaseSession.user.user_metadata?.reg_number,
              staffNumber: supabaseSession.user.user_metadata?.staff_number,
              department: supabaseSession.user.user_metadata?.department,
              phone: supabaseSession.user.user_metadata?.phone,
              bio: supabaseSession.user.user_metadata?.bio,
              avatarUrl: supabaseSession.user.user_metadata?.avatar_url,
            };

            setAuth(supabaseSession, storedProfile);
            setHydrated(true);
            return;
          }
        }

        const storedToken = await apiClient.getStoredAuthToken();
        if (!storedToken) {
          if (active) {
            clearAuth();
          }
          return;
        }

        const response = await apiClient.getCurrentUser();
        if (!active) {
          return;
        }

        const nextProfile = toUserProfile(response.user);
        const nextSession = createSessionFromTokens(nextProfile, storedToken, '');
        setAuth(nextSession, nextProfile);
      } catch {
        // Keep any cached auth state intact; a transient network error should not force logout.
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }

    bootstrapAuth();

    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseReady && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        if (!active) {
          return;
        }

        if (nextSession?.user) {
          const nextProfile = cachedProfile ?? {
            id: nextSession.user.id,
            fullName: nextSession.user.user_metadata?.full_name || nextSession.user.email || '',
            email: nextSession.user.email || '',
            role: nextSession.user.user_metadata?.role || 'student',
            regNumber: nextSession.user.user_metadata?.reg_number,
            staffNumber: nextSession.user.user_metadata?.staff_number,
            department: nextSession.user.user_metadata?.department,
            phone: nextSession.user.user_metadata?.phone,
            bio: nextSession.user.user_metadata?.bio,
            avatarUrl: nextSession.user.user_metadata?.avatar_url,
          };

          setAuth(nextSession, nextProfile);
          setHydrated(true);
          return;
        }
        setHydrated(true);
      });

      authSubscription = data.subscription;
    }

    return () => {
      active = false;
      authSubscription?.unsubscribe();
    };
  }, [cachedProfile, cachedSession, clearAuth, setAuth, setHydrated]);
}
