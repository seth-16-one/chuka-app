# Chuka App - New Features Documentation

## Overview
Recent updates to the Chuka app include:
1. **Email OTP Verification** - Secure email verification during user registration
2. **Realtime Chat** - Live messaging with Supabase realtime subscriptions
3. **Enhanced Keyboard Handling** - Improved mobile form experience

---

## 1. Email OTP Verification

### Features
- 6-digit OTP sent to user email during registration
- OTP expires in 10 minutes
- Maximum 5 verification attempts
- **Demo mode**: OTP is displayed in a card for testing without actual email

### Flow
1. User fills registration form
2. Clicks "Create account"
3. OTP is sent to their email
4. OTP verification modal appears (slides up from bottom)
5. User enters 6-digit code
6. If verified, account is created and user is redirected to dashboard
7. If failed, user can retry

### Files Involved
- `services/otp.ts` - OTP service (send, verify, check status)
- `components/ui/otp-modal.tsx` - OTP verification UI with animation
- `app/(auth)/register.tsx` - Registration screen with OTP integration
- `supabase/schema.sql` - OTP verification table

### Database Schema
```sql
create table public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  otp_code text not null,
  attempts int not null default 0,
  max_attempts int not null default 5,
  expires_at timestamptz not null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
```

### API Functions

#### `sendOTP(email: string): Promise<string>`
Generates and sends OTP to email. Returns OTP (for demo).
```typescript
const otp = await sendOTP('user@chuka.ac.ke');
// Returns: "123456"
```

#### `verifyOTP(email: string, otpCode: string): Promise<boolean>`
Verifies the OTP code for given email.
```typescript
const isValid = await verifyOTP('user@chuka.ac.ke', '123456');
```

#### `isEmailVerified(email: string): Promise<boolean>`
Checks if email has been verified.
```typescript
const verified = await isEmailVerified('user@chuka.ac.ke');
```

#### `getOTPDetails(email: string): Promise<OTPVerification | null>`
Retrieves OTP record details.

### UI Component
```typescript
<OTPModal
  visible={showOTPModal}
  email={email}
  onVerify={handleOTPVerify}
  onCancel={handleOTPCancel}
  loading={otpLoading}
  error={otpError}
  demoOTP={demoOTP}
/>
```

### Production Notes
- Currently in **demo mode**: OTP is logged to console and displayed in UI
- For production: Integrate with email service (SendGrid, Resend, AWS SES)
- Update `sendOTP()` function in `services/otp.ts` to send actual emails

---

## 2. Realtime Chat

### Features
- Live messaging with instant delivery
- Supabase realtime subscriptions (PostgreSQL `INSERT` events)
- Multiple chat rooms (class, group, department)
- Message persistence
- User profile information in messages

### Flow
1. User navigates to Chat screen
2. Chat rooms load from database
3. User selects a room
4. Messages load from database
5. Realtime subscription listens for new messages
6. User types message and sends
7. Message appears instantly in both sender and recipients

### Files Involved
- `services/chat.ts` - Chat service with realtime support
- `app/(app)/chat.tsx` - Chat screen UI
- `supabase/schema.sql` - Chat tables (chat_rooms, chat_messages)

### Database Schema
```sql
create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('class', 'group', 'department')),
  course_code text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_name text not null,
  sender_role text not null check (sender_role in ('student', 'lecturer', 'admin')),
  message text not null,
  created_at timestamptz not null default now()
);
```

### API Functions

#### `getChatRooms(): Promise<ChatRoom[]>`
Fetches all available chat rooms.
```typescript
const rooms = await getChatRooms();
// Returns: [{ id, name, type, courseCode }]
```

#### `getChatMessages(roomId: string): Promise<ChatMessage[]>`
Fetches message history for a room.
```typescript
const messages = await getChatMessages(roomId);
// Returns: [{ id, roomId, senderName, message, createdAt }]
```

#### `sendChatMessage(roomId: string, message: string, profile: UserProfile): Promise<void>`
Sends a message to a room. Message appears via realtime subscription.
```typescript
await sendChatMessage(roomId, 'Hello!', profile);
```

