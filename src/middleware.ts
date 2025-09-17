// src/middleware.ts (CORS DESTEĞİ EKLENMİŞ GÜNCEL HALİ)

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@prisma/client';

// Geliştirme ortamında masaüstü uygulamasının adresi
const allowedOrigin = 'http://localhost:5173';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- BÖLÜM 1: API İstekleri İçin CORS Yönetimi ---
  // Gelen istek bir API isteğiyse, CORS başlıklarını ekle.
  if (pathname.startsWith('/api/')) {
    
    // Tarayıcıdan gelen 'OPTIONS' (preflight) isteğini handle et.
    // Bu, tarayıcının asıl POST isteğini göndermeden önce izin sorma yöntemidir.
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 'OPTIONS' dışındaki (GET, POST vb.) API isteklerinin devam etmesine izin ver
    // ve cevap başlıklarına CORS kurallarını ekle.
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    return response;
  }


  // --- BÖLÜM 2: Sayfa Gezintileri İçin Güvenlik ve Yönlendirme ---
  // Bu bölüm, API dışındaki tüm sayfa istekleri için çalışır ve eski mantığınızı korur.
  
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  const isAdminOrModeratorPage = pathname.startsWith('/admin');
  const isAuthPage = pathname.startsWith('/giris') || pathname.startsWith('/kayit');

  // --- Kural 2.1: Yönetim Paneli Sayfaları ---
  if (isAdminOrModeratorPage) {
    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];
    if (!token || !allowedRoles.includes(token.role as UserRole)) {
      return NextResponse.redirect(new URL('/giris', req.url));
    }
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

  // --- Kural 2.3: Giriş Yapmamış Kullanıcılar ---
  const publicRoutes = ['/', '/giris', '/kayit', '/projeler', '/hakkimizda', '/kadromuz']; 
  const isPublic = publicRoutes.some(route => pathname.startsWith(route) || pathname === route);

  if (isPublic) {
    return NextResponse.next();
  }

  const url = new URL('/giris', req.url);
  url.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(url);
}


// --- GÜNCELLENMİŞ CONFIG ---
// Matcher'ı hem API yollarını hem de sayfa yollarını içerecek şekilde güncelliyoruz.
export const config = {
  matcher: [
    /*
     * Aşağıdaki yollarla eşleş:
     * - api (API rotaları)
     * - trpc (tRPC rotaları)
     * - hariç olanlar:
     *   - _next/static (statik dosyalar)
     *   - _next/image (resim optimizasyon dosyaları)
     *   - favicon.ico (favicon dosyası)
     *   - images (kendi resim klasörünüz)
     *   - sounds (kendi ses klasörünüz)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|sounds).*)',
  ],
};