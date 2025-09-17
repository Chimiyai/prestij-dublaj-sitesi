// src/app/api/auth/desktop-login/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Prisma client'ınızın doğru yolu
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    // 1. İstek içerisinden email ve şifreyi al
    const { email, password } = await req.json();

    // 2. Gelen veriyi doğrula
    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-posta ve şifre alanları zorunludur.' },
        { status: 400 } // Bad Request
      );
    }

    // 3. Kullanıcıyı veritabanında e-posta veya kullanıcı adı ile bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email } // Kullanıcının e-posta yerine kullanıcı adıyla da giriş yapabilmesini sağlar
        ]
      }
    });

    // 4. Kullanıcı bulunamazsa veya kullanıcının şifresi yoksa (örn: Google ile kayıt olduysa) hata döndür
    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı veya şifre geçersiz.' },
        { status: 404 } // Not Found
      );
    }

    // 5. Gelen şifre ile veritabanındaki hash'lenmiş şifreyi karşılaştır
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Kullanıcı adı veya şifre hatalı.' },
        { status: 401 } // Unauthorized
      );
    }

    // 6. Şifre doğruysa, bir JWT (JSON Web Token) oluştur. Bu token, kullanıcının kimliğidir.
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.NEXTAUTH_SECRET || 'fallback_secret_key', // .env dosyanızdaki gizli anahtarı kullanın!
      { expiresIn: '30d' } // Token'ın geçerlilik süresi (örneğin 30 gün)
    );

    // 7. Kullanıcının hassas bilgilerini (şifre gibi) ayıklayarak geri kalanını ve token'ı istemciye gönder
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Giriş başarılı!',
      token,
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error("Desktop Login Error:", error);
    return NextResponse.json(
      { message: 'Sunucuda bir hata oluştu.' },
      { status: 500 } // Internal Server Error
    );
  }
}