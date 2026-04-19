import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { cn } from '@/components/utils/cn';
import { ChatMessage } from '@/services/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

type MessageBubbleProps = {
  message: ChatMessage;
};

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View
      style={{
        backgroundColor: message.isMine
          ? '#006400'
          : isDark
            ? '#0d1b11'
            : '#ffffff',
        borderColor: message.isMine
          ? '#0a7a1f'
          : isDark
            ? '#1f3b27'
            : '#d7e6d7',
      }}
      className={cn('mb-3 max-w-[84%] rounded-3xl border px-4 py-3', message.isMine ? 'ml-auto' : 'ml-0')}>
      <Text className={cn('text-sm font-semibold', message.isMine ? 'text-white' : isDark ? 'text-white' : 'text-chuka-900')}>
        {message.senderName}
      </Text>
      <Text className={cn('mt-1 text-base', message.isMine ? 'text-chuka-50' : isDark ? 'text-chuka-50' : 'text-ink')}>
        {message.message}
      </Text>
      <View className="mt-2 flex-row items-center justify-between gap-2">
        <Text className={cn('text-[10px] font-semibold uppercase tracking-[0.18em]', message.isMine ? 'text-chuka-100' : isDark ? 'text-chuka-200' : 'text-chuka-600')}>
          {formatMessageTime(message.createdAt)}
        </Text>
        {message.isMine ? (
          <View className="flex-row items-center gap-1">
            <MaterialCommunityIcons
              name={message.isRead ? 'check-all' : 'check'}
              size={14}
              color={message.isRead ? '#d9f0d9' : '#c6e6c6'}
            />
            <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-chuka-100">
              {message.isRead ? 'Read' : 'Sent'}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
