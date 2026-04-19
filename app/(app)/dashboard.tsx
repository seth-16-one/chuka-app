import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loadAnnouncements, loadChatRooms, loadTimetable } from '@/services/content';
import { AnnouncementItem, ChatRoom, TimetableEntry } from '@/services/types';
import { useAuthStore } from '@/store/auth-store';

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date) {
  return date.toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getInitials(name?: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return 'CU';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const profile = useAuthStore((state) => state.profile);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);

  useEffect(() => {
    loadAnnouncements().then(setAnnouncements);
    loadChatRooms().then(setRooms);
    loadTimetable().then(setTimetable);
  }, []);

  const firstName = useMemo(() => profile?.fullName?.split(' ')[0] || 'Student', [profile?.fullName]);
  const roleLabel = useMemo(() => {
    if (profile?.role === 'admin') return 'ADMIN';
    if (profile?.role === 'lecturer') return 'LECTURER';
    return 'STUDENT';
  }, [profile?.role]);

  const current = useMemo(() => new Date(), []);
  const appVersion = Constants.expoConfig?.version || '1.0.1';
  const classLabel = profile?.regNumber || profile?.staffNumber || profile?.department || 'Class 5';
  const nextEntry = timetable[0];
  const topAnnouncement = announcements[0];
  const attentionItems = [
    {
      title: nextEntry ? 'Your next class is ready.' : 'No exam scheduled yet.',
      description: nextEntry
        ? `${nextEntry.title} • ${nextEntry.time} • ${nextEntry.venue}`
        : 'Check back after lecturers publish the timetable.',
      icon: nextEntry ? 'calendar-clock' : 'calendar-remove',
      href: '/timetable',
    },
    {
      title: topAnnouncement ? topAnnouncement.title : 'No urgent alerts right now.',
      description: topAnnouncement
        ? topAnnouncement.body
        : 'Announcements and campus notices will appear here.',
      icon: 'bell-alert-outline',
      href: '/announcements',
    },
  ] as const;

  const quickActions = [
    {
      title: 'Assignments',
      subtitle: 'On track',
      icon: 'clipboard-text-outline',
      tint: '#33447a',
      href: '/notes',
    },
    {
      title: 'Attendance',
      subtitle: '92%',
      icon: 'calendar-check-outline',
      tint: '#1f5f54',
      href: '/timetable',
    },
    {
      title: 'Materials',
      subtitle: `${Math.max(announcements.length, 0)} items`,
      icon: 'book-open-page-variant-outline',
      tint: '#5a4638',
      href: '/notes',
    },
    {
      title: 'Exams',
      subtitle: `${Math.max(timetable.length, 0)} upcoming`,
      icon: 'file-check-outline',
      tint: '#2d5566',
      href: '/timetable',
    },
    {
      title: 'Live Classes',
      subtitle: `${Math.max(rooms.filter((room) => room.isOnline).length, 1)} scheduled`,
      icon: 'video-outline',
      tint: '#2b395a',
      href: '/media',
    },
    {
      title: 'Results',
      subtitle: '0 records',
      icon: 'chart-bar',
      tint: '#483c77',
      href: '/announcements',
    },
    {
      title: 'Finance',
      subtitle: 'Fees',
      icon: 'wallet-outline',
      tint: '#6a4f2f',
      href: '/finance',
    },
    {
      title: 'Documents',
      subtitle: 'Gatepass',
      icon: 'file-document-outline',
      tint: '#33447a',
      href: '/documents',
    },
    {
      title: 'Announcements',
      subtitle: `${announcements.length} alerts`,
      icon: 'bullhorn-outline',
      tint: '#553b50',
      href: '/announcements',
    },
    {
      title: 'AI Assistant',
      subtitle: 'Study help',
      icon: 'star-four-points',
      tint: '#1d5f5f',
      href: '/chat',
    },
  ] as const;

  const suggestedCards = [
    {
      label: topAnnouncement?.audience || 'University',
      title: topAnnouncement?.title || 'Campus update',
      body: topAnnouncement?.body || 'Everything you need for the day is organized here.',
      href: '/announcements',
      accent: '#2b6d63',
    },
    {
      label: nextEntry?.status === 'live' ? 'Live now' : 'Suggested',
      title: nextEntry?.title || 'Next class',
      body: nextEntry
        ? `${nextEntry.courseCode} • ${nextEntry.lecturer} • ${nextEntry.venue}`
        : 'Jump into timetable, chat, or notes to continue your academic flow.',
      href: '/timetable',
      accent: '#576a2f',
    },
  ] as const;

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View
          pointerEvents="none"
          className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10"
        />
        <View
          pointerEvents="none"
          className="absolute -left-6 bottom-[-40px] h-32 w-32 rounded-full bg-black/10"
        />

        <View className="flex-row items-start gap-4">
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#111f22]/50 bg-[#7f9c9b]">
            {profile?.avatarUrl ? (
            <MaterialCommunityIcons name="account" size={28} color="#ffffff" />
            ) : (
              <Text className="text-lg font-bold text-white">{getInitials(profile?.fullName)}</Text>
            )}
          </View>

          <View className="flex-1 pt-1">
              <Text style={{ color: '#ffffff' }} className="text-[26px] font-bold leading-8">
                Good {current.getHours() < 12 ? 'morning' : current.getHours() < 18 ? 'afternoon' : 'evening'}, {firstName}
              </Text>
            <Text style={{ color: '#d5e5e3' }} className="mt-2 text-sm leading-6">
              {formatDate(current)} | {formatClock(current)}
            </Text>
            <Text style={{ color: '#d5e5e3' }} className="mt-1 text-sm leading-6">
              Class: {classLabel} | Roll No: {profile?.regNumber || profile?.staffNumber || 'N/A'}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <Badge label={`${appVersion} - ${roleLabel} | ${appVersion}`} tone="gray" />
            </View>
          </View>

          <View className="h-14 w-14 items-center justify-center rounded-full bg-white/12">
            <MaterialCommunityIcons name="weather-night" size={24} color="#ffffff" />
          </View>
        </View>
      </View>

      <View className="mt-5">
        <Card
          className="overflow-hidden rounded-[30px] p-0"
          style={{
            backgroundColor: isDark ? '#1e2624' : '#ffffff',
            borderColor: isDark ? '#32403d' : '#d7dfdb',
          }}>
          <View className="min-h-[190px] justify-between px-5 py-5">
            <View className="flex-row items-start justify-between gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-[18px] bg-white/18">
                <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#ffffff" />
              </View>
              <View className="rounded-full bg-white/20 px-4 py-2">
                <Text className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                  {nextEntry ? nextEntry.status === 'live' ? 'Live now' : 'No exam' : 'No exam'}
                </Text>
              </View>
            </View>

            <View className="max-w-[75%]">
              <Text style={{ color: '#ffffff' }} className="text-[28px] font-bold leading-9">
                {nextEntry ? 'Upcoming Classes' : 'Upcoming Exams'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }} className="mt-3 text-sm leading-6">
                {nextEntry
                  ? `${nextEntry.title} is next on ${nextEntry.day} at ${nextEntry.time}.`
                  : 'No exams are scheduled yet. Check back after lecturers publish them.'}
              </Text>
            </View>

            <View className="rounded-[22px] bg-black/18 px-4 py-4">
              <Text style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm leading-6">
                {nextEntry
                  ? `${nextEntry.courseCode} | ${nextEntry.lecturer} | ${nextEntry.venue}`
                  : 'Stay tuned for timetable updates and class announcements.'}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#e9efed' : '#1A1A1A' }} className="text-[18px] font-bold">
          Attention Center
        </Text>
        <View className="mt-3 gap-3">
          {attentionItems.map((item) => (
            <Pressable key={item.title} onPress={() => router.push(item.href as never)}>
              <Card
                className="rounded-[24px] px-4 py-4"
                style={{
                  backgroundColor: isDark ? '#202a29' : '#ffffff',
                  borderColor: isDark ? '#313d3b' : '#dbe4df',
                }}>
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                    <MaterialCommunityIcons name={item.icon as any} size={22} color="#c9dfdb" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                      {item.title}
                    </Text>
                    <Text style={{ color: isDark ? '#b9c9c6' : '#5b6a64' }} className="mt-1 text-sm leading-5">
                      {item.description}
                    </Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={22} color={isDark ? '#d8e6e2' : '#5b6a64'} />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#e9efed' : '#1A1A1A' }} className="text-[18px] font-bold">
          Quick Access
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between gap-y-4">
          {quickActions.map((action) => (
            <Pressable
              key={action.title}
              onPress={() => router.push(action.href as never)}
              className="w-[48%]">
              <View className="overflow-hidden rounded-[28px] bg-transparent">
                <View
                  style={{ backgroundColor: action.tint }}
                  className="h-[94px] items-center justify-center rounded-[28px]">
                  <MaterialCommunityIcons name={action.icon as any} size={22} color="#ffffff" />
                </View>
                <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-3 text-[15px] font-bold">
                  {action.title}
                </Text>
                <Text style={{ color: isDark ? '#c5d1ce' : '#5b6a64' }} className="mt-1 text-xs">
                  {action.subtitle}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mt-7">
        <Text style={{ color: isDark ? '#e9efed' : '#1A1A1A' }} className="text-[18px] font-bold">
          Suggested For You
        </Text>
        <View className="mt-3 gap-4">
          {suggestedCards.map((card) => (
            <Pressable key={card.title} onPress={() => router.push(card.href as never)}>
              <Card
                className="rounded-[28px] overflow-hidden px-0 py-0"
                style={{
                  backgroundColor: isDark ? '#202634' : '#ffffff',
                  borderColor: isDark ? '#30384a' : '#dbe4df',
                }}>
                <View
                  className="min-h-[180px] justify-between px-5 py-5"
                  style={{
                    backgroundColor: card.accent,
                  }}>
                  <View className="flex-row items-start justify-between">
                    <View className="h-12 w-12 items-center justify-center rounded-full bg-white/18">
                      <MaterialCommunityIcons name="book-open-variant" size={18} color="#ffffff" />
                    </View>
                    <View className="rounded-full bg-white/18 px-4 py-2">
                      <Text className="text-xs font-bold text-white">{card.label}</Text>
                    </View>
                  </View>

                  <View>
                    <Text style={{ color: '#ffffff' }} className="text-[26px] font-bold leading-8">
                      {card.title}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.85)' }} className="mt-3 text-sm leading-6">
                      {card.body}
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}
