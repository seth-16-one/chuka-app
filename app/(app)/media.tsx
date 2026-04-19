import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DEFAULT_VIDEO =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const DEFAULT_AUDIO =
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

function formatTime(seconds?: number | null) {
  const value = Number(seconds || 0);
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const remainder = Math.floor(value % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export default function MediaScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [videoUrl] = useState(DEFAULT_VIDEO);
  const [audioUrl] = useState(DEFAULT_AUDIO);

  const videoPlayer = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
  });
  const audioPlayer = useAudioPlayer(audioUrl);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  const audioProgress = useMemo(() => {
    const duration = Number((audioStatus as any)?.duration || 0);
    const currentTime = Number((audioStatus as any)?.currentTime || 0);
    return { duration, currentTime };
  }, [audioStatus]);

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Media</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Video and audio hub</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Play HTTP video streams and audio clips with the built-in Expo media players.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label="HTTP streaming" tone="green" />
          <Badge label="Audio player" tone="gray" />
        </View>
      </View>

      <Card
        className="mt-5 overflow-hidden rounded-[30px] px-4 py-4"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="video-outline" size={22} color="#ffffff" />
            </View>
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                HTTP video stream
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                Built with expo-video
              </Text>
            </View>
          </View>
          <Badge label="Live ready" tone="green" />
        </View>

        <View className="mt-4 overflow-hidden rounded-[26px]" style={{ aspectRatio: 16 / 9, backgroundColor: '#000' }}>
          <VideoView player={videoPlayer} nativeControls={false} contentFit="contain" style={{ flex: 1 }} />
        </View>

        <View className="mt-4 flex-row flex-wrap gap-3">
          <Button
            className="flex-1"
            title="Play"
            onPress={() => {
              videoPlayer.play();
            }}
          />
          <Button
            className="flex-1"
            title="Pause"
            variant="secondary"
            onPress={() => {
              videoPlayer.pause();
            }}
          />
        </View>
      </Card>

      <Card
        className="mt-5 rounded-[30px] px-4 py-4"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
              <MaterialCommunityIcons name="headphones" size={22} color="#ffffff" />
            </View>
            <View>
              <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                Audio player
              </Text>
              <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="text-xs leading-5">
                Built with expo-audio
              </Text>
            </View>
          </View>
          <Badge label={`${formatTime(audioProgress.currentTime)} / ${formatTime(audioProgress.duration)}`} tone="gray" />
        </View>

        <View className="mt-4 rounded-[26px] px-4 py-4" style={{ backgroundColor: isDark ? '#17211c' : '#f4f8f4' }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-sm leading-6">
            Use this player for lecture audio, voice notes, or live audio streams.
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-3">
          <Button
            className="flex-1"
            title="Play"
            onPress={() => {
              audioPlayer.play();
            }}
          />
          <Button
            className="flex-1"
            title="Pause"
            variant="secondary"
            onPress={() => {
              audioPlayer.pause();
            }}
          />
          <Button
            className="flex-1"
            title="Restart"
            variant="secondary"
            onPress={() => {
              audioPlayer.seekTo(0);
              audioPlayer.play();
            }}
          />
        </View>
      </Card>

      <Card
        className="mt-5 rounded-[30px] px-4 py-4"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
            <MaterialCommunityIcons name="web" size={22} color="#ffffff" />
          </View>
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
              WebRTC call ready
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
              The chat call button opens the live call screen. A backend signaling service can be connected there next.
            </Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
