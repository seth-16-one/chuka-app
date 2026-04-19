import 'react-native-url-polyfill/auto';

import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { safeStorage } from './safe-storage';

const extras = Constants.expoConfig?.extra ?? {};

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (typeof extras.supabaseUrl === 'string' ? extras.supabaseUrl : '');

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  (typeof extras.supabaseAnonKey === 'string' ? extras.supabaseAnonKey : '');

export const isSupabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: safeStorage as any,
      },
    })
  : null;
