import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/register', '/api/auth/login', '/api/setup'];

export async function middleware(request: NextRequest) {
  // Try to read token from cookies
  const token = request.cookies.get('token')?.value;

  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  // Skip static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // If there's no token and it's not a public route, redirect to login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a token
  if (token) {
    const payload = await verifyToken(token);
    
    // Invalid token, wipe it and redirect
    if (!payload && !isPublicRoute) {
      const resp = NextResponse.redirect(new URL('/login', request.url));
      resp.cookies.delete('token');
      return resp;
    }

    // Authenticated, redirect away from login if trying to access it
    if (payload && request.nextUrl.pathname === '/login') {
      const role = payload.role as string;
      let redirectUrl = '/dashboard';
      if (role === 'ADMIN') redirectUrl = '/admin';
      else if (role === 'TEACHER' || role === 'HEAD') redirectUrl = '/teacher';
      else if (role === 'CR') redirectUrl = '/cr';
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
