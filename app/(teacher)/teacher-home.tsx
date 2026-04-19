import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useAuthStore } from '@/store/auth-store';
import { useColorScheme } from '@/hooks/use-color-scheme';

const teacherActions = [
  {
    label: 'Manage classes',
    href: '/teacher-staff',
    description: 'Create classes, post materials, and keep course work organized.',
    icon: 'account-group-outline',
  },
  {
    label: 'Timetable',
    href: '/teacher-timetable',
    description: 'Add sessions and adjust live class schedules.',
    icon: 'calendar-clock-outline',
  },
  {
    label: 'Chat with students',
    href: '/teacher-chat',
    description: 'Open the class chat and answer questions quickly.',
    icon: 'chat-processing-outline',
  },
] as const;

export default function TeacherHomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#23424a] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Teacher portal</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Academic control center</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Sign in with your portal account to manage classes, communication, and schedule updates.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={profile?.role || 'lecturer'} tone="green" />
          <Badge label="Login only" tone="gray" />
        </View>
      </View>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Teacher dashboard
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          This area is for lecturers and administrators who already have a school portal account.
        </Text>
        <View className="mt-4 gap-3">
          {teacherActions.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={{
                backgroundColor: isDark ? '#17211c' : '#f8fbf8',
                borderColor: isDark ? '#313d3b' : '#dbe4df',
              }}
              className="rounded-[24px] border px-4 py-4">
              <View className="flex-row items-start gap-3">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                  <MaterialCommunityIcons
                    name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                    size={22}
                    color="#ffffff"
                  />
                </View>
                <View className="flex-1">
                  <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                    {item.label}
                  </Text>
                  <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                    {item.description}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </Card>
    </Screen>
  );
}
