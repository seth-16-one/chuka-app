import type { ComponentProps } from 'react';

import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

const menuItems = [
  { label: 'Timetable', href: '/timetable', note: 'Check your weekly classes', icon: 'calendar-clock-outline' },
  { label: 'Announcements', href: '/announcements', note: 'Campus updates and notices', icon: 'bullhorn-outline' },
  { label: 'Notes', href: '/notes', note: 'Share and review files', icon: 'book-open-variant-outline' },
  { label: 'Media', href: '/media', note: 'Play live audio and video', icon: 'play-circle-outline' },
  { label: 'Documents', href: '/documents', note: 'Download gatepass and exam cards', icon: 'file-document-multiple-outline' },
  { label: 'Teacher Tools', href: '/staff', note: 'Upload materials and updates', icon: 'account-tie-hat-outline' },
  { label: 'Profile', href: '/profile', note: 'View your account details', icon: 'account-circle-outline' },
  { label: 'Sessions', href: '/sessions', note: 'Manage signed-in devices', icon: 'shield-key-outline' },
  { label: 'Settings', href: '/settings', note: 'Change theme and preferences', icon: 'cog-outline' },
  { label: 'Chat', href: '/chat', note: 'Jump back into conversations', icon: 'chat-processing-outline' },
];

const menuGrid = [
  { label: 'Home', href: '/dashboard', icon: 'home-outline', tint: '#33447a' },
  { label: 'Chat', href: '/chat', icon: 'message-outline', tint: '#1f5f54' },
  { label: 'Tasks', href: '/timetable', icon: 'clipboard-text-outline', tint: '#5a4638' },
  { label: 'Live', href: '/notes', icon: 'video-outline', tint: '#2d5566' },
  { label: 'Docs', href: '/documents', icon: 'file-document-outline', tint: '#6a4f2f' },
  { label: 'Teacher', href: '/staff', icon: 'account-tie-hat-outline', tint: '#483c77' },
  { label: 'Profile', href: '/profile', icon: 'account-circle-outline', tint: '#483c77' },
  { label: 'Settings', href: '/settings', icon: 'cog-outline', tint: '#553b50' },
] as const;

export default function MenuScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Menu</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">More campus tools in one place</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Jump into timetable, notes, settings, and the rest of your academic workspace.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label="Quick access" tone="gray" />
          <Badge label="Student portal" tone="green" />
        </View>
      </View>

      {profile ? (
        <Card
          className="mt-5 rounded-[30px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-center gap-4">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="account-circle-outline" size={28} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
                {profile.fullName}
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
                {profile.email}
              </Text>
              <Text style={{ color: isDark ? '#b9c9c6' : '#6f7d77' }} className="mt-2 text-xs font-semibold uppercase tracking-[0.18em]">
                {profile.role} account
              </Text>
            </View>
          </View>
          <View className="mt-4 flex-row flex-wrap gap-2">
            <Badge label={profile.role} tone="green" />
            {profile.department ? <Badge label={profile.department} tone="gray" /> : null}
            {profile.regNumber ? <Badge label={profile.regNumber} tone="gray" /> : null}
          </View>
        </Card>
      ) : null}

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Quick Access
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-4">
          {menuGrid.map((item) => (
            <Pressable key={item.label} onPress={() => router.push(item.href as never)} className="w-[48%]">
              <View>
                <View
                  style={{ backgroundColor: item.tint }}
                  className="h-[110px] items-center justify-center rounded-[28px]">
                  <MaterialCommunityIcons
                    name={item.icon as ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={24}
                  color="#ffffff"
                />
                </View>
                <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-3 text-[15px] font-bold">
                  {item.label}
                </Text>
                <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-1 text-xs leading-5">
                  Open {item.label.toLowerCase()}.
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-7">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          App Sections
        </Text>
        <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-1 text-sm leading-6">
          Navigate the rest of the portal from here.
        </Text>

        <View className="mt-3 gap-3">
          {menuItems.map((item) => (
            <Pressable key={item.label} onPress={() => router.push(item.href as never)}>
              <Card
                className="rounded-[26px] px-4 py-4"
                style={{
                  backgroundColor: isDark ? '#202a29' : '#ffffff',
                  borderColor: isDark ? '#313d3b' : '#dbe4df',
                }}>
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                    <MaterialCommunityIcons
                      name={item.icon as ComponentProps<typeof MaterialCommunityIcons>['name']}
                      size={18}
                      color="#ffffff"
                    />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                      {item.label}
                    </Text>
                    <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-1 text-sm leading-5">
                      {item.note}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={isDark ? '#d8e6db' : '#4f6655'} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
