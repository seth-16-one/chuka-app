import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { safeStorage } from '@/services/safe-storage';
import type { DocumentType } from '@/services/types';

type UserPreferencesState = {
  preferredDocumentType: DocumentType;
  downloadDirectoryUri: string | null;
  setPreferredDocumentType: (documentType: DocumentType) => void;
  setDownloadDirectoryUri: (uri: string | null) => void;
  clearDownloadDirectoryUri: () => void;
};

export const useUserPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      preferredDocumentType: 'gatepass',
      downloadDirectoryUri: null,
      setPreferredDocumentType: (preferredDocumentType) => set({ preferredDocumentType }),
      setDownloadDirectoryUri: (downloadDirectoryUri) => set({ downloadDirectoryUri }),
      clearDownloadDirectoryUri: () => set({ downloadDirectoryUri: null }),
    }),
    {
      name: 'chuka:user-preferences',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);
