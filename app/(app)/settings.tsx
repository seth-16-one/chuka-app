import { Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import * as Updates from 'expo-updates';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandMark } from '@/components/ui/brand-mark';
import { AppAlertModal } from '@/components/ui/app-alert-modal';
import { Screen } from '@/components/ui/screen';
import { signOut } from '@/services/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';
import { useThemeStore } from '@/store/theme-store';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const profile = useAuthStore((state) => state.profile);
  const themePreference = useThemeStore((state) => state.themePreference);
  const setThemePreference = useThemeStore((state) => state.setThemePreference);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('Check for the latest version of the app.');
  const [updateIcon, setUpdateIcon] = useState<'info' | 'success' | 'warning'>('info');
  const buildChannel = Updates.channel ?? 'unknown';
  const runtimeVersion = Updates.runtimeVersion ?? 'unknown';
  const themeCards = useMemo(
    () => [
      {
        label: 'Light',
        value: 'light' as const,
        description: 'Bright interface with white and green surfaces.',
        tint: '#33447a',
        icon: 'white-balance-sunny',
      },
      {
        label: 'Dark',
        value: 'dark' as const,
        description: 'Deeper campus look for low-light use.',
        tint: '#1f5f54',
        icon: 'moon-waning-crescent',
      },
      {
        label: 'System',
        value: 'system' as const,
        description: 'Follow the device appearance setting.',
        tint: '#5a4638',
        icon: 'cellphone',
      },
    ],
    []
  );

  async function handleLogout() {
    setLogoutLoading(true);
    setLogoutError('');
    try {
      await signOut();
      clearAuth();
      router.replace('/login');
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLogoutLoading(false);
      setLogoutVisible(false);
    }
  }

  async function checkForUpdates() {
    try {
      setUpdateLoading(true);

      if (!Updates.isEnabled) {
        setUpdateAvailable(false);
        setUpdateIcon('info');
        setUpdateMessage(
          'App updates are only available in an installed EAS build. Use a production or preview build, then publish updates to the matching channel.'
        );
        setUpdateVisible(true);
        return;
      }

      const result = await Updates.checkForUpdateAsync();
      if (result.isAvailable) {
        setUpdateAvailable(true);
        setUpdateIcon('info');
        setUpdateMessage('A newer version is available. Tap Update now to download and restart with the latest app.');
        setUpdateVisible(true);
        return;
      }

      setUpdateAvailable(false);
      setUpdateIcon('success');
      setUpdateMessage('You are already on the latest version.');
      setUpdateVisible(true);
    } catch (error) {
      setUpdateAvailable(false);
      setUpdateIcon('warning');
      setUpdateMessage(error instanceof Error ? error.message : 'Unable to check for updates right now.');
      setUpdateVisible(true);
    } finally {
      setUpdateLoading(false);
    }
  }

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Settings</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Appearance and app preferences</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Light is the default. You can switch to dark or follow your device later.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={themePreference.toUpperCase()} tone="gray" />
          <Badge label={buildChannel} tone="green" />
        </View>
      </View>

      <View className="mt-5">
        <Card
          className="rounded-[30px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#32474a]">
              <BrandMark size="md" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
                {profile?.fullName || 'Chuka University App'}
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                Theme, updates, and session controls for your device.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Theme
        </Text>
        <View className="mt-3 gap-3">
          {themeCards.map((option) => {
            const active = themePreference === option.value;
            return (
              <Card
                key={option.value}
                className={active ? 'border-chuka-800' : ''}
                style={{
                  backgroundColor: isDark ? '#202a29' : '#ffffff',
                  borderColor: active ? '#8fce8f' : isDark ? '#313d3b' : '#dbe4df',
                }}>
                <View className="flex-row items-start gap-3">
                  <View style={{ backgroundColor: option.tint }} className="h-12 w-12 items-center justify-center rounded-[18px]">
                    <MaterialCommunityIcons name={option.icon as any} size={24} color="#ffffff" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                        {option.label}
                      </Text>
                      {active ? <Badge label="Active" tone="green" /> : null}
                    </View>
                    <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                      {option.description}
                    </Text>
                  </View>
                </View>
                <Button
                  className="mt-4"
                  title={active ? 'Current mode' : `Use ${option.label.toLowerCase()}`}
                  variant={active ? 'secondary' : 'primary'}
                  onPress={() => setThemePreference(option.value)}
                  disabled={active}
                />
              </Card>
            );
          })}
        </View>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          App notes
        </Text>
        <Card
          className="mt-3 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm leading-6">
            The Chuka green palette stays consistent across login, dashboard, tabs, and content cards.
            Theme changes apply to the full app shell.
          </Text>
        </Card>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Updates
        </Text>
        <Card
          className="mt-3 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-center gap-4">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="update" size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                Keep the app current
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                Channel: {buildChannel} | Runtime: {runtimeVersion}
              </Text>
            </View>
          </View>
          <Button className="mt-4" title="Check for updates" variant="secondary" onPress={checkForUpdates} loading={updateLoading} />
        </Card>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Session
        </Text>
        <Card
          className="mt-3 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm leading-6">
            Log out safely when you are done. Your session is stored securely on this device and stays signed in
            until you log out or clear the app data.
          </Text>
          <Button
            className="mt-4"
            title="Manage sessions"
            variant="secondary"
            onPress={() => router.push('/sessions' as never)}
          />
          <Button className="mt-3" title="Logout" variant="danger" onPress={() => setLogoutVisible(true)} />
        </Card>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Documents
        </Text>
        <Card
          className="mt-3 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm leading-6">
            The app remembers your last document type and the Android Downloads folder you connected for gatepasses,
            exam cards, and transcripts.
          </Text>
          <Button className="mt-4" title="Open documents" variant="secondary" onPress={() => router.push('/documents' as never)} />
        </Card>
      </View>

      <AppAlertModal
        visible={logoutVisible}
        title={logoutError ? 'Logout failed' : 'Log out?'}
        message={
          logoutError ||
          'This removes your secure session from the device. If you clear app data, you will also need to sign in again.'
        }
        icon={logoutError ? 'alert-outline' : 'logout-variant'}
        iconTone={logoutError ? 'error' : 'warning'}
        confirmLabel={logoutError ? 'Okay' : 'Logout'}
        confirmVariant={logoutError ? 'primary' : 'danger'}
        onConfirm={logoutError ? () => setLogoutVisible(false) : handleLogout}
        onCancel={() => {
          setLogoutError('');
          setLogoutVisible(false);
        }}
        loading={logoutLoading}
      />

      <AppAlertModal
        visible={updateVisible}
        title="App update"
        message={updateMessage}
        icon={updateIcon === 'success' ? 'check-circle-outline' : updateIcon === 'warning' ? 'alert-outline' : 'update'}
        iconTone={updateIcon}
        confirmLabel={updateAvailable ? 'Update now' : 'Okay'}
        confirmVariant="primary"
        onConfirm={async () => {
          if (updateAvailable && Updates.isEnabled) {
            try {
              setUpdateLoading(true);
              await Updates.fetchUpdateAsync();
              await Updates.reloadAsync();
            } finally {
              setUpdateLoading(false);
            }
            return;
          }

          setUpdateVisible(false);
        }}
        onCancel={() => setUpdateVisible(false)}
        loading={updateLoading}
      />
    </Screen>
  );
}
