import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';  // getToken metodu ile token'ı doğruluyoruz
import { routeAccessMap } from './lib/settings';

const secret = process.env.NEXTAUTH_SECRET || 'J+Zlxm7RBRTzgaz/r3LCHhHGXT4vWRoqW9TsfuDZ1Ks=';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Login sayfasına erişimi kontrol et
  if (path === '/login') {
    console.log('Login sayfasına erişim kontrolü');
    const token = await getToken({ req: request, secret });
    
    // Token varsa, kullanıcıyı uygun sayfaya yönlendir
    if (token) {
      const userRole = token.role;  // Token'dan role bilgisini alıyoruz

      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', request.url));
      }
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }

    return NextResponse.next();
  }

  // Token doğrulaması ve role kontrolü
  const token = await getToken({ req: request, secret });

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const expiration_date = new Date((token.exp as number) * 1000);

  const currentTime = Math.floor(Date.now() / 1000); // Şu anki zaman (saniye)

  if (currentTime >= expiration_date.getTime()) {
    console.log("Token süresi dolmuş.");
  } else {
    console.log("Token geçerli.");
  }
  if ((token.exp as number) && (token.exp as number) < currentTime) {
    console.log('Token süresi dolmuş, kullanıcı login sayfasına yönlendiriliyor.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userRole = token.role;  // Token'dan role bilgisini alıyoruz

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
    '/unauthorized',
  ],
};
