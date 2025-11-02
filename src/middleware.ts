// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

const allowedOrigin = 'http://localhost:5173';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- BÖLÜM 1: API İstekleri İçin CORS Yönetimi ---
  if (pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS', // PATCH eklendi
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    return response;
  }

  // --- BÖLÜM 2: Sayfa Gezintileri İçin Güvenlik ve Yönlendirme ---
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const isAdminPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/giris') || pathname.startsWith('/kayit');

  // --- Kural 2.1: Yönetim Paneli Sayfaları ---
  if (isAdminPage) {
    // --- DEĞİŞİKLİK BURADA ---
    // Admin paneline erişim izni olan tüm rolleri bu listeye ekliyoruz.
    const allowedRoles: UserRole[] = [
      UserRole.ADMIN, 
      UserRole.MODERATOR,
      UserRole.TRANSLATOR,
      UserRole.VOICE_ACTOR,
      UserRole.MIX_MASTER,
      UserRole.MODDER
    ];

    // Eğer kullanıcı giriş yapmamışsa VEYA rolü izin verilen roller arasında DEĞİLSE,
    // giriş sayfasına yönlendir.
    if (!token || !allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.redirect(new URL('/giris', req.url));
    }

    // Eğer yetkisi varsa, devam etmesine izin ver.
    return NextResponse.next();
  }

  // --- Kural 2.2: Giriş Yapmış Kullanıcılar ---
  if (token) {
    const isBanned = token.isBanned ?? false;
    const banExpires = token.banExpiresAt ? new Date(token.banExpiresAt as string) : null;
    const isBanActive = isBanned && (!banExpires || banExpires > new Date());
    
    if (isBanActive && pathname !== '/banlandiniz') {
      return NextResponse.redirect(new URL('/banlandiniz', req.url));
    }
    
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  }

  // --- Kural 2.3: Giriş Yapmamış Kullanıcılar (Bu kısım aynı kalabilir) ---
  const publicRoutes = ['/', '/giris', '/kayit', '/projeler', '/hakkimizda', '/kadromuz']; 
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === route);

  if (isPublic) {
    return NextResponse.next();
  }

  const url = new URL('/giris', req.url);
  url.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(url);
}

// Config kısmı aynı kalıyor
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|sounds).*)',
  ],
};