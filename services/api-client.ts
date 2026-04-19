import Constants from 'expo-constants';
import { clearAuthTokens, loadAuthTokens, saveAuthTokens } from './auth-token-storage';
import { safeStorage } from './safe-storage';
import { loadUserSession } from './session-storage';
import type { DeviceSession, FinanceSummary, StaffMaterial } from './types';

const EXPO_EXTRA = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  EXPO_EXTRA.apiBaseUrl ||
  'https://chuka-backend.sethtech.deno.net/api';

function normalizeApiBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.replace(/\/+$/, '');
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
}

const AUTH_API_BASE_URL = normalizeApiBaseUrl(API_BASE_URL);

type RequestMethod = 'GET' | 'POST' | 'PUT';

class APIClient {
  async getStoredAuthToken(): Promise<string | null> {
    const tokens = await loadAuthTokens();
    if (tokens?.accessToken) {
      return tokens.accessToken;
    }

    const storedSession = await loadUserSession();
    const sessionToken = storedSession?.session?.access_token || null;
    if (sessionToken) {
      return sessionToken;
    }

    const legacyToken = await safeStorage.getItem('auth_token');
    if (!legacyToken) {
      return null;
    }

    await saveAuthTokens({ accessToken: legacyToken, refreshToken: legacyToken });
    await safeStorage.removeItem('auth_token');
    return legacyToken;
  }

  private async refreshAuthToken(): Promise<string | null> {
    const tokens = await loadAuthTokens();
    const refreshToken = tokens?.refreshToken;
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${AUTH_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data?.token !== 'string') {
      return null;
    }

    await saveAuthTokens({
      accessToken: data.token,
      refreshToken: typeof data.refreshToken === 'string' ? data.refreshToken : refreshToken,
    });

    return data.token;
  }

  private async request<T>(
    path: string,
    options: {
      method?: RequestMethod;
      body?: Record<string, unknown>;
      params?: Record<string, string | number | undefined>;
      timeoutMs?: number;
    } = {},
    allowRetry: boolean = true
  ): Promise<T> {
    const token = await this.getStoredAuthToken();
    const url = new URL(`${AUTH_API_BASE_URL}${path}`);
    const controller = new AbortController();
    const timeoutMs = options.timeoutMs ?? 10000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    Object.entries(options.params ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    try {
      const response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          if (allowRetry) {
            const refreshed = await this.refreshAuthToken();
            if (refreshed) {
              return this.request<T>(path, options, false);
            }
          }

          await clearAuthTokens();
        }

        const message =
          typeof data?.error === 'string'
            ? data.error
            : typeof data?.message === 'string'
              ? data.message
              : `Request failed with status ${response.status}`;
        throw new Error(message);
      }

      return data as T;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error('Request timed out. Please check your connection and try again.');
      }

