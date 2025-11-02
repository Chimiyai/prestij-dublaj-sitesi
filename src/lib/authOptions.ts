// src/lib/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client'; // UserRole'ü import et

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
        
        const user = await prisma.user.findUnique({ 
            where: { email: credentials.email },
            // --- DEĞİŞİKLİK 1: artistProfile ilişkisini de çek ---
            include: {
                artistProfile: {
                    select: { id: true }
                }
            }
        });
        if (!user || !user.password) return null;

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);
        if (!isValidPassword) return null;
        
        // artistProfileId'yi user objesine ekleyerek döndür
        return { 
            ...user, 
            id: user.id.toString(),
            artistProfileId: user.artistProfile?.id || null
        };
      }
    })
  ],

  session: { strategy: 'jwt' },
  
  callbacks: {
    async jwt({ token, user }) {
      // 1. İlk Giriş Anı
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isBanned = user.isBanned;
        token.banExpiresAt = user.banExpiresAt;
        token.profileImagePublicId = user.profileImagePublicId;
        token.bannerImagePublicId = user.bannerImagePublicId;
        // --- DEĞİŞİKLİK 2: Gelen user objesinden artistProfileId'yi token'a ata ---
        // `authorize` fonksiyonunda bu alanı zaten eklemiştik.
        token.artistProfileId = (user as any).artistProfileId; 
      }
      
      // Not: Periyodik veritabanı kontrolünü şimdilik devre dışı bırakıyorum.
      // Her istekte veritabanına gitmek performansı düşürebilir.
      // Bunu daha sonra, session.update yetersiz kalırsa tekrar aktif edebiliriz.
      /*
      const dbUser = await prisma.user.findUnique({ where: { id: Number(token.id) } });
      if (dbUser) { ... }
      */

      return token;
    },
    
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.isBanned = token.isBanned;
        session.user.banExpiresAt = token.banExpiresAt;
        session.user.profileImagePublicId = token.profileImagePublicId;
        session.user.bannerImagePublicId = token.bannerImagePublicId;
        // --- DEĞİŞİKLİK 3: Token'dan gelen artistProfileId'yi session'a aktar ---
        session.user.artistProfileId = token.artistProfileId;
      }
      return session;
    },
  },
  
  pages: { signIn: '/giris', error: '/giris' },
  secret: process.env.NEXTAUTH_SECRET,
};