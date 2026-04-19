import { Text, View } from 'react-native';

import { Button } from './button';
import { useColorScheme } from '@/hooks/use-color-scheme';

type EmptyStateProps = {
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionTitle, onAction }: EmptyStateProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={{
        backgroundColor: isDark ? '#0d1b11' : '#ffffff',
        borderColor: isDark ? '#1f3b27' : '#d7e6d7',
      }}
      className="items-center justify-center rounded-3xl border border-dashed px-6 py-10">
      <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">{title}</Text>
      <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-2 text-center text-sm leading-6">
        {description}
      </Text>
      {actionTitle ? <Button className="mt-4 self-stretch" title={actionTitle} onPress={onAction} /> : null}
    </View>
  );
}
