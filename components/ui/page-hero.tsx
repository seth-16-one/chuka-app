import { PropsWithChildren, ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PageHeroProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  compact?: boolean;
  topContent?: ReactNode;
  className?: string;
}>;

export function PageHero({
  eyebrow,
  title,
  subtitle,
  centered = false,
  compact = false,
  topContent,
  className,
  children,
}: PageHeroProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#0a2412' : '#006400',
      }}
      className={cn('relative overflow-hidden rounded-[34px] px-6', compact ? 'py-5' : 'py-7', className)}>
      <View
        pointerEvents="none"
        style={{
          backgroundColor: isDark ? '#1b4124' : '#3a8f3a',
          opacity: isDark ? 0.55 : 0.38,
        }}
        className="absolute -top-12 right-[-42px] h-40 w-40 rounded-full blur-3xl"
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: isDark ? '#12361c' : '#8fce8f',
          opacity: isDark ? 0.45 : 0.3,
        }}
        className="absolute -bottom-12 left-[-28px] h-36 w-36 rounded-full blur-3xl"
      />
      <View className={cn(centered ? 'items-center' : 'items-start')}>
        {eyebrow ? (
          <Text className={cn('text-xs font-semibold uppercase tracking-[0.24em] text-chuka-100', compact && 'text-[10px]')}>
            {eyebrow}
          </Text>
        ) : null}
        {topContent ? <View className={cn(compact ? 'mb-2' : 'mb-4', centered ? 'items-center' : 'items-start')}>{topContent}</View> : null}
        <Text
          className={cn(
            compact ? 'mt-2 text-[24px]' : 'mt-3 text-[30px]',
            'font-bold leading-tight text-white',
            centered ? 'text-center' : 'text-left'
          )}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            className={cn(
              compact ? 'mt-2 text-sm leading-5' : 'mt-3 text-base leading-6',
              'text-chuka-100',
              centered ? 'text-center' : 'text-left'
            )}>
            {subtitle}
          </Text>
        ) : null}
        {children ? <View className={cn(compact ? 'mt-3' : 'mt-5', centered ? 'items-center' : 'items-start')}>{children}</View> : null}
      </View>
    </View>
  );
}
