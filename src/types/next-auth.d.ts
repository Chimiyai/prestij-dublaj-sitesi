// types/next-auth.d.ts

import 'next-auth';
import 'next-auth/jwt';
import { UserRole } from '@prisma/client'; // UserRole'ü Prisma'dan import etmek daha güvenli

// Session ve User tiplerini genişletme
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole; // 'string' yerine 'UserRole' kullanmak daha doğru
      username: string | null;
      firstName: string | null;
      lastName: string | null;
      isBanned: boolean;
      banReason: string | null;
      banExpiresAt: Date | string | null;
      profileImagePublicId: string | null;
      bannerImagePublicId: string | null;
      // --- YENİ ALAN ---
      artistProfileId?: number | null; // Opsiyonel artistProfileId
    } & DefaultSession['user']; // 'USER' yerine 'user' olmalı
  }

  interface User {
    // Prisma'dan authorize fonksiyonuna dönen user objesiyle eşleşmeli
    id: string;
    role: UserRole; // 'string' yerine 'UserRole'
    username: string;
    firstName: string | null;
    lastName: string | null;
    isBanned: boolean;
    banReason: string | null;
    banExpiresAt: Date | null;
    profileImagePublicId: string | null;
    bannerImagePublicId: string | null;
  }
}

// JWT tipini genişletme
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole; // 'string' yerine 'UserRole'
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    isBanned: boolean;
    banReason: string | null;
    banExpiresAt: Date | string | null;
    profileImagePublicId: string | null;
    bannerImagePublicId: string | null;
    // --- YENİ ALAN ---
    artistProfileId?: number | null; // Opsiyonel artistProfileId
  }
}