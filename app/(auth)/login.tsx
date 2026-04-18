import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/ui/brand-mark';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormScrollProvider } from '@/components/ui/form-scroll-context';
import { Input } from '@/components/ui/input';
import { createDemoSession, getDashboardPath, signIn } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const pendingAuth = useRef<{
    session: Parameters<typeof setAuth>[0];
    profile: Parameters<typeof setAuth>[1];
    next: string;
  } | null>(null);
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView | null>(null);

  async function handleLogin() {
    try {
      setLoading(true);
      const profile = await signIn(identifier, password);
      const next = getDashboardPath(profile.role ?? 'student');
      const session = createDemoSession(profile);

      pendingAuth.current = { session, profile, next };
      setFeedback({
        status: 'success',
        message: 'Login successful. Preparing your university workspace.',
      });
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error instanceof Error ? error.message : 'Invalid login credentials',
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 1800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, [entrance, pulse]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    scale.setValue(0.92);
    opacity.setValue(0);
    shake.setValue(0);

    const baseEntrance = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 75,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    if (feedback.status === 'error') {
      Animated.sequence([
        baseEntrance,
        Animated.sequence([
          Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      baseEntrance.start();
    }

    const timer = setTimeout(() => {
      if (feedback.status === 'success' && pendingAuth.current) {
        setAuth(pendingAuth.current.session, pendingAuth.current.profile);
        const next = pendingAuth.current.next;
        pendingAuth.current = null;
        setFeedback(null);
        router.replace(next as never);
        return;
      }

      setFeedback(null);
    }, feedback.status === 'success' ? 350 : 1700);

    return () => clearTimeout(timer);
  }, [feedback, opacity, router, scale, setAuth, shake]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: isDark ? '#07140a' : '#F5F5F5' }}
      className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        className="flex-1">
        <Modal transparent visible={Boolean(feedback)} animationType="fade" statusBarTranslucent>
          <View className="flex-1 items-center justify-center bg-black/45 px-5">
            <Animated.View
              style={{
                opacity,
                transform: [
                  { scale },
                  { translateX: shake },
                  {
                    translateY: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 0],
                    }),
                  },
                ],
              }}
              className="w-full max-w-sm">
              <View
                style={{
                  backgroundColor:
                    feedback?.status === 'success'
                      ? isDark
                        ? '#0d1b11'
                        : '#eef7ef'
                      : isDark
                        ? '#2a1111'
                        : '#fff0f0',
                  borderColor:
                    feedback?.status === 'success'
                      ? isDark
                        ? '#2b5137'
                        : '#b7e2b7'
                      : isDark
                        ? '#6e2c2c'
                        : '#f3bcbc',
                }}
                className="overflow-hidden rounded-[34px] border px-6 py-8 shadow-soft">
                <View className="items-center">
                  <Animated.View
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: 999,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: feedback?.status === 'success' ? '#006400' : '#b91c1c',
                      transform: [
                        {
                          scale: pulse.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.98, 1.04],
                          }),
                        },
                      ],
                    }}>
                    <MaterialCommunityIcons
                      name={feedback?.status === 'success' ? 'check' : 'close'}
                      size={46}
                      color="#ffffff"
                    />
                  </Animated.View>

                  <Text
                    style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
                    className="mt-6 text-center text-2xl font-bold">
                    {feedback?.status === 'success' ? 'Login successful' : 'Login failed'}
                  </Text>
                  <Text
                    style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
                    className="mt-3 text-center text-base leading-6">
                    {feedback?.message}
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>

        <FormScrollProvider scrollRef={scrollRef} extraOffset={120}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 180 }}
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            <View className="bg-chuka-800 px-6 py-8 rounded-b-[42px] justify-center">
              <View
                pointerEvents="none"
                className="absolute -right-8 top-2 h-36 w-36 rounded-full bg-[#8fce8f]/25"
              />
              <View className="items-center">
                <BrandMark size="lg" />
                <Text className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.28em] text-chuka-100">
                  Student Portal
                </Text>
                <Text className="mt-3 text-center text-[26px] font-bold leading-8 text-white">
                  Learn, connect, and stay in sync
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-chuka-100">
                  Access timetable, notes, chat, and announcements.
                </Text>
              </View>
            </View>

            <View className="px-5 py-6">
              <Animated.View
                style={{
                  opacity: entrance,
                  transform: [
                    {
                      translateY: entrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [32, 0],
                      }),
                    },
                  ],
                }}>
                <Card className="rounded-[34px] px-6 py-6 shadow-lg">
                  <View className="gap-5">
                    <View className="gap-2">
                      <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-xl font-bold">
                        Sign in
                      </Text>
                      <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                        Enter your details to continue
                      </Text>
                    </View>

                    <Input
                      label="Username, email, or reg number"
                      value={identifier}
                      onChangeText={setIdentifier}
                      autoCapitalize="none"
                      keyboardType="default"
                      placeholder="johndoe, you@example.com, or AB1/12345/25"
                    />

                    <Input
                      label="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholder="Enter password"
                      rightAccessory={
                        <Pressable onPress={() => setShowPassword((v) => !v)}>
                          <MaterialCommunityIcons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={showPassword ? '#1e7a1e' : '#7c8f84'}
                          />
                        </Pressable>
                      }
                    />

                    <Pressable onPress={() => router.push('/forgot-password')}>
                      <Text className="text-sm font-semibold text-chuka-800 text-right">
                        Forgot password?
                      </Text>
                    </Pressable>

                    <Button
                      className="w-full"
                      title="Login"
                      loading={loading || Boolean(feedback)}
                      onPress={handleLogin}
                    />

                    <Button
                      className="w-full"
                      title="Create student account"
                      variant="secondary"
                      onPress={() => router.push('/register')}
                    />
                  </View>
                </Card>
              </Animated.View>
            </View>
          </ScrollView>
        </FormScrollProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
