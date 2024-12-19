import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeAccessMap } from './lib/settings';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;
  const path = request.nextUrl.pathname;

  // Public paths kontrolü
  if (path === '/login') {
    if (token) {
      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      }
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  // Token kontrolü
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Ana sayfa yönlendirmesi
  if (path === '/') {
    if (userRole === 'teacher') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // List route'ları için yetki kontrolü
  if (path.startsWith('/list/')) {
    const matchingRoute = Object.entries(routeAccessMap).find(([route]) => {
      return new RegExp(`^${route}$`).test(path);
    });

    if (matchingRoute) {
      const [_, allowedRoles] = matchingRoute;
      if (!allowedRoles.includes(userRole as string)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
  }

  // Admin ve Teacher route'ları için yetki kontrolü
  if (path.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  if (path.startsWith('/teacher') && userRole !== 'teacher') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/teacher/:path*',
    '/list/:path*',
    '/unauthorized'
  ]
};