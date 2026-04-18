import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BrandMark } from '@/components/ui/brand-mark';
import { FormScrollProvider } from '@/components/ui/form-scroll-context';
import { Input } from '@/components/ui/input';
import { buildPasswordChecklist } from '@/services/password-rules';
import backendApi from '@/services/api-client';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [identifier, setIdentifier] = useState('');
  const [linkedEmail, setLinkedEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    status: 'success' | 'error';
    message: string;
  } | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  const step = challengeId ? 2 : 1;

  function scrollTo(y: number) {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y, animated: true });
    }, 120);
  }

  const passwordChecklist = useMemo(() => {
    const localPart = linkedEmail.split('@')[0] || identifier.split('@')[0] || '';
    return buildPasswordChecklist(newPassword, [localPart], 'email name');
  }, [identifier, linkedEmail, newPassword]);

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
      if (feedback.status === 'success') {
        router.replace('/login');
      }
      setFeedback(null);
    }, feedback.status === 'success' ? 350 : 1900);

    return () => clearTimeout(timer);
  }, [feedback, opacity, pulse, router, scale, shake]);

  async function handleSendCode() {
    try {
      if (!identifier.trim()) {
        throw new Error('Enter your email or registration number first.');
      }

      setLoading(true);
      const response = await backendApi.requestPasswordReset(identifier.trim());
      setLinkedEmail(response.email);
      setChallengeId(response.challengeId);
      setEnteredCode('');
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to send reset code.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    try {
      if (!linkedEmail || !challengeId) {
        throw new Error('Request a reset code first.');
      }

      if (enteredCode.trim().length !== 6) {
        throw new Error('Enter the 6-digit reset code.');
      }

      if (!passwordChecklist.isStrong) {
        throw new Error('Use all password checklist rules before resetting your password.');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Password and confirm password do not match.');
      }

      setLoading(true);
      await backendApi.confirmPasswordReset(linkedEmail, challengeId, enteredCode.trim(), newPassword);
      setFeedback({
        status: 'success',
        message: 'Password reset successful. Returning to login.',
      });
      setTimeout(() => {
        router.replace('/login');
      }, 350);
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to reset password.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    try {
      if (!identifier.trim()) {
        throw new Error('Enter your email or registration number first.');
      }

      setResendLoading(true);
      const response = await backendApi.requestPasswordReset(identifier.trim());
      setLinkedEmail(response.email);
      setChallengeId(response.challengeId);
      setEnteredCode('');
    } catch (error) {
      setFeedback({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to resend reset code.',
      });
    } finally {
      setResendLoading(false);
    }
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

                  <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-6 text-center text-2xl font-bold">
                    {feedback?.status === 'success' ? 'Password updated' : 'Reset failed'}
                  </Text>
                  <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-3 text-center text-base leading-6">
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
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 220 }}
            automaticallyAdjustKeyboardInsets={true}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            <View className="bg-chuka-800 px-6 py-8 rounded-b-[42px] justify-center">
              <View
                pointerEvents="none"
                className="absolute -right-8 top-2 h-36 w-36 rounded-full bg-[#8fce8f]/20"
              />
              <View className="items-center">
                <BrandMark size="lg" />
                <Text className="mt-2 text-center text-xs font-semibold uppercase tracking-[0.28em] text-chuka-100">
                  Step {step} of 2
                </Text>
                <Text className="mt-3 text-center text-[26px] font-bold leading-8 text-white">
                  Reset your password
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-chuka-100">
                  Enter your email or registration number. We will send the code to your linked email.
                </Text>
              </View>
            </View>

            <View className="px-5 py-6">
              <Card className="rounded-[34px] px-6 py-6 shadow-lg">
                <View className="gap-5">
                  <Input
                    label="Email or registration number"
                    value={identifier}
                    onChangeText={setIdentifier}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="AB1/12345/25 or you@example.com"
                    onFocus={() => scrollTo(120)}
                    editable={!loading}
                  />

                  {linkedEmail ? (
                    <Card
                      style={{
                        backgroundColor: isDark ? '#0d1b11' : '#eef7ef',
                        borderColor: isDark ? '#2b5137' : '#cfe3cf',
                      }}>
                      <Text
                        style={{ color: isDark ? '#a9dcaa' : '#1e7a1e' }}
                        className="text-xs font-semibold uppercase tracking-[0.2em]">
                        Code sent
                      </Text>
                      <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-2 text-sm leading-6">
                        Use the 6-digit code sent to {linkedEmail} to complete the reset.
                      </Text>
                    </Card>
                  ) : null}

                  <Button
                    title={linkedEmail ? 'Code sent' : 'Send reset code'}
                    variant={linkedEmail ? 'secondary' : 'primary'}
                    onPress={handleSendCode}
                    loading={loading && !linkedEmail}
                    disabled={Boolean(linkedEmail) || loading}
                  />

                  {linkedEmail ? (
                    <>
                      <Input
                        label="Reset code"
                        value={enteredCode}
                        onChangeText={setEnteredCode}
                        keyboardType="number-pad"
                        placeholder="Enter the 6-digit code"
                        onFocus={() => scrollTo(280)}
                        editable={!loading}
                      />
                      <Input
                        label="New password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        placeholder="Create a new password"
                        onFocus={() => scrollTo(420)}
                        rightAccessory={
                          <Pressable onPress={() => setShowNewPassword((value) => !value)} hitSlop={12}>
                            <MaterialCommunityIcons
                              name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                              size={20}
                              color={showNewPassword ? '#1e7a1e' : '#7c8f84'}
                            />
                          </Pressable>
                        }
                      />
                      <Input
                        label="Confirm password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        placeholder="Confirm the new password"
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
                          <Text
                            style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
                            className="text-xs font-bold uppercase tracking-[0.2em]">
                            {passwordChecklist.label}
                          </Text>
                        </View>
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
                        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm leading-6">
                          {passwordChecklist.tip}
                        </Text>
                      </View>
                      <Button title="Reset password" loading={loading} onPress={handleResetPassword} disabled={loading} />
                      <Button
                        title="Resend code"
                        variant="secondary"
                        loading={resendLoading}
                        onPress={handleResendCode}
                        disabled={loading || resendLoading}
                      />
                    </>
                  ) : null}

                  <Button title="Back to login" variant="secondary" onPress={() => router.replace('/login')} disabled={loading} />
                </View>
              </Card>
            </View>
          </ScrollView>
        </FormScrollProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
