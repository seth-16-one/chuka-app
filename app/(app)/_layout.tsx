import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/auth-store';

function Icon({ name, color }: { name: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }) {
  return <MaterialCommunityIcons name={name} size={24} color={color} />;
}

export default function AppLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (isHydrated && !session) {
    return <Redirect href="/login" />;
  }

  return (
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDark ? '#8fce8f' : '#006400',
        tabBarInactiveTintColor: isDark ? '#91a091' : '#7c8f84',
        tabBarLabelPosition: 'below-icon',
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          paddingTop: 6,
          borderRadius: 20,
          marginHorizontal: 4,
        },
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: isDark ? '#07140a' : '#ffffff',
          height: 82,
          paddingBottom: 14,
          paddingTop: 10,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 24,
          position: 'absolute',
          shadowColor: '#006400',
          shadowOpacity: isDark ? 0.22 : 0.1,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 8 },
          elevation: 14,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <Icon name="chat-processing-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <Icon name="clipboard-text-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => <Icon name="video-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Icon name="menu" color={color} />,
        }}
      />
      <Tabs.Screen name="announcements" options={{ href: null }} />
      <Tabs.Screen name="finance" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="sessions" options={{ href: null }} />
      <Tabs.Screen name="media" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="staff" options={{ href: null }} />
      <Tabs.Screen name="call" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
