import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { loadNotes } from '@/services/content';
import { NoteItem } from '@/services/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotesScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [items, setItems] = useState<NoteItem[]>([]);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState<'Subjects' | 'Homework' | 'Library'>('Subjects');

  useEffect(() => {
    loadNotes().then(setItems);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === 'Homework') {
      return items.slice(0, 1);
    }

    if (activeTab === 'Library') {
      return items.slice(1);
    }

    return items;
  }, [activeTab, items]);

  function handleShareNote() {
    if (!title || !courseCode || !summary) {
      Alert.alert('Missing details', 'Please fill in the note title, course code, and summary.');
      return;
    }

    setItems((current) => [
      {
        id: `local-${Date.now()}`,
        title,
        courseCode,
        author: 'You',
        summary,
        fileLabel: 'Shared note',
        uploadedAt: 'Just now',
      },
      ...current,
    ]);

    setTitle('');
    setCourseCode('');
    setSummary('');
  }

  return (
    <Screen>
      <View className="relative mt-8 overflow-hidden rounded-[34px] bg-chuka-800 px-6 pb-6 pt-6">
        <View pointerEvents="none" className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-[#8fce8f]/20" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-chuka-100">Study hub</Text>
        <Text className="mt-3 text-[30px] font-bold leading-[36px] text-white">Notes, homework, and library picks</Text>
        <Text className="mt-3 text-sm leading-6 text-chuka-100">
          A cleaner academic workspace inspired by the new app-kit layouts you shared.
        </Text>
      </View>

      <View className="mt-4 flex-row gap-3">
        {(['Subjects', 'Homework', 'Library'] as const).map((tab) => {
          const active = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: active ? '#006400' : isDark ? '#0d1b11' : '#ffffff',
                borderColor: active ? '#006400' : isDark ? '#1f3b27' : '#cfe3cf',
              }}
              className="flex-1 rounded-full border px-4 py-3">
              <Text style={{ color: active ? '#ffffff' : isDark ? '#ffffff' : '#1A1A1A' }} className="text-center text-sm font-semibold">
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card className="mt-4 rounded-[28px] px-5 py-5">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Share quick revision content
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-2 text-sm leading-6">
          Add a lightweight note now and extend it later to files, PDFs, and attachments.
        </Text>
        <View className="mt-5 gap-4">
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Revision notes" />
          <Input label="Course code" value={courseCode} onChangeText={setCourseCode} placeholder="CS210" />
          <Input label="Summary" value={summary} onChangeText={setSummary} placeholder="Short description of the note" multiline />
          <Button title="Share note" onPress={handleShareNote} />
        </View>
      </Card>

      <View className="mt-6 flex-row items-center justify-between">
        <View>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
            {activeTab}
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
            Curated academic content with a lighter, more visual card rhythm.
          </Text>
        </View>
        <View className="rounded-full bg-chuka-100 px-3 py-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-800">
            {filteredItems.length} items
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-3">
        {filteredItems.map((item, index) => (
          <View key={item.id}>
            <Card className="rounded-[28px] px-5 py-5">
              <View className="flex-row items-start justify-between gap-3">
                <View
                  style={{
                    backgroundColor: index % 3 === 0 ? '#eef7ef' : index % 3 === 1 ? '#f3efff' : '#fef4ea',
                  }}
                  className="h-14 w-14 items-center justify-center rounded-[18px]">
                  <MaterialCommunityIcons
                    name={activeTab === 'Homework' ? 'clipboard-text-outline' : activeTab === 'Library' ? 'bookshelf' : 'book-open-page-variant-outline'}
                    size={24}
                    color="#006400"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-ink">{item.title}</Text>
                  <Text className="mt-1 text-sm text-chuka-700">{item.courseCode} | {item.author}</Text>
                  <Text className="mt-3 text-sm leading-6 text-ink">{item.summary}</Text>
                </View>
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                <View className="rounded-full bg-chuka-100 px-3 py-1">
                  <Text className="text-xs font-semibold text-chuka-800">{item.fileLabel}</Text>
                </View>
                <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-600">
                  {item.uploadedAt}
                </Text>
              </View>
            </Card>
          </View>
        ))}
      </View>
    </Screen>
  );
}

