import { useEffect, useMemo, useState } from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppAlertModal } from './app-alert-modal';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ensureForegroundLocationPermission, getCurrentLocation } from '@/services/location';

type PermissionState = {
  name: string;
  granted: boolean;
  required: boolean;
};

function getAndroidPermissionGroups() {
  return [
    {
      label: 'Location',
      icon: 'map-marker-radius',
      permissions: [],
      required: true,
    },
  ] as const;
}

export function PermissionGate() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [details, setDetails] = useState<PermissionState[]>([]);

  const requiredBlocked = useMemo(
    () => details.some((permission) => permission.required && !permission.granted),
    [details]
  );

  async function refreshPermissions() {
    if (Platform.OS !== 'android') {
      setReady(true);
      return;
    }

    setChecking(true);
    try {
      const nextDetails: PermissionState[] = [];

      for (const group of getAndroidPermissionGroups()) {
        let granted = true;

        if (group.label === 'Location') {
          granted = await ensureForegroundLocationPermission();
          if (granted) {
            await getCurrentLocation();
          }
        }

        nextDetails.push({
          name: group.label,
          granted,
          required: group.required,
        });
      }

      setDetails(nextDetails);
      setBlocked(nextDetails.some((permission) => permission.required && !permission.granted));
      setReady(true);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    refreshPermissions();
  }, []);

  if (Platform.OS !== 'android') {
    return null;
  }

  if (!ready || (!requiredBlocked && !blocked)) {
    return null;
  }

  return (
    <AppAlertModal
      visible
      title="Permissions required"
      message="Please allow location access so the app can continue."
      icon="shield-lock-outline"
      iconTone="warning"
      confirmLabel="Allow permissions"
      confirmVariant="primary"
      onConfirm={refreshPermissions}
      onCancel={() => Linking.openSettings()}
      cancelLabel="Open settings"
      loading={checking}
      footer={
        <View className="gap-3">
          {details.map((permission) => (
            <View
              key={permission.name}
              style={{
                backgroundColor: isDark ? '#07140a' : '#f4f8f4',
                borderColor: isDark ? '#1f3b27' : '#d7e6d7',
              }}
              className="flex-row items-center justify-between rounded-2xl border px-4 py-3">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-sm font-semibold">
                {permission.name}
              </Text>
              <MaterialCommunityIcons
                name={permission.granted ? 'check-circle' : 'close-circle'}
                size={20}
                color={permission.granted ? '#006400' : '#b91c1c'}
              />
            </View>
          ))}
        </View>
      }
    />
  );
}
