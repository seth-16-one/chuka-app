import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import apiClientService from '@/services/api-client';
import { buildDocumentHtml, exportDocumentPdf, getDocumentLabel } from '@/services/documents';
import type { FinanceSummary } from '@/services/types';
import { useAuthStore } from '@/store/auth-store';
import { useUserPreferencesStore } from '@/store/user-preferences-store';

function formatMoney(cents: number) {
  const value = Number(cents || 0) / 100;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DocumentsScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const profile = useAuthStore((state) => state.profile);
  const preferredDocumentType = useUserPreferencesStore((state) => state.preferredDocumentType);
  const downloadDirectoryUri = useUserPreferencesStore((state) => state.downloadDirectoryUri);
  const setPreferredDocumentType = useUserPreferencesStore((state) => state.setPreferredDocumentType);
  const setDownloadDirectoryUri = useUserPreferencesStore((state) => state.setDownloadDirectoryUri);
  const [finance, setFinance] = useState<FinanceSummary>({
    balanceCents: 0,
    paidCents: 0,
    dueCents: 0,
    feesCleared: true,
    statusLabel: 'Cleared',
  });
  const [loadingFinance, setLoadingFinance] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  const documentOptions = useMemo(
    () => [
      { value: 'gatepass' as const, label: 'Gatepass', icon: 'badge-account-outline' },
      { value: 'exam-card' as const, label: 'Exam Card', icon: 'card-account-details-outline' },
      { value: 'transcript' as const, label: 'Transcript', icon: 'file-document-outline' },
    ],
    []
  );

  const activeDocument = documentOptions.find((item) => item.value === preferredDocumentType) ?? documentOptions[0];
  const fileName =
    preferredDocumentType === 'transcript'
      ? 'transcripts.pdf'
      : `transcripts-${preferredDocumentType}.pdf`;

  const loadFinanceSummary = useCallback(async () => {
    try {
      setLoadingFinance(true);
      const response = await apiClientService.getFinanceSummary();
      setFinance(response.summary);
    } catch {
      const feeBalanceCents = profile?.feeBalanceCents ?? 0;
      const feesCleared = profile?.feesCleared ?? feeBalanceCents <= 0;
      setFinance({
        balanceCents: feeBalanceCents,
        paidCents: 0,
        dueCents: Math.max(feeBalanceCents, 0),
        feesCleared,
        lastPaymentAt: profile?.lastPaymentAt ?? null,
        statusLabel: feesCleared ? 'Cleared' : 'Pending',
      });
    } finally {
      setLoadingFinance(false);
    }
  }, [profile]);

  useEffect(() => {
    void loadFinanceSummary();
  }, [loadFinanceSummary]);

  async function chooseDownloadFolder() {
    if (Platform.OS !== 'android') {
      Alert.alert('Downloads folder', 'Android uses a Downloads folder picker. On iPhone, the file will be shared instead.');
      return;
    }

    try {
      const response = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
        FileSystem.StorageAccessFramework.getUriForDirectoryInRoot('Download')
      );

      if (!response.granted) {
        Alert.alert('Permission needed', 'Please allow access to the Downloads folder to save documents there.');
        return;
      }

      setDownloadDirectoryUri(response.directoryUri);
      setDownloadMessage('Downloads folder connected.');
      setDownloadError('');
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Unable to open the folder picker.');
    }
  }

  async function handleDownload() {
    if (!profile) {
      Alert.alert('Sign in required', 'Please sign in first.');
      return;
    }

    try {
      setDownloading(true);
      setDownloadError('');
      setDownloadMessage('');
      setSyncMessage('');
      setSyncError('');

      const html = buildDocumentHtml({
        documentType: preferredDocumentType,
        profile,
        finance,
      });

      const result = await exportDocumentPdf({
        html,
        fileName,
        androidDirectoryUri: downloadDirectoryUri,
      });

      if (Platform.OS === 'android' && result.directoryUri) {
        setDownloadDirectoryUri(result.directoryUri);
      }

      if (result.base64) {
        try {
          const estimatedSize = Math.max(0, Math.floor((result.base64.length * 3) / 4));
          await apiClientService.uploadStudentDocument({
            documentType: preferredDocumentType,
            fileName,
            mimeType: 'application/pdf',
            fileSize: estimatedSize,
            feesCleared: isCleared,
            fileBase64: result.base64,
          });
          setSyncMessage(`A copy was also stored in your student documents folder on the backend.`);
        } catch (error) {
          setSyncError(error instanceof Error ? error.message : 'Could not sync the file to the backend storage.');
        }
      }

      setDownloadMessage(
        Platform.OS === 'android'
          ? `Saved to Downloads as ${fileName}`
          : `Prepared ${fileName} for sharing.`
      );
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : 'Failed to generate the document.');
    } finally {
      setDownloading(false);
    }
  }

  const isCleared = finance.feesCleared && finance.balanceCents <= 0;

  return (
    <Screen contentClassName="px-4 pt-4 pb-32">
      <View className="overflow-hidden rounded-[34px] bg-[#304d50] px-5 pb-5 pt-5">
        <View pointerEvents="none" className="absolute -right-8 top-0 h-40 w-40 rounded-full bg-white/10" />
        <Text className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d5e5e3]">Documents</Text>
        <Text className="mt-3 text-[28px] font-bold leading-8 text-white">Gatepass and transcript downloads</Text>
        <Text className="mt-3 text-sm leading-6 text-[#d5e5e3]">
          Generate a formal gatepass, exam card, or transcript and save it to the Downloads folder on Android.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-2">
          <Badge label={activeDocument.label} tone="gray" />
          <Badge label={isCleared ? 'Cleared' : 'Balance pending'} tone={isCleared ? 'green' : 'amber'} />
        </View>
      </View>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Document type
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          Select the document you want to generate. The exported filename is prefixed with `transcripts`.
        </Text>

        <View className="mt-4 gap-3">
          {documentOptions.map((item) => {
            const active = item.value === preferredDocumentType;
            return (
              <Pressable
                key={item.value}
                onPress={() => setPreferredDocumentType(item.value)}
                style={{
                  backgroundColor: active ? '#eef7ef' : isDark ? '#17211c' : '#f8fbf8',
                  borderColor: active ? '#8fce8f' : isDark ? '#313d3b' : '#dbe4df',
                }}
                className="flex-row items-center justify-between rounded-[24px] border px-4 py-4">
                <View className="flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-[#32474a]">
                    <MaterialCommunityIcons
                      name={item.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                      size={22}
                      color="#ffffff"
                    />
                  </View>
                  <View>
                    <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
                      {item.label}
                    </Text>
                    <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm">
                      {item.value === 'gatepass'
                        ? 'Used for campus clearance.'
                        : item.value === 'exam-card'
                          ? 'Used for exams and verification.'
                          : 'Used for academic record requests.'}
                    </Text>
                  </View>
                </View>
                {active ? <Badge label="Selected" tone="green" /> : null}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Fee clearance
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          The cleared stamp appears only when there is no pending balance.
        </Text>
        <View className="mt-4 flex-row flex-wrap gap-3">
          <View className="flex-1 rounded-[22px] bg-[#eef7ef] px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-[#55705e]">Balance</Text>
            <Text className="mt-2 text-xl font-bold text-[#0f2b1f]">{formatMoney(finance.balanceCents)}</Text>
          </View>
          <View className="flex-1 rounded-[22px] bg-[#f4f8f4] px-4 py-4">
            <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-[#55705e]">Status</Text>
            <Text className="mt-2 text-xl font-bold text-[#0f2b1f]">{finance.statusLabel || 'Cleared'}</Text>
          </View>
        </View>
        <View className="mt-4 rounded-[24px] px-4 py-4" style={{ backgroundColor: isCleared ? '#edf8ef' : '#fff5ec' }}>
          <Text style={{ color: isCleared ? '#14532d' : '#7c2d12' }} className="text-sm leading-6">
            {isCleared
              ? 'Cleared stamp will be printed on the document.'
              : 'No cleared stamp will be shown until the balance is settled.'}
          </Text>
        </View>
      </Card>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Downloads
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          On Android, the file is saved to Downloads after you grant folder access. On iPhone, the file is shared instead.
        </Text>

        <View className="mt-4 gap-3">
          <Button
            title={Platform.OS === 'android' ? 'Choose Downloads folder' : 'Prepare document'}
            variant="secondary"
            onPress={chooseDownloadFolder}
          />
          <Button title={`Generate ${activeDocument.label}`} onPress={handleDownload} loading={downloading} />
        </View>

        <View className="mt-4 rounded-[24px] px-4 py-4" style={{ backgroundColor: isDark ? '#17211c' : '#f4f8f4' }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-sm leading-6">
            File name: <Text className="font-bold">{fileName}</Text>
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-2 text-xs leading-5">
            Folder: {Platform.OS === 'android' ? 'Downloads' : 'Share sheet'}
          </Text>
        </View>

        {downloadMessage ? (
          <Text style={{ color: isDark ? '#d8e6db' : '#14532d' }} className="mt-3 text-sm leading-6">
            {downloadMessage}
          </Text>
        ) : null}
        {downloadError ? (
          <Text style={{ color: '#7f1d1d' }} className="mt-3 text-sm leading-6">
            {downloadError}
          </Text>
        ) : null}
        {syncMessage ? (
          <Text style={{ color: isDark ? '#d8e6db' : '#14532d' }} className="mt-3 text-sm leading-6">
            {syncMessage}
          </Text>
        ) : null}
        {syncError ? (
          <Text style={{ color: '#7f1d1d' }} className="mt-3 text-sm leading-6">
            {syncError}
          </Text>
        ) : null}
      </Card>

      <Card
        className="mt-5 rounded-[30px] px-5 py-5"
        style={{
          backgroundColor: isDark ? '#202a29' : '#ffffff',
          borderColor: isDark ? '#313d3b' : '#dbe4df',
        }}>
        <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-lg font-bold">
          Preview
        </Text>
        <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
          This is the formal structure that gets exported into the PDF.
        </Text>

        <View className="mt-4 rounded-[28px] border border-dashed px-4 py-4" style={{ borderColor: isDark ? '#313d3b' : '#cfe3cf' }}>
          <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="text-base font-bold">
            {getDocumentLabel(preferredDocumentType)}
          </Text>
          <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-1 text-sm leading-6">
            {profile?.fullName || 'Student'} | {profile?.regNumber || 'Registration number'}
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <Badge label={isCleared ? 'CLEARED' : 'PENDING'} tone={isCleared ? 'green' : 'amber'} />
            <Badge label={loadingFinance ? 'Syncing finance' : 'Finance synced'} tone="gray" />
          </View>
        </View>
      </Card>
    </Screen>
  );
}
