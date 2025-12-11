# Quick Start Guide - Supabase Migration

## 1. Create Supabase Project (5 minutes)
- Visit https://supabase.com and sign up
- Create a new project
- Copy your project URL and API keys

## 2. Update Environment Variables
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 3. Set Up Database
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy all SQL from `lib/supabase-schema.sql`
4. Execute the query
5. Done! Tables and RLS policies are created

## 4. Install Dependencies
```bash
npm install
# or
pnpm install
```

## 5. Start Development Server
```bash
npm run dev
```

## 6. Test the App
- Visit http://localhost:3000
- You'll be redirected to `/sign-in`
- Click "Sign up" to create account
- Sign in with your credentials
- You're now authenticated!

## Key Files to Know

| File | Purpose |
|------|---------|
| `lib/supabase.ts` | Client-side Supabase instance |
| `lib/supabase-server.ts` | Server-side Supabase instance |
| `hooks/useAuth.ts` | Authentication hook (replaces `useUser()`) |
| `providers/AuthProvider.tsx` | Auth context provider |
| `lib/recording.ts` | Recording database service |
| `app/api/recordings/*` | Recording API endpoints |

## Common Tasks

### Get Current User
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, isLoading, signOut } = useAuth();
```

### Create Recording
```typescript
import { recordingService } from '@/lib/recording';

await recordingService.createRecording(meetingId, recordingUrl, {
  title: 'My Meeting',
  description: 'Meeting notes'
});
```

### Get User's Recordings
```typescript
const recordings = await recordingService.getRecordings();
```

### Sign Out User
```typescript
const { signOut } = useAuth();
await signOut(); // Redirects to /sign-in
```

## Troubleshooting

**"Cannot find module '@supabase/supabase-js'"**
- Run `npm install` to install dependencies

**"User not authenticated" on API routes**
- Make sure you're signed in
- Check that Supabase credentials are correct in `.env.local`

**Middleware redirects to sign-in**
- This is expected for protected routes
- Sign in first, then access protected pages

**Database schema not found**
- Execute the SQL from `lib/supabase-schema.sql` in Supabase SQL Editor
- Verify the `meeting_recordings` table exists

## What Changed from Clerk?

| Feature | Before | After |
|---------|--------|-------|
| Sign In | Clerk component | Custom form |
| Sign Up | Clerk component | Custom form |
| User Hook | `useUser()` | `useAuth()` |
| User Object | Clerk User | Supabase User |
| Auth Provider | ClerkProvider | AuthProvider |
| Recordings | Stream.io only | Supabase database |

## Next Steps

1. ✅ Create Supabase project
2. ✅ Update `.env.local`
3. ✅ Run database schema SQL
4. ✅ Install dependencies
5. ✅ Start dev server
6. ✅ Test authentication
7. Test recording API endpoints
8. Deploy to production

## Support

For detailed information, see:
- `SUPABASE_SETUP.md` - Complete setup guide
- `MIGRATION_SUMMARY.md` - All changes made
