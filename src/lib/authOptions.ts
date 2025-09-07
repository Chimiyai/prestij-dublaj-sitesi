// src/lib/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) return null;
        
        return { ...user, id: user.id.toString() };
      }
    })
  ],

  session: { strategy: 'jwt' },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. İlk Giriş Anı
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        // <<< YENİ ALANLARI EKLE <<<
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        // ------------------------
        token.isBanned = user.isBanned;
        token.banExpiresAt = user.banExpiresAt;
        token.profileImagePublicId = user.profileImagePublicId;
        token.bannerImagePublicId = user.bannerImagePublicId;
        return token;
      }

      // 2. Session Güncelleme Tetiklendiğinde (`useSession().update()`)
      if (trigger === "update" && session) {
        // Gelen yeni session bilgisiyle token'ı güvenli bir şekilde güncelle
        // Sadece izin verilen alanları güncelle, her şeyi değil
        if (session.user) {
            token.firstName = session.user.firstName;
            token.lastName = session.user.lastName;
            token.username = session.user.username;
            token.profileImagePublicId = session.user.profileImagePublicId;
            token.bannerImagePublicId = session.user.bannerImagePublicId;
        }
        return token;
      }
      
      // 3. Periyodik Veritabanı Kontrolü (Bu kısım zaten iyi, ama buraya da ekleyelim)
      // Bu, admin tarafından bir kullanıcının rolü değiştirildiğinde yansıtılmasını sağlar.
      // Sık kontrol etmemek için bir zamanlayıcı eklenebilir, şimdilik her istekte kontrol edelim.
      const dbUser = await prisma.user.findUnique({ where: { id: Number(token.id) } });
      if (dbUser) {
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.role = dbUser.role;
          token.isBanned = dbUser.isBanned;
      }

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        // <<< YENİ ALANLARI EKLE <<<
        session.user.firstName = token.firstName as string | null;
        session.user.lastName = token.lastName as string | null;
        // ------------------------
        session.user.isBanned = token.isBanned as boolean;
        session.user.banExpiresAt = token.banExpiresAt as Date | null;
        session.user.profileImagePublicId = token.profileImagePublicId as string | null;
        session.user.bannerImagePublicId = token.bannerImagePublicId as string | null;
      }
      return session;
    },
  },
  
  pages: { signIn: '/giris', error: '/giris' },
  secret: process.env.NEXTAUTH_SECRET,
};
