import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { PermissionGate } from '@/components/ui/permission-gate';
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  useAuthBootstrap();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PermissionGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? '#07140a' : '#f4f7f5' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(teacher)" />
      </Stack>
      <StatusBar
        style={isDark ? 'light' : 'dark'}
        translucent
        backgroundColor="transparent"
      />
    </ThemeProvider>
  );
}