      const apiHost = AUTH_API_BASE_URL.replace(/\/api\/?$/, '');
      throw new Error(
        error instanceof Error
          ? error.message
          : `Network error. The app could not reach the backend at ${apiHost}. Please confirm the backend is live, then restart Expo.`
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async sendOTP(
    email: string,
    purpose: 'registration' | 'password_reset' | 'login' = 'registration'
  ): Promise<{ success: boolean; challengeId: string; expiresInMinutes: number; message: string; otpCode?: string }> {
    return this.request('/otp/request', {
      method: 'POST',
      body: { email, purpose },
      timeoutMs: 10000,
    });
  }

  async verifyOTP(
    email: string,
    challengeId: string,
    code: string,
    purpose: 'registration' | 'password_reset' | 'login' = 'registration'
  ): Promise<{ success: boolean; verified: boolean }> {
    return this.request('/otp/verify', {
      method: 'POST',
      body: { email, challengeId, code, purpose },
      timeoutMs: 10000,
    });
  }

  async requestLoginOtp(
    usernameOrEmail: string,
    password: string,
    expectedRole?: string,
    channel: string = 'email'
  ): Promise<{
    success: boolean;
    challengeId: string;
    email: string;
    channel: string;
    availableChannels?: string[];
    destinationMasked?: string;
    expiresInMinutes: number;
    message: string;
    otpCode?: string;
  }> {
    return this.request('/login-otp/request', {
      method: 'POST',
      body: {
        usernameOrEmail,
        username: usernameOrEmail,
        password,
        expectedRole,
        channel,
      },
      timeoutMs: 10000,
    });
  }

  async verifyLoginOtp(
    challengeId: string,
    code: string
  ): Promise<{ token: string; refreshToken: string; user: any }> {
    const data = await this.request<{ token: string; refreshToken: string; user: any }>('/login-otp/verify', {
      method: 'POST',
      body: { challengeId, code },
      timeoutMs: 10000,
    });

    if (data.token) {
      await saveAuthTokens({ accessToken: data.token, refreshToken: data.refreshToken || data.token });
    }

    return data;
  }

  async register(
    email: string,
    password: string,
    fullName: string,
    regNumber: string,
    role: 'student' | 'lecturer' | 'admin' = 'student',
    department?: string,
    challengeId?: string,
    otpCode?: string
  ): Promise<{ user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: {
        email,
        password,
        fullName,
        regNumber,
        role,
        department,
        challengeId,
        otpCode,
      },
    });
  }

  async login(
    identifier: string,
    password: string
  ): Promise<{ token: string; refreshToken: string; user: any }> {
    const data = await this.request<{ token: string; refreshToken: string; user: any }>('/login', {
      method: 'POST',
      body: { identifier, password },
    });

    if (data.token) {
      await saveAuthTokens({ accessToken: data.token, refreshToken: data.refreshToken || data.token });
    }

    return data;
  }

  async requestPasswordReset(
    identifier: string
  ): Promise<{ success: boolean; challengeId: string; email: string; expiresInMinutes: number; message: string }> {
    return this.request('/auth/password-reset/request', {
      method: 'POST',
      body: { identifier },
    });
  }

  async confirmPasswordReset(
    email: string,
    challengeId: string,
    otpCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request('/auth/password-reset/confirm', {
      method: 'POST',
      body: { email, challengeId, otpCode, newPassword },
    });
  }

  async getCurrentUser(): Promise<{ user: any }> {
    return this.request('/auth/me');
  }

  async getFinanceSummary(): Promise<{ summary: FinanceSummary }> {
    return this.request('/finance/summary');
  }

  async listStaffMaterials(): Promise<{ materials: StaffMaterial[] }> {
    return this.request('/staff/materials');
  }

  async uploadStaffMaterial(payload: {
    title: string;
    courseCode: string;
    audience: string;
    summary: string;
    fileLabel: string;
    storagePath?: string;
    mimeType?: string;
    originalFileName?: string;
    fileSize?: number;
    fileBase64?: string;
  }): Promise<{ material: StaffMaterial }> {
    return this.request('/staff/materials', {
      method: 'POST',
      body: payload,
    });
  }

  async uploadStudentDocument(payload: {
    documentType: 'gatepass' | 'exam-card' | 'transcript';
    fileName: string;
    mimeType?: string;
    fileSize?: number;
    feesCleared: boolean;
    fileBase64: string;
  }): Promise<{ document: any }> {
    return this.request('/student/documents', {
      method: 'POST',
      body: payload,
    });
  }

  async listStudentDocuments(): Promise<{ documents: any[] }> {
    return this.request('/student/documents');
  }

  async createStaffAnnouncement(payload: {
    title: string;
    body: string;
    audience: string;
    priority?: 'normal' | 'high';
  }): Promise<{ announcement: any }> {
    return this.request('/staff/announcements', {
      method: 'POST',
      body: payload,
    });
  }

  async createStaffTimetableEntry(payload: {
    audience: string;
    day: string;
    time: string;
    title: string;
    venue: string;
    courseCode: string;
    lecturer?: string;
    status?: string;
    dayOrder?: number;
  }): Promise<{ timetableEntry: any }> {
    return this.request('/staff/timetable', {
      method: 'POST',
      body: payload,
    });
  }

  async updateProfile(updates: {
    phone?: string;
    bio?: string;
    department?: string;
    fullName?: string;
  }): Promise<{ user: any }> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: updates,
    });
  }

  async logout(): Promise<void> {
    await clearAuthTokens();
  }

  async getDeviceSessions(): Promise<{ sessions: DeviceSession[] }> {
    return this.request('/auth/sessions');
  }

  async revokeDeviceSession(sessionId: string): Promise<{ success: boolean }> {
    return this.request(`/auth/sessions/${sessionId}/revoke`, {
      method: 'POST',
    });
  }

  async revokeOtherDeviceSessions(): Promise<{ success: boolean }> {
    return this.request('/auth/sessions/revoke-others', {
      method: 'POST',
    });
  }

  async getChatRooms(): Promise<{ rooms: any[] }> {
    return this.request('/chat/rooms');
  }

  async getChatRoom(roomId: string): Promise<{ room: any }> {
    return this.request(`/chat/rooms/${roomId}`);
  }

  async createChatRoom(
    name: string,
    type: 'class' | 'group' | 'department',
    courseCode?: string
  ): Promise<{ room: any }> {
    return this.request('/chat/rooms', {
      method: 'POST',
      body: {
        name,
        type,
        courseCode,
      },
    });
  }

  async getChatMessages(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ messages: any[] }> {
    return this.request(`/chat/rooms/${roomId}/messages`, {
      params: { limit, offset },
    });
  }

  async sendChatMessage(roomId: string, message: string): Promise<{ message: any }> {
    return this.request('/chat/messages', {
      method: 'POST',
      body: {
        roomId,
        message,
      },
    });
  }
}

export const apiClient = new APIClient();
export default apiClient;
