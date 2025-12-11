import { type NextRequest, NextResponse } from 'next/server';

// Middleware is minimal - just pass through
// Auth protection is handled on the client side with useAuth hook
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
