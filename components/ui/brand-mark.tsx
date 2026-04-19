import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { cn } from '@/components/utils/cn';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
};

const sizes = {
  sm: { box: 'h-10 w-10', text: 'text-sm', title: 'text-base' },
  md: { box: 'h-14 w-14', text: 'text-base', title: 'text-lg' },
  lg: { box: 'h-20 w-20', text: 'text-xl', title: 'text-2xl' },
};

export function BrandMark({ size = 'md', showText = false }: BrandMarkProps) {
  const current = sizes[size];

  return (
    <View className={cn('flex-row items-center gap-3')}>
      <View className={cn('items-center justify-center overflow-hidden rounded-2xl bg-white border border-chuka-200', current.box)}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: '100%', height: '100%' }}
          contentFit="contain"
        />
      </View>
      {showText ? (
        <View>
          <Text className={cn('font-bold text-ink', current.title)}>Chuka University</Text>
          <Text className="text-xs font-semibold uppercase tracking-[0.22em] text-chuka-600">
            Student Portal
          </Text>
        </View>
      ) : null}
    </View>
  );
}
