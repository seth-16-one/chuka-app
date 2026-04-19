import { Text, View } from 'react-native';

import { Badge } from './badge';
import { Card } from './card';
import { UserProfile } from '@/services/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ProfileSummaryProps = {
  profile: UserProfile;
};

export function ProfileSummary({ profile }: ProfileSummaryProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <Card
      className="border-chuka-700"
      style={
        isDark
          ? undefined
          : {
              backgroundColor: '#006400',
            }
      }>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="text-xs font-semibold uppercase tracking-[0.2em] text-chuka-100">
            Chuka University
          </Text>
          <Text className="mt-2 text-2xl font-bold text-white">{profile.fullName}</Text>
          <Text className="mt-1 text-sm text-chuka-50">{profile.email}</Text>
          {profile.bio ? <Text className="mt-3 text-sm leading-6 text-chuka-50">{profile.bio}</Text> : null}
        </View>
        <Badge label={profile.role} tone="green" />
      </View>
      <View className="mt-4 flex-row flex-wrap gap-3">
        {profile.regNumber ? <Badge label={profile.regNumber} tone="gray" /> : null}
        {profile.staffNumber ? <Badge label={profile.staffNumber} tone="gray" /> : null}
        {profile.department ? <Badge label={profile.department} tone="gray" /> : null}
      </View>
    </Card>
  );
}
