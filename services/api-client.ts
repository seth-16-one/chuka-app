import Constants from 'expo-constants';
import { safeStorage } from './safe-storage';

const EXPO_EXTRA = (Constants.expoConfig?.extra ?? {}) as {
  apiBaseUrl?: string;
};
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  EXPO_EXTRA.apiBaseUrl ||
  'https://chuka-backend.onrender.com/api';
const TOKEN_KEY = 'auth_token';

type RequestMethod = 'GET' | 'POST' | 'PUT';

class APIClient {
  private async request<T>(
    path: string,
    options: {
      method?: RequestMethod;
      body?: Record<string, unknown>;
      params?: Record<string, string | number | undefined>;
    } = {}
  ): Promise<T> {
    const token = await safeStorage.getItem(TOKEN_KEY);
    const url = new URL(`${API_BASE_URL}${path}`);

    Object.entries(options.params ?? {}).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: options.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
    } catch {
      const apiHost = API_BASE_URL.replace(/\/api\/?$/, '');
      throw new Error(
        `Network error. The app could not reach the backend at ${apiHost}. Please confirm the backend is live, then restart Expo.`
      );
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        await safeStorage.removeItem(TOKEN_KEY);
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
  }

  async sendOTP(
    email: string,
    purpose: 'registration' | 'password_reset' | 'login' = 'registration'
  ): Promise<{ success: boolean; challengeId: string; expiresInMinutes: number; message: string; otpCode?: string }> {
    return this.request('/otp/request', {
      method: 'POST',
      body: { email, purpose },
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
    });
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
    const data = await this.request<{ token: string; refreshToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: { identifier, password },
    });

    if (data.token) {
      await safeStorage.setItem(TOKEN_KEY, data.token);
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
    await safeStorage.removeItem(TOKEN_KEY);
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
