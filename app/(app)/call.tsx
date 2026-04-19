import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AppAlertModal } from '@/components/ui/app-alert-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId?: string; roomName?: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const initialMode = String((params as { mode?: string }).mode || 'video') === 'audio' ? 'audio' : 'video';
  const [mode, setMode] = useState<'video' | 'audio'>(initialMode);
  const [ending, setEnding] = useState(false);

  const roomName = useMemo(() => params.roomName || 'Campus conversation', [params.roomName]);
  const roomId = useMemo(() => params.roomId || 'direct-call', [params.roomId]);

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Calling</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Start a call</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Open this screen from chat to launch a voice or video call for the selected room.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={roomName} tone="gray" />
          <Badge label={mode === 'video' ? 'Video call' : 'Voice call'} tone="green" />
        </View>
      </View>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#32474a]">
            <MaterialCommunityIcons name={mode === 'video' ? 'video-outline' : 'phone-outline'} size={28} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
              {mode === 'video' ? 'Video' : 'Voice'} call ready
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
              Room: {roomName}
            </Text>
            <Text style={{ color: isDark ? '#b9c9c6' : '#6f7d77' }} className="mt-1 text-xs leading-5">
              Room ID: {roomId}
            </Text>
          </View>
        </View>
      </Card>

      <View className="mt-6">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-[18px] font-bold">
          Call mode
        </Text>
        <View className="mt-3 flex-row gap-3">
          <Button
            className="flex-1"
            title="Video"
            variant={mode === 'video' ? 'primary' : 'secondary'}
            onPress={() => setMode('video')}
          />
          <Button
            className="flex-1"
            title="Voice"
            variant={mode === 'audio' ? 'primary' : 'secondary'}
            onPress={() => setMode('audio')}
          />
        </View>
      </View>

      <View className="mt-6 gap-3">
        <Card
          className="rounded-[26px] px-4 py-4"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="account-group-outline" size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                WebRTC signaling
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                This screen is ready for a signaling backend to connect peer-to-peer audio and video.
              </Text>
            </View>
          </View>
        </Card>

        <Card
          className="rounded-[26px] px-4 py-4"
          style={{
            backgroundColor: isDark ? '#202a29' : '#ffffff',
            borderColor: isDark ? '#313d3b' : '#dbe4df',
          }}>
          <View className="flex-row items-start gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="shield-lock-outline" size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                Security note
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
                A backend session layer should authorize who can join the call and record the room session.
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View className="mt-6 flex-row gap-3">
        <Button className="flex-1" title="Return to chat" variant="secondary" onPress={() => router.back()} />
        <Button
          className="flex-1"
          title="End call"
          variant="danger"
          onPress={() => setEnding(true)}
        />
      </View>

      <AppAlertModal
        visible={ending}
        title="End call?"
        message="This closes the call screen. When the signaling backend is connected, it will also end the live call session."
        icon="phone-hangup"
        iconTone="warning"
        confirmLabel="End"
        confirmVariant="danger"
        onConfirm={() => {
          setEnding(false);
          router.back();
        }}
        onCancel={() => setEnding(false)}
      />
    </Screen>
  );
}
