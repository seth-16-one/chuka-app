import { Session, User } from '@supabase/supabase-js';
import apiClientService from './api-client';
import { UserProfile } from './types';

export function getDashboardPath(_role: UserProfile['role']) {
  return '/dashboard';
}

export function toUserProfile(user: any): UserProfile {
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

export function createSessionFromTokens(
  profile: UserProfile,
  accessToken: string,
  refreshToken: string
): Session {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: {
      id: profile.id,
      email: profile.email,
      } as User,
  };
}

export async function signIn(identifier: string, password: string): Promise<UserProfile> {
  const response = await apiClientService.login(identifier, password);
  return toUserProfile(response.user);
}

export async function requestLoginOtp(
  usernameOrEmail: string,
  password: string,
  expectedRole?: string
) {
  return apiClientService.requestLoginOtp(usernameOrEmail, password, expectedRole);
}

export async function verifyLoginOtp(challengeId: string, code: string) {
  return apiClientService.verifyLoginOtp(challengeId, code);
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
    const response = await apiClientService.register(
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
    return toUserProfile(user) satisfies UserProfile;
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    await apiClientService.logout();
  } catch (error) {
    throw error;
  }
}
