import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button } from './button';

interface OTPModalProps {
  visible: boolean;
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onCancel: () => void;
  onResend?: () => Promise<void> | void;
  loading?: boolean;
  resendLoading?: boolean;
  error?: string;
  demoOTP?: string; // For demo purposes
  title?: string;
  description?: string;
  buttonLabel?: string;
}

export function OTPModal({
  visible,
  email,
  onVerify,
  onCancel,
  onResend,
  loading = false,
  resendLoading = false,
  error,
  demoOTP,
  title = 'Verify email',
  description = 'Enter the 6-digit code we sent to',
  buttonLabel = 'Verify',
}: OTPModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [otp, setOtp] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);
  const otpInputRef = useRef<TextInput | null>(null);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animation values
  const slideAnim = useRef(new Animated.Value(visible ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    if (focusTimerRef.current) {
      clearTimeout(focusTimerRef.current);
      focusTimerRef.current = null;
    }
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = null;
    }

    if (visible) {
      // Show modal - slide up
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      setOtp('');
      setAttempts(0);
      setLocalError(null);
      requestAnimationFrame(() => {
        scrollToOtp(false);
        focusTimerRef.current = setTimeout(() => {
          otpInputRef.current?.focus();
          scrollToOtp(true);
        }, 260);
      });
    } else {
      // Hide modal - slide down
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      Keyboard.dismiss();
    }
  }, [visible, slideAnim, opacityAnim]);

  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const keyboardEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const subscription = Keyboard.addListener(keyboardEvent, () => {
      scrollToOtp(true);
    });

    return () => subscription.remove();
  }, [visible]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setLocalError('OTP must be 6 digits');
      return;
    }

    try {
      setLocalError(null);
      await onVerify(otp);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Verification failed';
      setLocalError(errorMsg);
      setAttempts((prev) => prev + 1);
      setOtp('');
    }
  };

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  if (!visible) {
    return null;
  }

  const scrollToOtp = (animated = true) => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (scrollRef.current && otpInputRef.current) {
          scrollRef.current.scrollTo({ y: 180, animated });

          scrollTimerRef.current = setTimeout(() => {
            scrollRef.current?.scrollTo({ y: 180, animated: false });
          }, 120);
        }
      });
    });
  };

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'flex-end',
          opacity: opacityAnim,
          zIndex: 999,
        },
      ]}>
      {/* Backdrop */}
      <Pressable
        onPress={onCancel}
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Modal Content */}
      <Animated.View
        style={[
          {
            transform: [{ translateY: slideTransform }],
            backgroundColor: isDark ? '#07140a' : '#F5F5F5',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingHorizontal: 24,
            paddingTop: 18,
            paddingBottom: 40,
            maxHeight: '90%',
            minHeight: '58%',
            width: '100%',
            shadowColor: '#000000',
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 18,
          },
        ]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 32 : 0}
          style={{ flex: 1 }}>
          <ScrollView
            ref={scrollRef}
            scrollEnabled
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-black/15 dark:bg-white/15" />

            {/* Close Button */}
            <View className="flex-row justify-end mb-4">
              <Pressable onPress={onCancel} hitSlop={12}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={isDark ? '#ffffff' : '#1A1A1A'}
                />
              </Pressable>
            </View>

            {/* Header */}
            <View className="mb-8">
              <Text
                style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
                className="text-2xl font-bold mb-2">
                {title}
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-sm leading-5">
                {description}{'\n'}
                <Text className="font-semibold">{email}</Text>
              </Text>
            </View>

            {/* Error Message */}
            {(error || localError) && (
              <View
                style={{
                  backgroundColor: isDark ? '#2b1818' : '#fee5e5',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                <MaterialCommunityIcons name="alert-circle" size={18} color="#c53030" />
                <Text style={{ color: '#c53030', flex: 1, fontSize: 12 }}>
                  {error || localError}
                </Text>
              </View>
            )}

            {/* Demo OTP Display (development only) */}
            {demoOTP && (
              <View
                style={{
                  backgroundColor: isDark ? '#0d1b11' : '#eef7ef',
                  borderColor: isDark ? '#2b5137' : '#cfe3cf',
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 24,
                  borderWidth: 1,
                }}>
                <Text
                  style={{ color: isDark ? '#a9dcaa' : '#1e7a1e' }}
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">
                  Demo Code
                </Text>
                <Text
                  style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
                  className="text-2xl font-bold">
                  {demoOTP}
                </Text>
              </View>
            )}

            {/* OTP Input */}
            <View className="mb-6">
              <Text
                style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">
                Verification Code
              </Text>
              <TextInput
                ref={otpInputRef}
                maxLength={6}
                keyboardType="number-pad"
                placeholder="000000"
                value={otp}
                onChangeText={setOtp}
                onFocus={() => scrollToOtp()}
                style={{
                  backgroundColor: isDark ? '#0d1b11' : '#ffffff',
                  borderColor: isDark ? '#2b5137' : '#d1d5db',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 24,
                  fontWeight: '600',
                  letterSpacing: 8,
                  color: isDark ? '#ffffff' : '#1A1A1A',
                  textAlign: 'center',
                }}
                editable={!loading}
                selectTextOnFocus
                returnKeyType="done"
              />
            </View>

            {/* Attempt Counter */}
            {attempts > 0 && (
              <Text
                style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
                className="text-xs text-center mb-6">
                Attempts: {attempts}/5
              </Text>
            )}

            {/* Verify Button */}
            <Button
              title={buttonLabel}
              loading={loading}
              onPress={handleVerify}
              disabled={otp.length !== 6 || loading}
            />

            {/* Cancel Button */}
            <View className="mt-3">
              <Button
                title="Cancel"
                variant="secondary"
                onPress={onCancel}
                disabled={loading}
              />
            </View>

            {onResend ? (
              <View className="mt-3">
                <Button
                  title="Resend code"
                  variant="secondary"
                  onPress={onResend}
                  loading={resendLoading}
                  disabled={loading || resendLoading}
                />
              </View>
            ) : null}

            {/* Info Text */}
            <Text
              style={{ color: isDark ? '#d8e6db' : '#4f6655' }}
              className="text-xs text-center mt-6 leading-5">
              Did not receive the code? Check your spam folder or try registering again.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Animated.View>
  );
}
