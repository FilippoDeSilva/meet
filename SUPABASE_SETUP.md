# Supabase Migration Guide

This document outlines the migration from Clerk to Supabase for authentication and meeting recordings.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project
3. Have your Supabase URL and API keys ready

## Environment Variables Setup

Update your `.env.local` file with the following variables:

```env
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# STREAM API (Keep existing)
NEXT_PUBLIC_STREAM_API_KEY=xkcvqkw5d67r
STREAM_SECRET_KEY=xpez6z2xw82jhas2qqnd4kvj84wj8gzjm4yepgyhtthhphbasq5bh4f59ktn2pyj

# NEXT JS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Create a new query and run the SQL from `lib/supabase-schema.sql`

This will create:
- `meeting_recordings` table with proper schema
- Row Level Security (RLS) policies for data protection
- Indexes for optimal query performance

## Authentication Flow

### Sign Up
- Users can sign up at `/sign-up` with email and password
- Supabase handles email verification
- Minimum password length: 6 characters

### Sign In
- Users sign in at `/sign-in` with email and password
- Session is managed via Supabase auth cookies
- Middleware protects routes requiring authentication

### Sign Out
- Click the "Sign Out" button in the navbar
- User is redirected to `/sign-in`
- Session is cleared

## Key Changes from Clerk

### Removed
- `@clerk/nextjs` package
- Clerk middleware and authentication
- Clerk UI components (SignIn, SignUp, UserButton)

### Added
- `@supabase/supabase-js` for client-side operations
- `@supabase/auth-helpers-nextjs` for server-side auth
- `@supabase/auth-helpers-react` for React context
- Custom authentication UI components
- Supabase middleware for route protection

### Updated Hooks
- `useUser()` → `useAuth()` (custom hook using Supabase)
- Returns: `{ user, isLoading, signOut }`

## Meeting Recordings

### Database Schema
- `meeting_recordings` table stores all recording metadata
- Fields: id, meeting_id, user_id, title, description, recording_url, thumbnail_url, duration_seconds, file_size_bytes, created_at, updated_at, is_public

### API Routes
- `GET /api/recordings` - Get user's recordings
- `POST /api/recordings` - Create new recording
- `GET /api/recordings/[id]` - Get specific recording
- `PUT /api/recordings/[id]` - Update recording
- `DELETE /api/recordings/[id]` - Delete recording

### Recording Service
Use `recordingService` from `lib/recording.ts` for client-side operations:

```typescript
import { recordingService } from '@/lib/recording';

// Create recording
await recordingService.createRecording(meetingId, recordingUrl, {
  title: 'Meeting Title',
  description: 'Meeting description'
});

// Get user's recordings
const recordings = await recordingService.getRecordings();

// Update recording
await recordingService.updateRecording(recordingId, {
  title: 'Updated Title'
});

// Delete recording
await recordingService.deleteRecording(recordingId);
```

## Installation & Running

1. Install dependencies:
```bash
npm install
# or
pnpm install
```

2. Update environment variables in `.env.local`

3. Run database migrations (execute SQL from `lib/supabase-schema.sql`)

4. Start development server:
```bash
npm run dev
```

5. Visit http://localhost:3000

## Security Considerations

- All API routes check user authentication
- Row Level Security (RLS) policies enforce data isolation
- Users can only access their own recordings
- Public recordings are accessible to all authenticated users
- Passwords are hashed by Supabase
- Session tokens are managed securely

## Troubleshooting

### "User not authenticated" error
- Ensure user is logged in
- Check that Supabase session is valid
- Verify environment variables are set correctly

### Recording API returns 401
- Check that user is authenticated
- Verify `x-user-id` header is being sent (for server routes)
- Ensure Supabase service role key is configured

### Middleware redirects to sign-in
- This is expected for protected routes when not authenticated
- Sign in first, then access protected routes

## File Structure Changes

```
lib/
  ├── supabase.ts (client)
  ├── supabase-server.ts (server)
  ├── supabase-schema.sql (database schema)
  └── recording.ts (recording service)

hooks/
  └── useAuth.ts (authentication hook)

providers/
  └── AuthProvider.tsx (Supabase session provider)

app/
  ├── (auth)/
  │   ├── sign-in/[[...sigin-in]]/page.tsx
  │   └── sign-up/[[...sign-up]]/page.tsx
  └── api/
      └── recordings/
          ├── route.ts
          └── [id]/route.ts
```

## Next Steps

1. Set up Supabase project and environment variables
2. Run database schema SQL
3. Install dependencies: `npm install`
4. Test sign up/sign in flow
5. Test meeting recordings API
6. Deploy to production with proper environment variables
