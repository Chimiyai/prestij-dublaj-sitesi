// src/middleware.ts (MODERATOR ROLÜ EKLENMİŞ HALİ)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client'; // Prisma'dan UserRole enum'unu import ediyoruz


export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminOrModeratorPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/giris') || pathname.startsWith('/kayit');

  // --- 1. Kural: Yönetim Paneli Sayfaları ---
  // Eğer admin veya moderatör paneline gitmeye çalışıyorsa:
  if (isAdminOrModeratorPage) {
    // Gerekli rolleri bir diziye alıyoruz.
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];

    // Giriş yapmamışsa VEYA giriş yapmış ama rolü izin verilen rollerden biri değilse -> Giriş sayfasına yönlendir.
    if (!token || !allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.redirect(new URL('/giris', req.url));
    }
    
    // Eğer rolü uygunsa, geçişe izin ver.
    return NextResponse.next();
  }

  // --- 2. Kural: Giriş Yapmış Kullanıcılar ---
  // Eğer kullanıcı giriş yapmışsa (token varsa):
  if (token) {
    // a) Ban durumunu kontrol et
    const isBanned = token.isBanned ?? false;
    const banExpires = token.banExpiresAt ? new Date(token.banExpiresAt as string) : null;
    const isBanActive = isBanned && (!banExpires || banExpires > new Date());
    
    // Eğer banlıysa ve ban sayfasının kendisi dışında bir yere gitmeye çalışıyorsa -> Ban sayfasına yönlendir.
    if (isBanActive && pathname !== '/banlandiniz') {
      return NextResponse.redirect(new URL('/banlandiniz', req.url));
    }
    
    // b) Zaten giriş yapmışken giriş/kayıt sayfalarına gitmesini engelle
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Banlı değilse ve auth sayfasına gitmiyorsa, geçişe izin ver.
    return NextResponse.next();
  }

  // --- 3. Kural: Giriş Yapmamış Kullanıcılar ---
  // Eğer bu noktaya geldiysek, kullanıcı giriş yapmamıştır.
  // Not: publicRoutes'u daha dinamik hale getirebiliriz ama şimdilik bu yeterli.
  const publicRoutes = ['/', '/giris', '/kayit', '/projeler', '/hakkimizda', '/kadromuz']; 
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === route);

  if (isPublic) {
    return NextResponse.next();
  }

  // Eğer sayfa public değilse (örn: /profil, /mesajlar), giriş sayfasına yönlendir.
  const url = new URL('/giris', req.url);
  url.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|sounds).*)',
  ],
};