import { forwardRef, type ReactNode, useRef } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

import { cn } from '@/components/utils/cn';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFormScroll } from './form-scroll-context';

type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  rightAccessory?: ReactNode;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, className, rightAccessory, onFocus, ...props },
  ref
) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const innerRef = useRef<TextInput | null>(null);
  const { scrollToInput } = useFormScroll();

  return (
    <View className="gap-2">
      {label ? <Text style={{ color: isDark ? '#ffffff' : '#10301d' }} className="text-sm font-semibold">{label}</Text> : null}
      <View
        style={{
          backgroundColor: isDark ? '#0d1b11' : '#ffffff',
          borderColor: isDark ? '#1f3b27' : '#b7e2b7',
        }}
        className={cn('min-h-12 flex-row items-center rounded-2xl border px-4', className)}>
        <TextInput
          ref={(node) => {
            innerRef.current = node;

            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          placeholderTextColor={isDark ? '#9fb4a5' : '#7d8f83'}
          className="flex-1 py-3 text-base"
          style={{ color: isDark ? '#ffffff' : '#1A1A1A' }}
          onFocus={(event) => {
            scrollToInput(innerRef.current);
            requestAnimationFrame(() => scrollToInput(innerRef.current));
            setTimeout(() => scrollToInput(innerRef.current), 90);
            onFocus?.(event);
          }}
          {...props}
        />
        {rightAccessory ? <View className="ml-3">{rightAccessory}</View> : null}
      </View>
      {hint ? <Text style={{ color: isDark ? '#d5e2d7' : '#1e7a1e' }} className="text-xs">{hint}</Text> : null}
    </View>
  );
});
