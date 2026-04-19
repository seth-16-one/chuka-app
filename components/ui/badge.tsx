import { Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeProps = {
  label: string;
  tone?: 'green' | 'gray' | 'amber' | 'red';
  className?: string;
};

const tones = {
  green: 'bg-chuka-100 text-chuka-800',
  gray: 'bg-[#eef2ef] text-[#4d5b53]',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
};

export function Badge({ label, tone = 'green', className }: BadgeProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const grayBg = isDark ? '#17311f' : '#eef2ef';
  const grayText = isDark ? '#d5e2d7' : '#4d5b53';

  return (
    <View
      style={tone === 'gray' ? { backgroundColor: grayBg } : undefined}
      className={cn('self-start rounded-full px-3 py-1', tones[tone], className)}>
      <Text style={tone === 'gray' ? { color: grayText } : undefined} className="text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}
