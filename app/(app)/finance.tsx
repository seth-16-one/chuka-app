import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClientService from '@/services/api-client';
import { useAuthStore } from '@/store/auth-store';
import type { FinanceSummary } from '@/services/types';

type FinanceItem = {
  title: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Due soon';
  date: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

function formatMoney(cents: number) {
  const value = Number(cents || 0) / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FinanceScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const profile = useAuthStore((state) => state.profile);
  const [selectedTab, setSelectedTab] = useState<'Overview' | 'Payments' | 'Statements'>('Overview');
  const [summary, setSummary] = useState<FinanceSummary>({
    balanceCents: 0,
    paidCents: 0,
    dueCents: 0,
    feesCleared: true,
    statusLabel: 'Cleared',
  });

  useEffect(() => {
    let mounted = true;
    apiClientService
      .getFinanceSummary()
      .then((response) => {
        if (mounted) {
          setSummary(response.summary);
        }
      })
      .catch(() => {
        if (mounted) {
          setSummary({
            balanceCents: profile?.feeBalanceCents ?? 0,
            paidCents: 0,
            dueCents: Math.max(profile?.feeBalanceCents ?? 0, 0),
            feesCleared: profile?.feesCleared ?? (profile?.feeBalanceCents ?? 0) <= 0,
            lastPaymentAt: profile?.lastPaymentAt ?? null,
            statusLabel: profile?.feesCleared ?? (profile?.feeBalanceCents ?? 0) <= 0 ? 'Cleared' : 'Pending',
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [profile]);

  const stats = useMemo(
    () => [
      {
        label: 'Balance',
        value: formatMoney(summary.balanceCents),
        tone: '#1f5f54',
        icon: 'cash-multiple',
      },
      {
        label: 'Paid',
        value: formatMoney(summary.paidCents),
        tone: '#33447a',
        icon: 'check-decagram',
      },
      {
        label: 'Due',
        value: formatMoney(summary.dueCents),
        tone: '#6a4f2f',
        icon: 'alert-circle-outline',
      },
    ],
    [summary.balanceCents, summary.dueCents, summary.paidCents]
  );

  const payments: FinanceItem[] = useMemo(
    () => [
      {
        title: 'Tuition fee',
        amount: formatMoney(summary.balanceCents),
        status: summary.feesCleared ? 'Paid' : 'Pending',
        date: summary.lastPaymentAt ? new Date(summary.lastPaymentAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'Updated today',
        icon: 'school-outline',
      },
      {
        title: 'Library fee',
        amount: formatMoney(summary.dueCents),
        status: summary.feesCleared ? 'Paid' : 'Due soon',
        date: 'Updated today',
        icon: 'book-open-page-variant-outline',
      },
      {
        title: 'Hostel fee',
        amount: formatMoney(summary.dueCents),
        status: summary.feesCleared ? 'Paid' : 'Pending',
        date: 'Awaiting statement',
        icon: 'home-city-outline',
      },
    ],
    [summary.balanceCents, summary.dueCents, summary.feesCleared, summary.lastPaymentAt]
  );

  function handleStatementAction() {
    Alert.alert('Coming soon', 'Finance statements will be connected to your backend data next.');
  }

  return (
    <Screen>
      <View className="relative mt-8 overflow-hidden rounded-[34px] bg-chuka-800 px-6 pb-6 pt-6">
        <View pointerEvents="none" className="absolute -right-10 top-2 h-40 w-40 rounded-full bg-[#8fce8f]/20" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-chuka-100">Finance desk</Text>
        <Text className="mt-3 text-[30px] font-bold leading-[36px] text-white">Fees and statements</Text>
        <Text className="mt-3 text-sm leading-6 text-chuka-100">
          A cleaner finance view for balances, payments, and downloadable statements.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={profile?.regNumber || 'Student account'} tone="gray" />
          <Badge label="Updated live" tone="green" />
        </View>
      </View>

      <View className="mt-4 flex-row gap-3">
        {(['Overview', 'Payments', 'Statements'] as const).map((tab) => {
          const active = selectedTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setSelectedTab(tab)}
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

      <View className="mt-4 flex-row flex-wrap gap-3">
        {stats.map((item) => (
          <Card key={item.label} className="min-w-[31%] flex-1 rounded-[28px] px-4 py-4">
            <View style={{ backgroundColor: item.tone }} className="h-10 w-10 items-center justify-center rounded-full">
              <MaterialCommunityIcons
                name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                size={18}
                color="#ffffff"
              />
            </View>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-4 text-xs font-semibold uppercase tracking-[0.16em]">
              {item.label}
            </Text>
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-1 text-2xl font-bold">
              {item.value}
            </Text>
          </Card>
        ))}
      </View>

      <Card className="mt-5 rounded-[28px] px-5 py-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
              {selectedTab === 'Statements' ? 'Statements' : selectedTab === 'Payments' ? 'Payment history' : 'Account summary'}
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
              {selectedTab === 'Statements'
                ? 'Download or preview fee statements from one place.'
                : selectedTab === 'Payments'
                  ? 'Review recent payments and pending items.'
                  : 'See the financial overview for your student account.'}
            </Text>
          </View>
          <View className="rounded-full bg-chuka-100 px-3 py-1">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-chuka-800">KSh</Text>
          </View>
        </View>
      </Card>

      <View className="mt-5 gap-3">
        {payments.map((item) => (
          <Card key={item.title} className="rounded-[28px] px-5 py-5">
            <View className="flex-row items-start gap-3">
              <View
                style={{
                  backgroundColor: item.status === 'Paid' ? '#eef7ef' : item.status === 'Pending' ? '#fef4ea' : '#eef3ff',
                }}
                className="h-12 w-12 items-center justify-center rounded-[18px]">
                <MaterialCommunityIcons
                  name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                  size={20}
                  color="#006400"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center justify-between gap-3">
                  <Text className="text-base font-bold text-ink">{item.title}</Text>
                  <Badge
                    label={item.status}
                    tone={item.status === 'Paid' ? 'green' : item.status === 'Pending' ? 'gray' : 'amber'}
                  />
                </View>
                <Text className="mt-1 text-sm text-chuka-700">{item.date}</Text>
                <Text className="mt-3 text-2xl font-bold text-ink">{item.amount}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card className="mt-5 rounded-[28px] px-5 py-5">
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Quick actions
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          Keep the finance dashboard neat and student-friendly.
        </Text>
        <View className="mt-4 gap-3">
          <Button title="Download statement" onPress={handleStatementAction} />
          <Button title="View payment receipts" variant="secondary" onPress={handleStatementAction} />
          <Button title="Gatepass and cards" variant="secondary" onPress={() => router.push('/documents' as never)} />
        </View>
      </Card>
    </Screen>
  );
}
