import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View className={cn('mb-3 flex-row items-end justify-between gap-3', className)}>
      <View className="flex-1">
        <Text
          style={{ color: isDark ? '#a9dcaa' : '#1e7a1e' }}
          className="text-xs font-semibold uppercase tracking-[0.22em]">
          Chuka University
        </Text>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-1 text-lg font-bold">
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action}
    </View>
  );
}
