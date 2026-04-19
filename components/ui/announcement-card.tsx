import { Text, View } from 'react-native';

import { Badge } from './badge';
import { Card } from './card';
import { AnnouncementItem } from '@/services/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AnnouncementCardProps = {
  item: AnnouncementItem;
};

export function AnnouncementCard({ item }: AnnouncementCardProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
            {item.title}
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
            {item.author} - {item.audience}
          </Text>
        </View>
        <Badge label={item.priority === 'high' ? 'Priority' : item.publishedAt} tone={item.priority === 'high' ? 'amber' : 'gray'} />
      </View>
      <Text style={{ color: isDark ? '#eef6ef' : '#1A1A1A' }} className="mt-3 text-sm leading-6">
        {item.body}
      </Text>
    </Card>
  );
}
