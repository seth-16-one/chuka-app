import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-2xl font-bold text-ink">Page not found</Text>
      <Text className="mt-2 text-center text-base leading-6 text-chuka-700">
        The page you requested does not exist in the Chuka University App.
      </Text>
      <Link href="/login" asChild>
        <Button className="mt-6 w-full max-w-xs" title="Go to login" />
      </Link>
    </View>
  );
}
