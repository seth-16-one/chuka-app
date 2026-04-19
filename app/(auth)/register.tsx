import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClientService from '@/services/api-client';
import { registerStudent } from '@/services/auth';
import { buildPasswordChecklist } from '@/services/password-rules';

function hasAtLeastTwoNames(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length >= 2;
}

function isValidRegistrationNumber(value: string) {
  return /^[A-Z]{2}\d\/\d{5}\/\d{2}$/i.test(value.trim());
}

function formatRegistrationNumber(value: string, previousValue = '') {
  const uppercased = value.toUpperCase().replace(/[^A-Z0-9/]/g, '').slice(0, 12);
  const deleting = uppercased.length < previousValue.length;

  if (deleting) {
    return uppercased;
  }

  const compact = uppercased.replace(/\//g, '').slice(0, 10);
  const first = compact.slice(0, 3);
  const second = compact.slice(3, 8);
  const third = compact.slice(8, 10);

  return [first, second, third].filter(Boolean).join('/');
}

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otpChallengeId, setOtpChallengeId] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpDemoCode, setOtpDemoCode] = useState<string | undefined>();
  const [otpError, setOtpError] = useState<string | undefined>();
  const [otpResendLoading, setOtpResendLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const pendingRegistration = useRef<{
    fullName: string;
    email: string;
    regNumber: string;
    department: string;
    password: string;
  } | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  function resetRegistrationForm() {
    setFullName('');
    setEmail('');
    setRegNumber('');
    setDepartment('Computer Science');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setOtpVisible(false);
    setOtpChallengeId('');
    setOtpEmail('');
    setOtpDemoCode(undefined);
    setOtpError(undefined);
    setOtpResendLoading(false);
    pendingRegistration.current = null;
  }

  const passwordChecklist = useMemo(() => {
    return buildPasswordChecklist(password, [fullName], 'names');
  }, [fullName, password]);

  function scrollTo(y: number) {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  }

  useEffect(() => {
    const loop = Animated.loop(
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
    );

    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    scale.setValue(0.92);
    opacity.setValue(0);
    shake.setValue(0);

    const entrance = Animated.parallel([
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
        entrance,
        Animated.sequence([
          Animated.timing(shake, { toValue: -10, duration: 40, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 10, duration: 60, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      entrance.start();
    }

    const timer = setTimeout(() => {
      setFeedback(null);
    }, feedback.status === 'success' ? 350 : 1900);

    return () => clearTimeout(timer);
  }, [feedback, opacity, scale, shake]);

  async function handleRegister() {
    try {
      setLoading(true);

      if (!hasAtLeastTwoNames(fullName)) {
        throw new Error('Please enter at least two names.');
      }

      if (!email.trim()) {
        throw new Error('Email is required.');
      }

      if (!isValidRegistrationNumber(regNumber)) {
        throw new Error('Registration number must follow the format AB1/12345/25.');
      }

      if (!department.trim()) {
        throw new Error('Department is required.');
      }

      if (!passwordChecklist.isStrong) {
        throw new Error('Please create a stronger password using all the checklist rules.');
      }

      if (password !== confirmPassword) {
        throw new Error('Password and confirm password do not match.');
      }

      const request = await apiClientService.sendOTP(email.trim(), 'registration');

      pendingRegistration.current = {
        fullName: fullName.trim(),
        email: email.trim(),
        regNumber: regNumber.trim(),
        department: department.trim(),
        password,
      };

      setOtpChallengeId(request.challengeId);
      setOtpEmail(email.trim());
      setOtpDemoCode(request.otpCode);
      setOtpError(undefined);
      setOtpVisible(true);
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to create account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyRegistrationOtp(otpCode: string) {
    const pending = pendingRegistration.current;

    if (!pending) {
      throw new Error('Registration details expired. Please submit the form again.');
    }

    try {
      setLoading(true);
      await registerStudent({
        ...pending,
        challengeId: otpChallengeId,
        otpCode,
      });

      setOtpVisible(false);
      pendingRegistration.current = null;
      setFeedback({
        status: 'success',
        message: 'Registration successful. Returning to login.',
      });
      resetRegistrationForm();

      setTimeout(() => {
        router.replace('/login');
      }, 350);
    } finally {
      setLoading(false);
    }
  }

  async function handleResendRegistrationOtp() {
    if (!otpEmail) {
      return;
    }

    try {
      setOtpResendLoading(true);
      setOtpError(undefined);
      const request = await apiClientService.sendOTP(otpEmail, 'registration');
      setOtpChallengeId(request.challengeId);
      setOtpDemoCode(request.otpCode);
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Failed to resend verification code.');
    } finally {
      setOtpResendLoading(false);
    }
  }

  function handleCancelRegistrationOtp() {
    resetRegistrationForm();
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
          title={feedback?.status === 'success' ? 'Registration successful' : 'Registration failed'}
          message={feedback?.message || ''}
          icon={feedback?.status === 'success' ? 'check' : 'close'}
          iconTone={feedback?.status === 'success' ? 'success' : 'error'}
          confirmLabel={feedback?.status === 'success' ? 'Great' : 'Okay'}
          confirmVariant={feedback?.status === 'success' ? 'primary' : 'danger'}
          onConfirm={() => setFeedback(null)}
          onCancel={() => setFeedback(null)}
          showActions
        />

        <OTPModal
          visible={otpVisible}
          email={otpEmail}
          onVerify={handleVerifyRegistrationOtp}
          onCancel={handleCancelRegistrationOtp}
          onResend={handleResendRegistrationOtp}
          loading={loading}
          resendLoading={otpResendLoading}
          error={otpError}
          demoOTP={otpDemoCode}
          title="Verify registration"
          description="Enter the code sent to"
          buttonLabel="Create account"
        />

        <FormScrollProvider scrollRef={scrollRef} extraOffset={128}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 220 }}
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
                  Create your account
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-chuka-100">
                  Register to open your learning dashboard.
                </Text>
              </View>
            </View>

            <View className="px-5 py-6">
              <Card className="rounded-[34px] px-6 py-6 shadow-lg">
                <View className="gap-5">
                  <View className="gap-2">
                    <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-xl font-bold">
                      Student registration
                    </Text>
                    <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                      Enter your official details
                    </Text>
                  </View>

                  <Input
                    label="Full name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="First and last name"
                    hint="Use at least two names as they appear in official records."
                    onFocus={() => scrollTo(80)}
                  />

                  <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="you@example.com"
                    hint="Use your active personal email for registration."
                    onFocus={() => scrollTo(150)}
                  />

                  <Input
                    label="Registration number"
                    value={regNumber}
                    onChangeText={(value) =>
                      setRegNumber((previousValue) => formatRegistrationNumber(value, previousValue))
                    }
                    autoCapitalize="characters"
                    autoCorrect={false}
                    spellCheck={false}
                    autoComplete="off"
                    textContentType="none"
                    importantForAutofill="noExcludeDescendants"
                    contextMenuHidden={false}
                    selectTextOnFocus={false}
                    keyboardType="default"
                    maxLength={12}
                    placeholder="AB1/12345/25"
                    hint="Letters are capitalized automatically and slashes are inserted as you type."
                    onFocus={() => scrollTo(220)}
                  />

                  <Input
                    label="Department"
                    value={department}
                    onChangeText={setDepartment}
                    placeholder="Computer Science"
                    onFocus={() => scrollTo(300)}
                  />

                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Create a password"
                    onFocus={() => scrollTo(420)}
                    rightAccessory={
                      <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={12}>
                        <MaterialCommunityIcons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={showPassword ? '#1e7a1e' : '#7c8f84'}
                        />
                      </Pressable>
                    }
                  />

                  <Input
                    label="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholder="Confirm your password"
                    onFocus={() => scrollTo(520)}
                    rightAccessory={
                      <Pressable onPress={() => setShowConfirmPassword((value) => !value)} hitSlop={12}>
                        <MaterialCommunityIcons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={showConfirmPassword ? '#1e7a1e' : '#7c8f84'}
                        />
                      </Pressable>
                    }
                  />

                  <View className="gap-2">
                    <View className="flex-row items-center justify-between">
                      <Text style={{ color: isDark ? '#ffffff' : '#006400' }} className="text-sm font-semibold">
                        Password strength
                      </Text>
                      <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs font-bold uppercase tracking-[0.2em]">
                        {passwordChecklist.label}
                      </Text>
                    </View>
                    <View className="flex-row gap-2">
                      {[0, 1, 2, 3].map((index) => {
                        const filled = index < Math.min(passwordChecklist.score, 4);

                        return (
                          <View
                            key={index}
                            className="h-2 flex-1 rounded-full"
                            style={{
                              backgroundColor: filled ? '#006400' : '#dce8dc',
                            }}
                          />
                        );
                      })}
                    </View>
                    <View className="gap-2">
                      {passwordChecklist.rules.map((rule) => (
                        <View key={rule.label} className="flex-row items-center gap-2">
                          <MaterialCommunityIcons
                            name={rule.passed ? 'check-circle' : 'checkbox-blank-circle-outline'}
                            size={16}
                            color={rule.passed ? '#006400' : isDark ? '#9fb4a5' : '#7d8f83'}
                          />
                          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                            {rule.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                    <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                      {passwordChecklist.tip}
                    </Text>
                  </View>

                  <Button
                    className="w-full"
                    title="Create account"
                    loading={loading || otpVisible}
                    onPress={handleRegister}
                  />
                  <Button
                    className="w-full"
                    title="Back to login"
                    variant="secondary"
                    onPress={() => {
                      resetRegistrationForm();
                      router.back();
                    }}
                  />
                </View>
              </Card>
            </View>
          </ScrollView>
        </FormScrollProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
