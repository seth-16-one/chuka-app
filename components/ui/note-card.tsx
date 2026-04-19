import { Text, View } from 'react-native';

import { Badge } from './badge';
import { Card } from './card';
import { NoteItem } from '@/services/types';

type NoteCardProps = {
  item: NoteItem;
};

export function NoteCard({ item }: NoteCardProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{item.title}</Text>
          <Text className="mt-1 text-sm text-chuka-700">
            {item.courseCode} - {item.author}
          </Text>
        </View>
        <Badge label={item.fileLabel} tone="green" />
      </View>
      <Text className="mt-3 text-sm leading-6 text-ink">{item.summary}</Text>
      <Text className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-chuka-600">
        Uploaded {item.uploadedAt}
      </Text>
    </Card>
  );
}
