import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

function getInitials(name?: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return 'CU';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const stats = [
    { label: 'Account', value: profile?.role ?? 'student', icon: 'account-cog-outline', tint: '#33447a' },
    { label: 'Department', value: profile?.department ?? 'Not set', icon: 'domain-outline', tint: '#1f5f54' },
    { label: 'Roll No', value: profile?.regNumber ?? 'N/A', icon: 'card-account-details-outline', tint: '#5a4638' },
  ] as const;

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Profile</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Your account</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Manage your campus identity, access level, and account details from one place.
        </Text>
      </View>

      {profile ? (
        <Card
          className="mt-5 rounded-[30px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#32474a]">
              {profile.avatarUrl ? (
                <MaterialCommunityIcons name="account" size={34} color="#ffffff" />
              ) : (
                <Text className="text-lg font-bold text-white">{getInitials(profile.fullName)}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-xl font-bold">
                {profile.fullName}
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                {profile.email}
              </Text>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <Badge label={profile.role} tone="green" />
                {profile.department ? <Badge label={profile.department} tone="gray" /> : null}
              </View>
            </View>
          </View>
        </Card>
      ) : null}

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Access details
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-4">
          {stats.map((item) => (
            <View key={item.label} className="w-[48%]">
              <Card
                className="rounded-[28px] px-4 py-4"
                style={{
                  backgroundColor: isDark ? '#202a29' : '#ffffff',
                  borderColor: isDark ? '#313d3b' : '#dbe4df',
                }}>
                <View style={{ backgroundColor: item.tint }} className="h-12 w-12 items-center justify-center rounded-[18px]">
                  <MaterialCommunityIcons name={item.icon as any} size={22} color="#ffffff" />
                </View>
                <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-3 text-xs font-semibold uppercase tracking-[0.16em]">
                  {item.label}
                </Text>
                <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-1 text-sm font-bold">
                  {item.value}
                </Text>
              </Card>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Quick actions
        </Text>
        <View className="mt-3 gap-3">
          <Pressable onPress={() => router.push('/settings')}>
            <Card
              className="rounded-[26px] px-4 py-4"
              style={{
                backgroundColor: isDark ? '#202a29' : '#ffffff',
                borderColor: isDark ? '#313d3b' : '#dbe4df',
              }}>
              <View className="flex-row items-center gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                  <MaterialCommunityIcons name="cog-outline" size={24} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                    Open settings
                  </Text>
                  <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-1 text-sm leading-5">
                    Change theme, updates, and logout safely.
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color={isDark ? '#d8e6db' : '#4f6655'} />
              </View>
            </Card>
          </Pressable>

          <Button title="Open settings" variant="secondary" onPress={() => router.push('/settings')} />
        </View>
      </View>
    </Screen>
  );
}
