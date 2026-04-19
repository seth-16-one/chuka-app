import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { loadTimetable } from '@/services/content';
import { TimetableEntry } from '@/services/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TimetableScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    loadTimetable().then(setEntries);
  }, []);

  const days = useMemo(() => Array.from(new Set(entries.map((entry) => entry.day))), [entries]);

  useEffect(() => {
    if (!selectedDay && days.length > 0) {
      setSelectedDay(days[0]);
    }
  }, [days, selectedDay]);

  const visibleEntries = selectedDay ? entries.filter((entry) => entry.day === selectedDay) : entries;

  return (
    <Screen>
      <View className="relative mt-8 overflow-hidden rounded-[34px] bg-chuka-800 px-6 pb-6 pt-6">
        <View pointerEvents="none" className="absolute -right-10 top-2 h-40 w-40 rounded-full bg-[#8fce8f]/20" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-chuka-100">Academic planner</Text>
        <Text className="mt-3 text-[30px] font-bold leading-[36px] text-white">Schedule</Text>
        <Text className="mt-3 text-sm leading-6 text-chuka-100">
          Browse your week with quick day pills and timeline-style lesson cards.
        </Text>
      </View>

      <View className="mt-4 flex-row flex-wrap gap-2">
        {days.map((day) => {
          const active = day === selectedDay;

          return (
            <Pressable
              key={day}
              onPress={() => setSelectedDay(day)}
              style={{
                backgroundColor: active ? '#006400' : isDark ? '#0d1b11' : '#ffffff',
                borderColor: active ? '#006400' : isDark ? '#1f3b27' : '#cfe3cf',
              }}
              className="rounded-full border px-4 py-2.5">
              <Text style={{ color: active ? '#ffffff' : isDark ? '#ffffff' : '#1A1A1A' }} className="text-sm font-semibold">
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card className="mb-4 mt-4 rounded-[28px] px-5 py-5">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.22em] text-chuka-600">
              Selected day
            </Text>
            <Text className="mt-1 text-2xl font-bold text-ink">
              {selectedDay || 'Loading schedule'}
            </Text>
            <Text className="mt-1 text-sm text-chuka-700">
              {visibleEntries.length} class{visibleEntries.length === 1 ? '' : 'es'} today
            </Text>
          </View>
          <View className="rounded-[22px] bg-chuka-50 px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-700">
              Total
            </Text>
            <Text className="text-2xl font-bold text-ink">{visibleEntries.length}</Text>
          </View>
        </View>
      </Card>

      <View className="mb-3 mt-2 flex-row items-center justify-between">
        <View>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
            Timeline
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
            Lessons organized in a calmer visual rhythm.
          </Text>
        </View>
        <View className="rounded-full bg-chuka-100 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-800">Offline</Text>
        </View>
      </View>

      {visibleEntries.map((entry, index) => (
        <View key={entry.id} className="mb-4 flex-row gap-4">
          <View className="items-center">
            <View className="h-4 w-4 rounded-full bg-chuka-800" />
            {index !== visibleEntries.length - 1 ? <View className="mt-2 w-[2px] flex-1 bg-chuka-200" /> : null}
          </View>
          <Card className="flex-1 rounded-[28px] px-5 py-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-base font-bold text-ink">{entry.title}</Text>
                <Text className="mt-1 text-sm text-chuka-700">
                  {entry.courseCode} • {entry.lecturer}
                </Text>
              </View>
              <View className={`rounded-full px-3 py-1 ${entry.status === 'live' ? 'bg-amber-100' : 'bg-chuka-100'}`}>
                <Text className={`text-xs font-semibold ${entry.status === 'live' ? 'text-amber-800' : 'text-chuka-800'}`}>
                  {entry.status === 'live' ? 'Live' : 'Next'}
                </Text>
              </View>
            </View>
            <View className="mt-4 flex-row flex-wrap gap-3">
              <View className="min-w-[31%] rounded-[18px] bg-chuka-50 px-4 py-3">
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-700">Time</Text>
                <Text className="mt-1 text-sm font-bold text-ink">{entry.time}</Text>
              </View>
              <View className="min-w-[31%] rounded-[18px] bg-slate-100 px-4 py-3">
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Venue</Text>
                <Text className="mt-1 text-sm font-bold text-ink">{entry.venue}</Text>
              </View>
            </View>
            <View className="mt-4 flex-row items-center gap-2">
              <MaterialCommunityIcons name="book-education-outline" size={18} color="#006400" />
              <Text className="text-sm text-chuka-700">Prepared for quick offline lookup.</Text>
            </View>
          </Card>
        </View>
      ))}

      <Card className="mt-2 rounded-[28px] bg-chuka-50">
        <Text className="text-base font-bold text-ink">Offline ready</Text>
        <Text className="mt-2 text-sm leading-6 text-chuka-700">
          The latest timetable is cached on the device so students can check it even without data.
        </Text>
      </Card>
    </Screen>
  );
}
