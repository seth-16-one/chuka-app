import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-6">
      <Text className="text-center text-lg font-semibold text-ink">
        This starter route now redirects to the Chuka University experience.
      </Text>
      <Link href="/login" className="mt-4 text-chuka-800">
        Go to login
      </Link>
    </View>
  );
}
