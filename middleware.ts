import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes (API and Dashboard)
  const isApiRoute = pathname.startsWith('/api/');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  // Public API routes that don't need auth
  const isPublicApiRoute = pathname.startsWith('/api/auth/') || pathname.startsWith('/api/health');

  // If it's a protected route, verify the token
  if ((isApiRoute && !isPublicApiRoute) || isDashboardRoute) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      if (isApiRoute) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Use jose to verify the JWT signature on the Edge Runtime
      await verifyToken(token);
      return NextResponse.next();
    } catch (error) {
      if (isApiRoute) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If a logged-in user tries to visit the landing page, redirect to dashboard
  if (pathname === '/') {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      try {
        await verifyToken(token);
        return NextResponse.redirect(new URL('/dashboard/chat', request.url));
      } catch (error) {
        // Token is invalid, let them see the landing page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static files, Next.js internal routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|frames/.*|.*\\.svg|.*\\.png|.*\\.webp).*)',
  ],
};
