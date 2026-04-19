import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadAnnouncements, loadChatRooms, loadNotes, loadTimetable } from '@/services/content';
import { getDashboardPath } from '@/services/auth';
import { useAuthStore } from '@/store/auth-store';

const MIN_DURATION_MS = 4200;
const MAX_PROGRESS = 100;

function progressMessage(progress: number) {
  if (progress < 25) return 'Booting campus experience...';
  if (progress < 50) return 'Loading campus services...';
  if (progress < 75) return 'Syncing timetable and communication...';
  if (progress < 95) return 'Preparing your secure workspace...';
  return 'Finalizing your launch...';
}

export function SplashScreen() {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const [progress, setProgress] = useState(0);
  const [prefetchDone, setPrefetchDone] = useState(false);
  const [minimumDone, setMinimumDone] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(14)).current;
  const loaderPulse = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const particleOne = useRef(new Animated.Value(0)).current;
  const particleTwo = useRef(new Animated.Value(0)).current;
  const particleThree = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 68,
        useNativeDriver: true,
      }),
    ]).start();

    const titleTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 450);

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(loaderPulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(loaderPulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const particleLoop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(particleOne, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particleOne, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(particleTwo, {
            toValue: 1,
            duration: 3600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particleTwo, {
            toValue: 0,
            duration: 3600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(particleThree, {
            toValue: 1,
            duration: 4200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(particleThree, {
            toValue: 0,
            duration: 4200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    glowLoop.start();
    particleLoop.start();

    return () => {
      clearTimeout(titleTimer);
      pulseLoop.stop();
      glowLoop.stop();
      particleLoop.stop();
    };
  }, [glowPulse, loaderPulse, logoOpacity, logoScale, particleOne, particleThree, particleTwo, titleOpacity, titleTranslate]);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) {
        setMinimumDone(true);
      }
    }, MIN_DURATION_MS);

    Promise.all([loadChatRooms(), loadTimetable(), loadAnnouncements(), loadNotes()])
      .catch(() => {
        // Startup should remain resilient even if cached services fail.
      })
      .finally(() => {
        if (mounted) {
          setPrefetchDone(true);
        }
      });

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((current) => {
        if (current >= MAX_PROGRESS) {
          clearInterval(timer);
          return MAX_PROGRESS;
        }

        return current + 1;
      });
    }, 42);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isHydrated || !prefetchDone || !minimumDone || progress < MAX_PROGRESS || navigating) {
      return;
    }

    setNavigating(true);
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 520,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        if (session && profile) {
          router.replace(getDashboardPath(profile.role) as never);
          return;
        }

        router.replace('/login');
      }
    });
  }, [isHydrated, minimumDone, navigating, overlayOpacity, prefetchDone, profile, progress, router, session]);

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} className="flex-1 bg-[#003d1f]">
      <Animated.View style={{ flex: 1, opacity: overlayOpacity }}>
        <View className="absolute inset-0 bg-[#003d1f]" />
        <View className="absolute inset-0 bg-[#00542b]/55" />
        <View className="absolute inset-x-0 top-0 h-[42%] bg-[#002814]/70" />
        <View className="absolute inset-x-0 bottom-0 h-[38%] bg-[#0a6c34]/35" />
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: glowPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 0.36],
            }),
            transform: [
              {
                scale: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1.08],
                }),
              },
            ],
          }}
          className="absolute -top-20 right-[-60px] h-72 w-72 rounded-full bg-[#0b6d34]"
        />
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: glowPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.08, 0.16],
            }),
            transform: [
              {
                scale: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.14],
                }),
              },
            ],
          }}
          className="absolute bottom-[-80px] left-[-40px] h-80 w-80 rounded-full bg-[#1a8a42]"
        />
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: glowPulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.08, 0.18],
            }),
            transform: [
              {
                scale: glowPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1.12],
                }),
              },
            ],
          }}
          className="absolute left-[18%] top-[28%] h-56 w-56 rounded-full bg-[#4dd17f]"
        />
        <View className="absolute inset-0 bg-[#006400]/35" />

        <Animated.View
          pointerEvents="none"
          style={{
            opacity: 0.18,
            transform: [
              { translateY: particleOne.interpolate({ inputRange: [0, 1], outputRange: [0, -26] }) },
              { translateX: particleOne.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
            ],
          }}
          className="absolute left-10 top-24 h-3 w-3 rounded-full bg-white"
        />
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: 0.14,
            transform: [
              { translateY: particleTwo.interpolate({ inputRange: [0, 1], outputRange: [0, 22] }) },
              { translateX: particleTwo.interpolate({ inputRange: [0, 1], outputRange: [0, -16] }) },
            ],
          }}
          className="absolute right-16 top-40 h-2.5 w-2.5 rounded-full bg-[#c8ffd7]"
        />
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: 0.2,
            transform: [
              { translateY: particleThree.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
              { translateX: particleThree.interpolate({ inputRange: [0, 1], outputRange: [0, 14] }) },
            ],
          }}
          className="absolute bottom-36 left-20 h-4 w-4 rounded-full bg-[#e8fff0]"
        />

        <View className="flex-1 items-center justify-center px-8">
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
              shadowColor: '#9bffb3',
              shadowOpacity: 0.28,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
            }}
            className="items-center">
            <View className="h-32 w-32 overflow-hidden rounded-[32px] border border-white/20 bg-white/12 p-3">
              <Image
                source={require('../../assets/images/icon.png')}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            }}
            className="mt-8 items-center">
            <Text className="text-center text-[28px] font-bold tracking-[0.28em] text-white">
              CHUKA UNIVERSITY
            </Text>
            <Text className="mt-3 text-center text-sm leading-6 text-[#d8f7e1]">
              Advancing Knowledge, Driving Excellence
            </Text>
          </Animated.View>

          <View className="mt-14 items-center">
            <Animated.View
              style={{
                transform: [
                  {
                    scale: loaderPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.98, 1.04],
                    }),
                  },
                ],
              }}
              className="relative h-36 w-36 items-center justify-center">
              <Animated.View
                pointerEvents="none"
                style={{
                  opacity: loaderPulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.14, 0.28],
                  }),
                  transform: [
                    {
                      scale: loaderPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.94, 1.08],
                      }),
                    },
                  ],
                }}
                className="absolute inset-0 rounded-full border-2 border-[#9bffb3]"
              />
              <Animated.View
                style={{
                  height: 120,
                  width: 120,
                  borderRadius: 999,
                  borderWidth: 10,
                  borderColor: 'rgba(255,255,255,0.12)',
                  borderTopColor: '#baffc7',
                  borderRightColor: '#7df29c',
                  transform: [
                    {
                      rotate: loaderPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '180deg'],
                      }),
                    },
                  ],
                }}
              />
              <Animated.View
                style={{
                  position: 'absolute',
                  width: 108,
                  height: 108,
                  borderRadius: 999,
                  borderWidth: 4,
                  borderColor: '#54d879',
                  borderStyle: 'dashed',
                  opacity: 0.35,
                  transform: [
                    {
                      rotate: loaderPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['360deg', '180deg'],
                      }),
                    },
                  ],
                }}
              />
              <View className="absolute h-24 w-24 items-center justify-center rounded-full bg-[#003d1f]/90">
                <View className="flex-row items-end justify-center gap-1">
                  <Text className="text-[30px] font-bold text-white">{progress}</Text>
                  <Text className="mb-1 text-[16px] font-bold text-[#c8ffd7]">%</Text>
                </View>
              </View>
            </Animated.View>

            <Text className="mt-6 text-center text-base font-semibold text-white">
              Loading campus services...
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-[#d8f7e1]">
              {progressMessage(progress)}
            </Text>
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
