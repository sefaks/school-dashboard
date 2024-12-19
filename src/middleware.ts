import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routeAccessMap } from './lib/settings'; // settings.ts'yi import ettik

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('role')?.value;

  // Ana sayfa veya login sayfası kontrolü
  if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') {
    if (token) {
      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      }
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    if (request.nextUrl.pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Token kontrolü
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Önce spesifik route'ları kontrol et
  for (const [route, roles] of Object.entries(routeAccessMap)) {
    const regex = new RegExp(`^${route}$`); // Tam eşleşme için başlangıç ve bitiş ekle
    if (regex.test(request.nextUrl.pathname)) {
      if (!roles.includes(userRole as string)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      return NextResponse.next(); // Eğer yetki varsa, diğer kontrollere geçmeden devam et
    }
  }

  // Genel yolları kontrol et
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isTeacherPath = request.nextUrl.pathname.startsWith('/teacher');

  if (isAdminPath && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (isTeacherPath && userRole !== 'teacher') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

// Middleware'i export ettik