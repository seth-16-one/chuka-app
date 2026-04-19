import { Text } from 'react-native';

import { Card } from './card';

type StatCardProps = {
  label: string;
  value: string;
  caption?: string;
};

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <Card className="flex-1 p-4">
      <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-600">{label}</Text>
      <Text className="mt-2 text-2xl font-bold text-ink">{value}</Text>
      {caption ? <Text className="mt-1 text-sm text-chuka-700">{caption}</Text> : null}
    </Card>
  );
}
