import { PropsWithChildren } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardProps = PropsWithChildren<{
  className?: string;
  style?: StyleProp<ViewStyle>;
}>;

export function Card({ className, style, children }: CardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        {
          backgroundColor: isDark ? '#0d1b11' : '#ffffff',
          borderColor: isDark ? '#15301d' : '#b7e2b7',
        },
        style,
      ]}
      className={cn(
        'rounded-3xl border p-4 shadow-soft',
        className
      )}>
      {children}
    </View>
  );
}
