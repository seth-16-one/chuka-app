# Chuka App - Setup Guide

Complete guide to set up Supabase, deploy backend, and test the full integration.

## ✅ Completed: Frontend API Integration

The frontend has been updated to use your Node.js backend:

### Changes Made:
1. ✅ **Created API Client** (`services/api-client.ts`)
   - Axios-based HTTP client with JWT token management
   - Automatic token injection on protected routes
   - Centralized error handling
   - All endpoints defined for OTP, Auth, Chat

2. ✅ **Updated OTP Service** (`services/otp.ts`)
   - Now calls `POST /api/otp/send` and `POST /api/otp/verify`
   - Backend handles email delivery via Gmail

3. ✅ **Updated Auth Service** (`services/auth.ts`)
   - `signIn()` calls `POST /api/auth/login`
   - `registerStudent()` calls `POST /api/auth/register`
   - JWT tokens stored in AsyncStorage
   - `signOut()` clears token

4. ✅ **Updated Chat Service** (`services/chat.ts`)
   - `getChatRooms()` calls `GET /api/chat/rooms`
   - `getChatMessages()` calls `GET /api/chat/rooms/:id/messages`
   - `sendChatMessage()` calls `POST /api/chat/messages`

5. ✅ **Added axios dependency** to `package.json`

---

## 🚀 Step 1: Set Up Supabase Database

### Instructions:

1. **Open Supabase Console**
   ```
   https://supabase.com/dashboard
   ```

2. **Create New Project or Select Existing**
   - Project name: "chuka-app" (recommended)
   - Region: Closest to your location
   - Database password: Save securely

3. **Go to SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query**

4. **Copy & Paste Database Schema**
   ```
   Location: c:\Projects\chuka-app-backend\supabase\schema.sql
   ```
   - Select all content from the file
   - Paste into Supabase SQL editor
   - Click **Run** (black play button)

5. **Wait for Completion**
   - You should see green checkmarks for each CREATE TABLE
   - Query execution time: ~5-10 seconds

6. **Verify Tables Created**
   - Click **Table Editor** in sidebar
   - You should see:
     - ✅ `profiles`
     - ✅ `otp_verifications`
     - ✅ `chat_rooms`
     - ✅ `chat_messages`

### Important: Copy Your Credentials

7. **Get API Keys**
   - Click **Settings** → **API** in sidebar
   - Copy the following and **save them securely**:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public key** (e.g., `eyJhbGc...`)
     - **service_role key** (keep this SECRET!)

---

## 🌐 Step 2: Set Up & Deploy Backend

### Option A: Deploy to Railway (Easiest) ⭐ Recommended

1. **Create Railway Account**
   ```
   https://railway.app
   ```
   - Sign up with GitHub

2. **Create New Project**
   - Click **Create New Project**
   - Select **Deploy from GitHub repo**
   - Authorize Railway to access your GitHub

3. **Connect Repository**
   - Select your GitHub repo with the backend code
   - Select branch: `main`

4. **Add Environment Variables**
   - Railway will detect backend automatically
   - Go to **Variables** tab
   - Add these from your `.env` file:
     ```
     SUPABASE_URL=https://xxxxx.supabase.co
     SUPABASE_ANON_KEY=eyJhbGc...
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
     EMAIL_USER=your-gmail@gmail.com
     EMAIL_PASSWORD=your-app-password
     JWT_SECRET=your-secret-key-min-32-chars
     PORT=3000
     NODE_ENV=production
     ```

5. **Deploy**
   - Railway will automatically deploy on every push
   - Wait for deployment to complete (2-3 minutes)
   - You'll see a green checkmark when ready

6. **Get Backend URL**
   - Copy the public domain from Railway
   - Example: `https://chuka-backend-prod.railway.app`

### Option B: Deploy to Render

1. **Create Render Account**
   ```
   https://render.com
   ```

2. **Create New Web Service**
   - Connect GitHub repository
   - Select deployed branch

3. **Configure Settings**
   - Build command: `npm run build`
   - Start command: `npm start`
   - Environment: Add variables from Step 4 above

