# Quick Start - New Features

## 🚀 What's New

Your Chuka app now has:
1. **Email OTP Verification** - Secure registration with 6-digit codes
2. **Realtime Chat** - Live messaging powered by Supabase
3. **Better Keyboard** - Forms scroll smoothly on mobile

---

## 📋 Testing the Features

### Test OTP Verification
```
1. Launch app → Register screen
2. Fill form (use any email for demo)
3. Click "Create account"
4. ✅ Green card shows OTP code
5. Copy code → Paste in modal
6. Click verify ✓
```

### Test Realtime Chat
```
1. Login (any credentials)
2. Go to Chat screen
3. Select a room
4. Type message → Hit send
5. Message appears instantly ✓
```

### Test Keyboard Behavior
```
1. Go to Login/Register
2. Tap email field
3. Keyboard appears
4. Form scrolls up automatically ✓
5. All inputs stay visible
```

---

## 🔧 Configuration Needed

### Step 1: Update .env
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Step 2: Run Supabase Migrations
Copy the schema from `supabase/schema.sql` and run in your Supabase SQL editor:
- Creates `otp_verifications` table
- Creates `chat_rooms` and `chat_messages` tables
- Sets up Row Level Security

### Step 3: Enable Realtime
In Supabase Dashboard:
1. Replication → Public schema
2. Enable for `chat_messages` table
3. Test with "Broadcast" in dashboard

---

## 📧 Email Setup (Optional for Production)

Currently shows OTP on screen. To send real emails:

1. Pick email service: SendGrid, Resend, AWS SES, etc.
2. Edit `services/otp.ts` → `sendOTP()` function
3. Replace console.log with actual email API call

**Example with Resend:**
```typescript
import { Resend } from 'resend';

const resend = new Resend('re_...');

// In sendOTP():
await resend.emails.send({
  from: 'noreply@chuka.ac.ke',
  to: email,
  subject: 'Verify your email',
  html: `Your code: ${otpCode}`,
});
```

---

## 🎯 File Locations

### OTP
- Logic: `services/otp.ts`
- UI: `components/ui/otp-modal.tsx`
- Usage: `app/(auth)/register.tsx`

### Chat
- Logic: `services/chat.ts`
- UI: `app/(app)/chat.tsx`
- Types: `services/types.ts`

### Database
- Schema: `supabase/schema.sql`
- Types: `services/types.ts` (OTPVerification)

---

## ⚡ Key Functions

### OTP
```typescript
import { sendOTP, verifyOTP, isEmailVerified } from '@/services/otp';

// Send OTP
const otp = await sendOTP('user@chuka.ac.ke');

// Verify
const valid = await verifyOTP('user@chuka.ac.ke', '123456');

// Check status
const verified = await isEmailVerified('user@chuka.ac.ke');
```

### Chat
```typescript
import {
  getChatRooms,
  getChatMessages,
  sendChatMessage,
  subscribeToMessages,
} from '@/services/chat';

// Get rooms
const rooms = await getChatRooms();

// Get messages
const messages = await getChatMessages(roomId);

// Send message
await sendChatMessage(roomId, 'Hello!', profile);

// Subscribe (realtime)
const unsub = subscribeToMessages(roomId, (msg) => {
  console.log('New:', msg);
});
```

---

## ✅ Checklist

- [ ] Update `.env` with Supabase keys
- [ ] Run schema migrations in Supabase
- [ ] Enable realtime for `chat_messages` table
- [ ] Test OTP verification flow
- [ ] Test chat realtime
- [ ] Test keyboard behavior
- [ ] (Optional) Setup email service for production

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| OTP not showing | Check Supabase connection in `.env` |
| Chat not realtime | Enable realtime on `chat_messages` in Supabase |
| Keyboard overlaps | Ensure you're using latest auth screens |
| No errors but features not working | Check network tab in Supabase dashboard |

---

## 📚 Full Documentation

See `FEATURES.md` for detailed documentation on:
- API reference
- Database schema
- Implementation details
- Production considerations
- Future enhancements

---

## 💡 Pro Tips

1. **Demo Mode**: OTP shows in green card for easy testing
2. **Realtime Speed**: ~100-200ms latency on good connection
3. **No Emails in Dev**: Remove email service requirement for testing
4. **Cleanup**: Chat subscriptions auto-cleanup on unmount (no memory leaks)

---

Enjoy the new features! 🎉
