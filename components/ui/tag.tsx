import { Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';

type TagProps = {
  label: string;
  active?: boolean;
};

export function Tag({ label, active }: TagProps) {
  return (
    <View
      className={cn(
        'rounded-full border px-3 py-2',
        active ? 'border-chuka-800 bg-chuka-800' : 'border-chuka-200 bg-white'
      )}>
      <Text className={cn('text-sm font-semibold', active ? 'text-white' : 'text-chuka-800')}>
        {label}
      </Text>
    </View>
  );
}
