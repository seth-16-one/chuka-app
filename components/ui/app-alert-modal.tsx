import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Modal, Text, View } from 'react-native';

import { Button } from './button';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppAlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconTone?: 'success' | 'warning' | 'error' | 'info';
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  footer?: ReactNode;
  showActions?: boolean;
};

const toneColors = {
  success: '#006400',
  warning: '#b45309',
  error: '#b91c1c',
  info: '#1e7a1e',
} as const;

export function AppAlertModal({
  visible,
  title,
  message,
  icon = 'alert-circle-outline',
  iconTone = 'warning',
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
  footer,
  showActions = true,
}: AppAlertModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const tone = toneColors[iconTone];

  return (
    <Modal transparent visible={visible} animationType="fade" statusBarTranslucent>
      <View className="flex-1 items-center justify-center bg-black/45 px-5">
        <View
          style={{
            backgroundColor: isDark ? '#0d1b11' : '#ffffff',
            borderColor: isDark ? '#2b5137' : '#b7e2b7',
          }}
          className="w-full max-w-sm rounded-[34px] border px-6 py-6 shadow-soft">
          <View className="items-center">
            <View
              style={{
                backgroundColor: tone,
              }}
              className="h-16 w-16 items-center justify-center rounded-full">
              <MaterialCommunityIcons name={icon} size={32} color="#ffffff" />
            </View>

            <Text style={{ color: isDark ? '#ffffff' : '#1A1A1A' }} className="mt-5 text-center text-2xl font-bold">
              {title}
            </Text>
            <Text style={{ color: isDark ? '#d8e6db' : '#4f6655' }} className="mt-3 text-center text-base leading-6">
              {message}
            </Text>
          </View>

          {footer ? <View className="mt-5">{footer}</View> : null}

          {showActions ? (
            <View className="mt-6 gap-3">
              <Button title={confirmLabel} variant={confirmVariant} onPress={onConfirm} loading={loading} />
              {onCancel ? <Button title={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} /> : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