4. **Deploy**
   - Render will deploy automatically
   - Get your service URL when ready

### Option C: Run Locally (for testing)

```bash
# Terminal: Navigate to backend folder
cd c:\Projects\chuka-app-backend

# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env with your Supabase & Gmail credentials

# Start development server
npm run dev

# Server runs on: https://chuka-backend.onrender.com
```

---

## 📱 Step 3: Configure Frontend

### Set Backend URL

Edit `app.json` or create `.env.local`:

```javascript
// Option 1: In app.json
{
  "expo": {
    "plugins": [
      ["@react-native-firebase/app"]
    ]
  },
  "extra": {
    "apiURL": "https://chuka-backend.onrender.com/api"
  }
}
```

```bash
# Option 2: Create .env file in frontend root
EXPO_PUBLIC_API_URL=https://chuka-backend.onrender.com/api
```

---

## 🧪 Step 4: Test the Integration

### 1. Install Frontend Dependencies
```bash
cd c:\Projects\chuka-app
npm install  # or yarn install
```

### 2. Start Frontend
```bash
expo start
# Press 'i' for iOS or 'a' for Android
# Or scan QR code with Expo Go app
```

### 3. Test Registration Flow
1. Go to **Register** screen
2. Enter:
   - Full Name: Test User
   - Email: test@example.com
   - Reg Number: CHK001
   - Department: Computer Science
   - Password: Test@123456

3. Click **Send OTP**
   - Check email for OTP (should arrive in 1-2 minutes)
   - If using local backend: check terminal for OTP

4. Enter OTP code and click **Verify**

5. If successful → Account created!

### 4. Test Login
1. Go to **Login** screen
2. Enter email and password
3. Should see dashboard

### 5. Test Chat
1. Navigate to **Chat** screen
2. Should see chat rooms from database
3. Click room and type message
4. Message should appear in realtime

---

## 🐛 Troubleshooting

### API Connection Fails
- ❌ **Error**: `Network Error` / `ECONNREFUSED`
- ✅ **Solution**: 
  1. Check backend is running (check Railway/Render dashboard)
  2. Verify `EXPO_PUBLIC_API_URL` is set correctly
  3. Check backends's CORS settings in `src/app.ts`

### OTP Email Not Received
- ❌ **Error**: No email arrives after 5 minutes
- ✅ **Solution**:
  1. Verify Gmail app password is correct (not your regular password)
  2. Check backend logs for errors
  3. Verify `EMAIL_USER` and `EMAIL_PASSWORD` in .env

### JWT Token Errors
- ❌ **Error**: `401 Unauthorized`
- ✅ **Solution**:
  1. Clear AsyncStorage: Delete and reinstall app
  2. Re-login to get new token
  3. Check `JWT_SECRET` is same on frontend and backend

### Database Errors
- ❌ **Error**: `postgres error` / Table not found
- ✅ **Solution**:
  1. Verify schema.sql ran successfully in Supabase
  2. Check table names match API service calls
  3. Verify RLS policies are enabled

---

## 📋 Checklist

- [ ] ✅ Step 1: Supabase database set up
- [ ] ✅ Step 2: Backend deployed (Railway/Render/Local)
- [ ] ✅ Step 3: Frontend configured with backend URL
- [ ] ✅ Step 4: Successfully registered new account
- [ ] ✅ Step 5: Successfully logged in
- [ ] ✅ Step 6: Successfully sent/received chat messages

---

## 🎉 You're All Set!

Your Chuka app is now fully integrated with:
- ✅ Real email OTP verification
- ✅ JWT-based authentication
- ✅ Real-time chat messaging
- ✅ Database persistence with RLS security

### Next Steps (Optional)
1. Add profile pictures (avatar uploads)
2. Add typing indicators
3. Add message read receipts
4. Add push notifications
5. Add offline message queue

---

## Support

If you encounter issues:
1. Check the **Troubleshooting** section above
2. Review backend logs (Railway/Render dashboard)
3. Check frontend console (Expo debugger)
4. Verify all environment variables are set correctly
