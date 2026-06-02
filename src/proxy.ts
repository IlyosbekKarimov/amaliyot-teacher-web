import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.endsWith('.svg') || 
    pathname.endsWith('.ico') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('access_token');
  const role = request.cookies.get('user_role');

  const isLoginPage = pathname === '/login';

  // If trying to access dashboard without token or not a teacher
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access dashboard as non-teacher
  if (token && role?.value !== 'TEACHER' && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access login page while already authenticated
  if (token && role?.value === 'TEACHER' && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // redirect root to dashboard
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