#### `subscribeToMessages(roomId: string, onNewMessage, onDelete?): () => void`
Subscribes to realtime messages. Returns unsubscribe function.
```typescript
const unsubscribe = subscribeToMessages(
  roomId,
  (message) => {
    console.log('New message:', message);
  },
  (messageId) => {
    console.log('Message deleted:', messageId);
  }
);

// Later...
unsubscribe();
```

#### `createChatRoom(name, type, courseCode?, userId?): Promise<ChatRoom | null>`
Creates a new chat room.

#### `cleanupChatSubscriptions(): void`
Cleans up all active subscriptions (call on unmount).

### Realtime Mechanics
- Uses Supabase's PostgreSQL Change Data Capture (CDC)
- Listens to `INSERT` and `DELETE` events on `chat_messages` table
- Data flows: Client → Supabase (insert) → PostgreSQL trigger → Broadcast → All connected clients
- Latency: ~100-200ms on good connection

### Production Considerations
- **Scalability**: Realtime channels are efficient but consider room-based subscriptions
- **Offline Support**: Add local queue for messages when offline
- **Message Read Status**: Add `is_read` column tracking per user
- **Typing Indicators**: Implement presence channels for "typing..." status
- **File Sharing**: Extend to support file uploads via Supabase Storage

---

## 3. Keyboard Handling Improvements

### What's Fixed
- ✅ Keyboard doesn't overlap input fields
- ✅ Screen auto-scrolls when input is focused
- ✅ Works on both iOS and Android
- ✅ Keyboard aware safe area spacing

### Implementation Details
- `KeyboardAvoidingView` with platform-specific behavior:
  - iOS: `behavior="padding"`
  - Android: `behavior="height"`
- `ScrollView` with `contentContainerStyle={{ flexGrow: 1 }}`
- `automaticallyAdjustKeyboardInsets={true}` for automatic inset handling
- `keyboardShouldPersistTaps="handled"` to keep input focus while typing

### Files Modified
- `app/(auth)/login.tsx`
- `app/(auth)/register.tsx`
- `app/(auth)/forgot-password.tsx`
- `components/ui/screen.tsx` (default wrapper)

---

## Testing Guide

### OTP Verification
1. Go to Register screen
2. Fill in all fields
3. Click "Create account"
4. **Demo Mode**: OTP code appears in green card (copy it)
5. Enter code in modal and verify
6. If successful, redirected to dashboard

### Realtime Chat
1. Go to Chat screen
2. Select a chat room
3. Send a message from one client
4. Message appears instantly on other client(s)
5. Try deleting a message (if implemented)

### Keyboard Behavior
1. Go to any form (Login, Register, Forgot Password)
2. Tap on an input field
3. Keyboard appears
4. Screen automatically scrolls up
5. Input field stays visible above keyboard
6. Type and submit form

---

## Configuration

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup
1. Create OTP table from schema
2. Create Chat tables from schema
3. Enable Row Level Security (RLS) on all tables
4. Test realtime with "Broadcast" in Supabase dashboard

---

## Troubleshooting

### OTP Not Being Sent
- Check email configuration in Supabase (Auth → Email Templates)
- Verify SMTP credentials if using custom email service
- In dev: Check console for OTP code

### Realtime Messages Not Appearing
- Check internet connection
- Verify Supabase realtime is enabled
- Check browser console for subscription errors
- Test with Supabase dashboard "Broadcast"

### Keyboard Overlapping Fields
- Ensure `KeyboardAvoidingView` wraps content
- Check `flexGrow: 1` is set on ScrollView
- Verify `automaticallyAdjustKeyboardInsets={true}`

---

## Future Enhancements

1. **Email Service Integration**
   - SendGrid/Resend for production OTP
   - Email templates customization

2. **Chat Features**
   - Message search and filtering
   - Typing indicators (presence)
   - Message read receipts
   - File/image sharing

3. **Security**
   - Rate limiting on OTP attempts
   - Captcha integration
   - Two-factor authentication (2FA)

4. **Performance**
   - Message pagination (virtual scrolling)
   - Image compression for chat
   - Offline sync with queue

---

## Support

For issues or questions:
1. Check error messages in console
2. Verify Supabase connection status
3. Review this documentation
4. Check Supabase logs in dashboard
