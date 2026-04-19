import { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppAlertModal } from '@/components/ui/app-alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClientService from '@/services/api-client';
import type { DeviceSession } from '@/services/types';

function formatDateTime(value?: string | null) {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function SessionsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busySessionId, setBusySessionId] = useState<string | null>(null);
  const [revokeAllBusy, setRevokeAllBusy] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DeviceSession | null>(null);

  const activeSessions = useMemo(() => sessions.filter((session) => !session.revokedAt), [sessions]);

  async function loadSessions() {
    try {
      setLoading(true);
      setError('');
      const response = await apiClientService.getDeviceSessions();
      setSessions(response.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function revokeSession(session: DeviceSession) {
    if (session.isCurrent) {
      Alert.alert('Current session', 'Use the logout button to end the current session.');
      return;
    }

    try {
      setBusySessionId(session.id);
      await apiClientService.revokeDeviceSession(session.id);
      await loadSessions();
    } catch (err) {
      Alert.alert('Unable to revoke', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setBusySessionId(null);
      setSelectedSession(null);
      setConfirmVisible(false);
    }
  }

  async function revokeOtherSessions() {
    try {
      setRevokeAllBusy(true);
      await apiClientService.revokeOtherDeviceSessions();
      await loadSessions();
    } catch (err) {
      Alert.alert('Unable to revoke sessions', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setRevokeAllBusy(false);
      setSelectedSession(null);
      setConfirmVisible(false);
    }
  }

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Security</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Signed-in sessions</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Review every device signed into your account and remove anything you do not recognize.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={`${activeSessions.length} active`} tone="green" />
          <Badge label="IP + location shown" tone="gray" />
        </View>
      </View>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <View className="flex-row items-start gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-[#32474a]">
            <MaterialCommunityIcons name="shield-check-outline" size={26} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
              Account protection
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
              You can end any unfamiliar session. The current device is marked so you can keep working safely.
            </Text>
          </View>
        </View>
      </Card>

      <View className="mt-6">
        <View className="flex-row items-center justify-between gap-3">
          <View>
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
              Devices
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-5">
              Approximate location is based on the session IP address.
            </Text>
          </View>
          <Button title="Refresh" variant="secondary" onPress={loadSessions} loading={loading} />
        </View>

        <View className="mt-4 gap-3">
          {error ? (
            <Card
              className="rounded-[26px] px-4 py-4"
              style={{
                backgroundColor: isDark ? '#202a29' : '#ffffff',
                borderColor: isDark ? '#313d3b' : '#dbe4df',
              }}>
              <Text style={{ color: isDark ? '#ffd9d9' : '#7f1d1d' }} className="text-sm leading-6">
                {error}
              </Text>
            </Card>
          ) : null}

          {loading ? (
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm">
              Loading sessions...
            </Text>
          ) : null}

          {!loading && !sessions.length ? (
            <Card
              className="rounded-[26px] px-4 py-5"
              style={{
                backgroundColor: isDark ? '#202a29' : '#ffffff',
                borderColor: isDark ? '#313d3b' : '#dbe4df',
              }}>
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                No sessions found
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                Sign in on another device and it will show up here.
              </Text>
            </Card>
          ) : null}

          {sessions.map((session) => (
            <Card
              key={session.id}
              className="rounded-[28px] px-4 py-4"
              style={{
                backgroundColor: isDark ? '#202a29' : '#ffffff',
                borderColor: session.isCurrent ? '#8fce8f' : isDark ? '#313d3b' : '#dbe4df',
              }}>
              <View className="flex-row items-start gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                  <MaterialCommunityIcons
                    name={session.isCurrent ? 'cellphone-check' : 'cellphone-link'}
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between gap-3">
                    <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                      {session.deviceName}
                    </Text>
                    {session.isCurrent ? <Badge label="Current" tone="green" /> : <Badge label="Remote" tone="gray" />}
                  </View>
                  <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                    {session.locationLabel || 'Unknown location'}
                  </Text>
                  <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-xs leading-5">
                    IP: {session.ipAddress || 'Unknown'} | Last seen: {formatDateTime(session.lastSeenAt)}
                  </Text>
                  <Text style={{ color: isDark ? '#b9c9c6' : '#6f7d77' }} className="mt-1 text-xs leading-5">
                    Created: {formatDateTime(session.createdAt)}
                  </Text>
                </View>
              </View>

              {session.revokedAt ? (
                <Text style={{ color: isDark ? '#ffd9d9' : '#7f1d1d' }} className="mt-3 text-xs font-semibold uppercase tracking-[0.18em]">
                  Revoked
                </Text>
              ) : null}

              <View className="mt-4 flex-row gap-3">
                <Button
                  className="flex-1"
                  title={session.isCurrent ? 'Current session' : 'Terminate'}
                  variant={session.isCurrent ? 'secondary' : 'danger'}
                  onPress={() => {
                    if (session.isCurrent) {
                      Alert.alert('Current session', 'This is the device you are currently using.');
                      return;
                    }
                    setSelectedSession(session);
                    setConfirmVisible(true);
                  }}
                  loading={busySessionId === session.id}
                  disabled={session.revokedAt != null}
                />
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <Button
          title="Terminate other sessions"
          variant="secondary"
          onPress={() => {
            setSelectedSession(null);
            setConfirmVisible(true);
          }}
          loading={revokeAllBusy}
          disabled={sessions.filter((session) => !session.isCurrent && !session.revokedAt).length === 0}
        />
      </View>

      <AppAlertModal
        visible={confirmVisible}
        title={selectedSession ? 'Terminate session?' : 'End other sessions?'}
        message={
          selectedSession
            ? `This will sign out ${selectedSession.deviceName}.`
            : 'This will sign out every other device except the current one.'
        }
        icon="shield-alert-outline"
        iconTone="warning"
        confirmLabel="Terminate"
        confirmVariant="danger"
        onConfirm={selectedSession ? () => revokeSession(selectedSession) : revokeOtherSessions}
        onCancel={() => {
          setSelectedSession(null);
          setConfirmVisible(false);
        }}
        loading={busySessionId != null || revokeAllBusy}
      />
    </Screen>
  );
}
