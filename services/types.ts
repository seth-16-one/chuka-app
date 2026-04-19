export type UserRole = 'student' | 'lecturer' | 'admin';

export type ChatRoomType = 'class' | 'group' | 'department';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  regNumber?: string;
  staffNumber?: string;
  department?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  feeBalanceCents?: number | null;
  feesCleared?: boolean | null;
  lastPaymentAt?: string | null;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  courseCode?: string;
  createdBy?: string;
  updatedAt?: string;
  messageCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  isOnline?: boolean;
  isTyping?: boolean;
  lastSeen?: string;
}

export interface DeviceSession {
  id: string;
  deviceName: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  locationLabel?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  createdAt?: string | null;
  lastSeenAt?: string | null;
  revokedAt?: string | null;
  revokedReason?: string | null;
  isCurrent?: boolean;
}

export type DocumentType = 'gatepass' | 'exam-card' | 'transcript';

export interface FinanceSummary {
  balanceCents: number;
  paidCents: number;
  dueCents: number;
  feesCleared: boolean;
  lastPaymentAt?: string | null;
  statusLabel?: string | null;
}

export interface StaffMaterial {
  id: string;
  title: string;
  courseCode: string;
  audience: string;
  author: string;
  summary: string;
  fileLabel: string;
  storagePath?: string | null;
  mimeType?: string | null;
  originalFileName?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
  uploadedBy?: string | null;
  isPublished?: boolean | null;
}

export interface StudentDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  fileName: string;
  mimeType?: string | null;
  storagePath?: string | null;
  fileSize?: number | null;
  feesCleared?: boolean | null;
  createdAt?: string | null;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId?: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
  isMine?: boolean;
  isRead?: boolean;
}

export interface OTPVerification {
  id: string;
  email: string;
  otpCode: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  time: string;
  title: string;
  venue: string;
  courseCode: string;
  lecturer: string;
  status?: 'upcoming' | 'live' | 'done';
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: string;
  publishedAt: string;
  author: string;
  priority?: 'high' | 'normal';
}

export interface NoteItem {
  id: string;
  title: string;
  courseCode: string;
  author: string;
  summary: string;
  fileLabel: string;
  uploadedAt: string;
}
