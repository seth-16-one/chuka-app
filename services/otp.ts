import apiClient from './api-client';

export interface OTPRequestResult {
  challengeId: string;
  expiresInMinutes: number;
  message: string;
}

/**
 * Send OTP to user's email via backend
 * Backend will generate OTP, store in database, and send via Gmail
 */
export async function sendOTP(
  email: string,
  purpose: 'registration' | 'password_reset' | 'login' = 'registration'
): Promise<OTPRequestResult> {
  try {
    const response = await apiClient.sendOTP(email, purpose);
    return {
      challengeId: response.challengeId,
      expiresInMinutes: response.expiresInMinutes,
      message: response.message,
    };
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw error;
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(
  email: string,
  challengeId: string,
  otpCode: string,
  purpose: 'registration' | 'password_reset' | 'login' = 'registration'
): Promise<boolean> {
  try {
    const response = await apiClient.verifyOTP(email, challengeId, otpCode, purpose);
    return response.verified;
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    throw error;
  }
}

/**
 * Check if OTP has been verified for email
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  // Note: This would need to be implemented on backend
  // For now, we can check local state or call a backend endpoint
  return false; // Implement as needed
}

/**
 * Get OTP verification details
 */
export async function getOTPDetails(email: string): Promise<any | null> {
  // Note: This would need to be implemented on backend
  // For now, returning null
  return null; // Implement as needed
}
