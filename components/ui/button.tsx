import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
  className?: string;
  textClassName?: string;
  left?: ReactNode;
  right?: ReactNode;
  disabled?: boolean;
};

const variants = {
  primary: 'bg-chuka-800',
  secondary: 'bg-white border border-chuka-300',
  ghost: 'bg-transparent',
  danger: 'bg-red-600',
};

const textVariants = {
  primary: 'text-white',
  secondary: 'text-chuka-800',
  ghost: 'text-chuka-800',
  danger: 'text-white',
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  className,
  textClassName,
  left,
  right,
  disabled,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const secondaryBg = isDark ? '#15301d' : '#ffffff';
  const secondaryText = isDark ? '#ffffff' : '#006400';
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isDisabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }).start();
    }
  }, [isDisabled, scale]);

  function animateTo(value: number) {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      friction: 7,
      tension: 140,
    }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        disabled={isDisabled}
        className={cn(
          'min-h-12 flex-row items-center justify-center rounded-2xl px-4 py-3 active:opacity-90',
          variants[variant],
          isDisabled && 'opacity-60',
          className
        )}
        style={
          variant === 'secondary'
            ? {
                backgroundColor: secondaryBg,
                borderColor: isDark ? '#2b5137' : '#b7e2b7',
                elevation: 2,
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
              }
            : {
                elevation: 6,
                shadowColor: '#000',
                shadowOpacity: 0.14,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
              }
        }>
        {loading ? <ActivityIndicator color={variant === 'secondary' ? '#006400' : '#ffffff'} /> : null}
        {!loading && left ? <View className="mr-2">{left}</View> : null}
        {!loading ? (
          <Text
            style={variant === 'secondary' ? { color: secondaryText } : undefined}
            className={cn('text-base font-semibold', textVariants[variant], textClassName)}>
            {title}
          </Text>
        ) : null}
        {!loading && right ? <View className="ml-2">{right}</View> : null}
      </Pressable>
    </Animated.View>
  );
}
