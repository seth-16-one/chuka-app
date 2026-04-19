import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
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
import { AppAlertModal } from '@/components/ui/app-alert-modal';
import { FormScrollProvider } from '@/components/ui/form-scroll-context';
import { Input } from '@/components/ui/input';
import { OTPModal } from '@/components/ui/otp-modal';
import apiClientService from '@/services/api-client';
import { createSessionFromTokens, getDashboardPath, toUserProfile } from '@/services/auth';
import { saveUserSession } from '@/services/session-storage';
import { useAuthStore } from '@/store/auth-store';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const session = useAuthStore((state) => state.session);
  const profileState = useAuthStore((state) => state.profile);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpNoticeVisible, setOtpNoticeVisible] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDemoCode, setOtpDemoCode] = useState<string | undefined>();
  const [otpError, setOtpError] = useState<string | undefined>();
  const [otpResendLoading, setOtpResendLoading] = useState(false);
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
  const otpNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetLoginForm() {
    setIdentifier('');
    setPassword('');
    setShowPassword(false);
    setOtpVisible(false);
    setOtpNoticeVisible(false);
    setOtpChallengeId('');
    setOtpEmail('');
    setOtpDemoCode(undefined);
    setOtpError(undefined);
    setOtpResendLoading(false);
    if (otpNoticeTimer.current) {
      clearTimeout(otpNoticeTimer.current);
      otpNoticeTimer.current = null;
    }
  }

  async function handleLogin() {
    try {
      setLoading(true);
      const usernameOrEmail = identifier.trim();
      if (!usernameOrEmail || !password.trim()) {
        throw new Error('Please enter your username/email and password.');
      }

      const request = await apiClientService.requestLoginOtp(usernameOrEmail, password.trim());
      setOtpChallengeId(request.challengeId);
      setOtpEmail(request.email || usernameOrEmail);
      setOtpDemoCode(request.otpCode);
      setOtpError(undefined);
      setOtpNoticeVisible(true);
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
    if (!otpNoticeVisible) {
      return;
    }

    if (otpNoticeTimer.current) {
      clearTimeout(otpNoticeTimer.current);
    }

    otpNoticeTimer.current = setTimeout(() => {
      setOtpNoticeVisible(false);
      setOtpVisible(true);
    }, 850);

    return () => {
      if (otpNoticeTimer.current) {
        clearTimeout(otpNoticeTimer.current);
        otpNoticeTimer.current = null;
      }
    };
  }, [otpNoticeVisible]);

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
      setFeedback(null);
    }, feedback.status === 'success' ? 350 : 1700);

    return () => clearTimeout(timer);
  }, [feedback, opacity, router, scale, setAuth, shake]);

  useEffect(() => {
    if (!isHydrated || !session || !profileState) {
      return;
    }

    router.replace(getDashboardPath(profileState.role) as never);
  }, [isHydrated, profileState, router, session]);

  async function handleVerifyLoginOtp(otpCode: string) {
    try {
      setLoading(true);
      const response = await apiClientService.verifyLoginOtp(otpChallengeId, otpCode);
      const profile = toUserProfile(response.user);
      const next = getDashboardPath(profile.role ?? 'student');
      const session = createSessionFromTokens(profile, response.token, response.refreshToken);

      setAuth(session, profile);
      await saveUserSession({ session, profile });
      pendingAuth.current = { session, profile, next };
      resetLoginForm();
      setOtpVisible(false);
      setFeedback({
        status: 'success',
        message: 'Login successful. Preparing your university workspace.',
      });

      requestAnimationFrame(() => {
        router.replace(next as never);
      });
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Invalid verification code');
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleResendLoginOtp() {
    if (!otpEmail || !password.trim()) {
      return;
    }

    try {
      setOtpResendLoading(true);
      setOtpError(undefined);
      const request = await apiClientService.requestLoginOtp(otpEmail, password.trim());
      setOtpChallengeId(request.challengeId);
      setOtpDemoCode(request.otpCode);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Failed to resend verification code.');
    } finally {
      setOtpResendLoading(false);
    }
  }

  function handleCancelLoginOtp() {
    resetLoginForm();
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: isDark ? '#07140a' : '#F5F5F5' }}
      className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        className="flex-1">
        <AppAlertModal
          visible={Boolean(feedback)}
          title={feedback?.status === 'success' ? 'Login successful' : 'Login failed'}
          message={feedback?.message || ''}
          icon={feedback?.status === 'success' ? 'check' : 'close'}
          iconTone={feedback?.status === 'success' ? 'success' : 'error'}
          confirmLabel={feedback?.status === 'success' ? 'Great' : 'Okay'}
          confirmVariant={feedback?.status === 'success' ? 'primary' : 'danger'}
          onConfirm={() => setFeedback(null)}
          onCancel={() => setFeedback(null)}
          showActions
        />

        <AppAlertModal
          visible={otpNoticeVisible}
          title="Code sent"
          message={`A verification code has been sent to ${otpEmail || identifier.trim()}.`}
          icon="clock-outline"
          iconTone="info"
          confirmLabel="Continue"
          confirmVariant="primary"
          onConfirm={() => setOtpNoticeVisible(false)}
          onCancel={() => setOtpNoticeVisible(false)}
          showActions={false}
        />

        <OTPModal
          visible={otpVisible}
          email={otpEmail}
          onVerify={handleVerifyLoginOtp}
          onCancel={handleCancelLoginOtp}
          onResend={handleResendLoginOtp}
          loading={loading}
          resendLoading={otpResendLoading}
          error={otpError}
          demoOTP={otpDemoCode}
          title="Verify login"
          description="Enter the code sent to"
          buttonLabel="Verify and login"
        />

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
                      onPress={() => {
                        resetLoginForm();
                        router.push('/register');
                      }}
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
