import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginFeedbackScreen() {
  const router = useRouter();
  const { status = 'success', next = '/dashboard', message } = useLocalSearchParams<{
    status?: 'success' | 'error';
    next?: string;
    message?: string;
  }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const nextRoute = typeof next === 'string' && next.startsWith('/') ? next : '/dashboard';
  const scale = useRef(new Animated.Value(0.82)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 75,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

    const ringLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 0,
          duration: 900,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    entrance.start();
    ringLoop.start();
    pulseLoop.start();

    return () => {
      ringLoop.stop();
      pulseLoop.stop();
    };
  }, [opacity, pulse, ring, scale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'success') {
        router.replace(nextRoute as never);
      } else {
        router.replace('/login');
      }
    }, status === 'success' ? 1400 : 1800);

    return () => clearTimeout(timer);
  }, [nextRoute, router, status]);

  const success = status === 'success';
  const failureMessage = message ?? 'Your details were not accepted. Please check them and try again.';
  const panelBg = success ? (isDark ? '#0d1b11' : '#eef7ef') : isDark ? '#2a1111' : '#fff0f0';
  const panelBorder = success ? (isDark ? '#2b5137' : '#b7e2b7') : isDark ? '#6e2c2c' : '#f3bcbc';
  const accent = success ? '#006400' : '#b91c1c';

  return (
    <Screen className="bg-surface" scroll={false}>
      <View className="flex-1 items-center justify-center px-5">
        <Animated.View
          style={{
            opacity,
            transform: [
              { scale },
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
              backgroundColor: panelBg,
              borderColor: panelBorder,
            }}
            className="overflow-hidden rounded-[34px] border px-6 py-8 shadow-soft">
            <View className="items-center">
              <View className="relative h-40 w-40 items-center justify-center">
                <Animated.View
                  pointerEvents="none"
                  style={{
                    opacity: ring.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.22, 0],
                    }),
                    transform: [
                      {
                        scale: ring.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.94, 1.22],
                        }),
                      },
                    ],
                    backgroundColor: accent,
                  }}
                  className="absolute h-40 w-40 rounded-full"
                />
                <Animated.View
                  style={{
                    width: 124,
                    height: 124,
                    borderRadius: 999,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: accent,
                    shadowColor: accent,
                    shadowOpacity: 0.24,
                    shadowRadius: 18,
                    shadowOffset: { width: 0, height: 8 },
                    transform: [
                      {
                        scale: pulse.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.98, 1.04],
                        }),
                      },
                    ],
                  }}>
                  <MaterialCommunityIcons name={success ? 'check' : 'close'} size={64} color="#ffffff" />
                </Animated.View>
              </View>

              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-6 text-center text-2xl font-bold">
                {success ? 'Login successful' : 'Login failed'}
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-3 text-center text-base leading-6">
                {success ? 'Preparing your dashboard and campus data.' : failureMessage}
              </Text>

              {success ? (
                <View className="mt-6 items-center">
                  <Text
                    style={{ color: isDark ? '#a9dcaa' : '#1e7a1e' }}
                    className="text-center text-xs font-semibold uppercase tracking-[0.22em]">
                    Opening portal
                  </Text>
                  <View
                    style={{
                      backgroundColor: isDark ? '#17311f' : '#d9eadb',
                    }}
                    className="mt-4 h-1.5 w-24 overflow-hidden rounded-full">
                    <Animated.View
                      style={{
                        backgroundColor: accent,
                        height: '100%',
                        width: '100%',
                        transform: [
                          {
                            scaleX: ring.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.35, 1],
                            }),
                          },
                        ],
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View className="mt-6 w-full gap-3">
                  <Button title="Back to login" onPress={() => router.replace('/login')} />
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}
