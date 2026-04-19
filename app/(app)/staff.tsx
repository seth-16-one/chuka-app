import { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClientService from '@/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

type StaffTab = 'Materials' | 'Announcements' | 'Timetable';

export default function StaffScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const profile = useAuthStore((state) => state.profile);
  const [activeTab, setActiveTab] = useState<StaffTab>('Materials');

  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [audience, setAudience] = useState('students');
  const [summary, setSummary] = useState('');
  const [fileLabel, setFileLabel] = useState('Material');
  const [mimeType, setMimeType] = useState('application/pdf');
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number | null;
    mimeType?: string | null;
  } | null>(null);
  const [materialLoading, setMaterialLoading] = useState(false);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementBody, setAnnouncementBody] = useState('');
  const [announcementAudience, setAnnouncementAudience] = useState('all students');
  const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'high'>('normal');
  const [announcementLoading, setAnnouncementLoading] = useState(false);

  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const [venue, setVenue] = useState('');
  const [sessionCourseCode, setSessionCourseCode] = useState('');
  const [lecturer, setLecturer] = useState(profile?.fullName || '');
  const [timetableAudience, setTimetableAudience] = useState('students');
  const [status, setStatus] = useState('upcoming');
  const [dayOrder, setDayOrder] = useState('0');
  const [timetableLoading, setTimetableLoading] = useState(false);

  const staffCards = useMemo(
    () => [
      {
        icon: 'folder-upload-outline',
        title: 'Upload materials',
        description: 'Publish lecture notes, assignments, and documents for students.',
      },
      {
        icon: 'bullhorn-outline',
        title: 'Post announcements',
        description: 'Send official notices to the whole campus or a specific audience.',
      },
      {
        icon: 'calendar-plus-outline',
        title: 'Update timetable',
        description: 'Add live classes and schedule changes from one place.',
      },
    ],
    []
  );

  async function submitMaterial() {
    try {
      if (!selectedFile) {
        Alert.alert('Choose a PDF', 'Please select a PDF file before uploading the material.');
        return;
      }

      setMaterialLoading(true);
      const fileBase64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await apiClientService.uploadStaffMaterial({
        title,
        courseCode,
        audience,
        summary,
        fileLabel,
        mimeType: selectedFile.mimeType || mimeType,
        originalFileName: selectedFile.name,
        fileSize: selectedFile.size ?? undefined,
        fileBase64,
      });

      Alert.alert('Uploaded', 'The material was saved for students.');
      setTitle('');
      setCourseCode('');
      setAudience('students');
      setSummary('');
      setFileLabel('Material');
      setMimeType('application/pdf');
      setSelectedFile(null);
    } catch (error) {
      Alert.alert('Upload failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setMaterialLoading(false);
    }
  }

  async function chooseMaterialFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const file = result.assets[0];
      setSelectedFile({
        uri: file.uri,
        name: file.name || 'material.pdf',
        size: file.size ?? null,
        mimeType: file.mimeType ?? 'application/pdf',
      });
      setFileLabel(file.name ? file.name.replace(/\.pdf$/i, '') : 'Material');
      setMimeType(file.mimeType || 'application/pdf');
    } catch (error) {
      Alert.alert('Picker failed', error instanceof Error ? error.message : 'Unable to open the file picker.');
    }
  }

  async function submitAnnouncement() {
    try {
      setAnnouncementLoading(true);
      await apiClientService.createStaffAnnouncement({
        title: announcementTitle,
        body: announcementBody,
        audience: announcementAudience,
        priority: announcementPriority,
      });

      Alert.alert('Published', 'The announcement is now available.');
      setAnnouncementTitle('');
      setAnnouncementBody('');
      setAnnouncementAudience('all students');
      setAnnouncementPriority('normal');
    } catch (error) {
      Alert.alert('Publish failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setAnnouncementLoading(false);
    }
  }

  async function submitTimetable() {
    try {
      setTimetableLoading(true);
      await apiClientService.createStaffTimetableEntry({
        audience: timetableAudience,
        day,
        time,
        title: sessionTitle,
        venue,
        courseCode: sessionCourseCode,
        lecturer: lecturer || profile?.fullName || 'Staff',
        status,
        dayOrder: Number(dayOrder || 0),
      });

      Alert.alert('Saved', 'The timetable entry has been created.');
      setDay('');
      setTime('');
      setSessionTitle('');
      setVenue('');
      setSessionCourseCode('');
      setLecturer(profile?.fullName || '');
      setTimetableAudience('students');
      setStatus('upcoming');
      setDayOrder('0');
    } catch (error) {
      Alert.alert('Save failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setTimetableLoading(false);
    }
  }

  if (profile?.role === 'student') {
    return (
      <Screen contentClassName="px-4 pt-4 pb-32">
        <Card className="mt-6 rounded-[30px] px-5 py-5">
          <Text className="text-lg font-bold text-ink">Teacher tools</Text>
          <Text className="mt-2 text-sm leading-6 text-chuka-700">
            These tools are available to teachers and administrators only.
          </Text>
          <Button className="mt-4" title="Open documents" onPress={() => router.push('/documents' as never)} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Teacher tools</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Materials, announcements, and timetable</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Upload academic content and manage staff-facing updates from one formal workspace.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={profile?.role || 'staff'} tone="green" />
          <Badge label="Backend powered" tone="gray" />
        </View>
      </View>

      <View className="mt-5 gap-3">
        {staffCards.map((item) => (
          <Card
            key={item.title}
            className="rounded-[28px] px-5 py-5"
            style={{
              backgroundColor: isDark ? '#202a29' : '#ffffff',
              borderColor: isDark ? '#313d3b' : '#dbe4df',
            }}>
            <View className="flex-row items-start gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                <MaterialCommunityIcons
                  name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={22}
                  color="#ffffff"
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                  {item.title}
                </Text>
                <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                  {item.description}
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <View className="mt-5 flex-row gap-3">
        {(['Materials', 'Announcements', 'Timetable'] as const).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                backgroundColor: active ? '#006400' : isDark ? '#0d1b11' : '#ffffff',
                borderColor: active ? '#006400' : isDark ? '#1f3b27' : '#cfe3cf',
              }}
              className="flex-1 rounded-full border px-3 py-3">
              <Text style={{ color: active ? '#ffffff' : isDark ? '#ffffff' : '#1A1A1A' }} className="text-center text-sm font-semibold">
                {tab}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'Materials' ? (
        <Card
          className="mt-4 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
              Upload materials
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
              Uploaded files are stored under the teacher folder in backend storage.
            </Text>
            <View className="mt-4 gap-4">
            <Input label="Title" value={title} onChangeText={setTitle} placeholder="Lecture notes" />
            <Input label="Course code" value={courseCode} onChangeText={setCourseCode} placeholder="CS210" />
            <Input label="Audience" value={audience} onChangeText={setAudience} placeholder="students" />
            <Input label="Summary" value={summary} onChangeText={setSummary} placeholder="Short summary" multiline />
            <Input label="File label" value={fileLabel} onChangeText={setFileLabel} placeholder="Week 3 Notes" />
            <Input label="Mime type" value={mimeType} onChangeText={setMimeType} placeholder="application/pdf" />
            <Button
              title={selectedFile ? 'Change PDF file' : 'Choose PDF file'}
              variant="secondary"
              onPress={chooseMaterialFile}
            />
            {selectedFile ? (
              <View className="rounded-[22px] bg-[#f4f8f4] px-4 py-4">
                <Text className="text-sm font-bold text-ink">{selectedFile.name}</Text>
                <Text className="mt-1 text-xs text-chuka-700">
                  {selectedFile.mimeType || 'application/pdf'}{selectedFile.size ? ` • ${Math.round(selectedFile.size / 1024)} KB` : ''}
                </Text>
              </View>
            ) : null}
            <Button title="Upload material" onPress={submitMaterial} loading={materialLoading} />
          </View>
        </Card>
      ) : null}

      {activeTab === 'Announcements' ? (
        <Card
          className="mt-4 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
            Post announcement
          </Text>
          <View className="mt-4 gap-4">
            <Input label="Title" value={announcementTitle} onChangeText={setAnnouncementTitle} placeholder="Exam notice" />
            <Input label="Body" value={announcementBody} onChangeText={setAnnouncementBody} placeholder="Details for students" multiline />
            <Input label="Audience" value={announcementAudience} onChangeText={setAnnouncementAudience} placeholder="all students" />
            <Input
              label="Priority"
              value={announcementPriority}
              onChangeText={(value) => setAnnouncementPriority(value === 'high' ? 'high' : 'normal')}
              placeholder="normal"
            />
            <Button title="Publish announcement" onPress={submitAnnouncement} loading={announcementLoading} />
          </View>
        </Card>
      ) : null}

      {activeTab === 'Timetable' ? (
        <Card
          className="mt-4 rounded-[28px] px-5 py-5"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
            Create timetable entry
          </Text>
          <View className="mt-4 gap-4">
            <Input label="Day" value={day} onChangeText={setDay} placeholder="Monday" />
            <Input label="Time" value={time} onChangeText={setTime} placeholder="08:00 AM" />
            <Input label="Title" value={sessionTitle} onChangeText={setSessionTitle} placeholder="Data Structures" />
            <Input label="Venue" value={venue} onChangeText={setVenue} placeholder="LT 2" />
            <Input label="Course code" value={sessionCourseCode} onChangeText={setSessionCourseCode} placeholder="CS210" />
            <Input label="Lecturer" value={lecturer} onChangeText={setLecturer} placeholder="Dr. ..." />
            <Input label="Audience" value={timetableAudience} onChangeText={setTimetableAudience} placeholder="students" />
            <Input label="Status" value={status} onChangeText={setStatus} placeholder="upcoming" />
            <Input label="Day order" value={dayOrder} onChangeText={setDayOrder} placeholder="0" />
            <Button title="Save timetable entry" onPress={submitTimetable} loading={timetableLoading} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}
