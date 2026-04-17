import { Session, User } from '@supabase/supabase-js';
import apiClient from './api-client';
import { UserProfile } from './types';

export function getDashboardPath(_role: UserProfile['role']) {
  return '/dashboard';
}

export function createDemoSession(profile: UserProfile): Session {
  return {
    access_token: 'backend-session',
    refresh_token: 'backend-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: profile.id,
      email: profile.email,
    } as User,
  };
}

function mapApiUser(user: any): UserProfile {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    regNumber: user.regNumber,
    staffNumber: user.staffNumber,
    department: user.department,
    phone: user.phone,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
  };
}

export async function signIn(identifier: string, password: string): Promise<UserProfile> {
  const response = await apiClient.login(identifier, password);
  return mapApiUser(response.user);
}

export async function registerStudent(input: {
  fullName: string;
  email: string;
  regNumber: string;
  department: string;
  password: string;
  challengeId?: string;
  otpCode?: string;
}) {
  try {
    const response = await apiClient.register(
      input.email,
      input.password,
      input.fullName,
      input.regNumber,
      'student',
      input.department,
      input.challengeId,
      input.otpCode
    );

    const user = response.user;
    return mapApiUser(user) satisfies UserProfile;
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    await apiClient.logout();
  } catch (error) {
    throw error;
  }
}
