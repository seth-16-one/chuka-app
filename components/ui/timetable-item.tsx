import { Text, View } from 'react-native';

import { Badge } from './badge';
import { Card } from './card';
import { TimetableEntry } from '@/services/types';

type TimetableItemProps = {
  item: TimetableEntry;
};

export function TimetableItem({ item }: TimetableItemProps) {
  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-base font-bold text-ink">{item.title}</Text>
          <Text className="mt-1 text-sm text-chuka-700">
            {item.courseCode} - {item.lecturer}
          </Text>
        </View>
        <Badge label={item.status ?? 'upcoming'} tone={item.status === 'live' ? 'amber' : 'green'} />
      </View>
      <View className="mt-4 flex-row flex-wrap gap-3">
        <View className="rounded-2xl bg-chuka-50 px-3 py-2">
          <Text className="text-xs font-semibold text-chuka-700">{item.day}</Text>
          <Text className="text-sm font-bold text-ink">{item.time}</Text>
        </View>
        <View className="rounded-2xl bg-slate-100 px-3 py-2">
          <Text className="text-xs font-semibold text-slate-600">Venue</Text>
          <Text className="text-sm font-bold text-ink">{item.venue}</Text>
        </View>
      </View>
    </Card>
  );
}
