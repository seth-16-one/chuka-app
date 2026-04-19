import { PropsWithChildren, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FormScrollProvider } from './form-scroll-context';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}>;

export function Screen({ scroll = true, className, contentClassName, children }: ScreenProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const scrollRef = useRef<ScrollView | null>(null);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: isDark ? '#07140a' : '#F5F5F5' }}
      className={cn('flex-1', className)}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 24}>
        <FormScrollProvider scrollRef={scrollRef}>
          {scroll ? (
            <ScrollView
              ref={scrollRef}
              className={cn('flex-1 px-4 pb-10 pt-8', contentClassName)}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
              automaticallyAdjustKeyboardInsets
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          ) : (
            <View className={cn('flex-1 px-4 pb-10 pt-8', contentClassName)}>{children}</View>
          )}
        </FormScrollProvider>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
