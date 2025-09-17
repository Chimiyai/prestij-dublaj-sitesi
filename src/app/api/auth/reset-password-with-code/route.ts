// src/app/api/auth/reset-password-with-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const resetSchema = z.object({
  email: z.string().min(1, "E-posta veya kullanıcı adı gerekli."),
  recoveryCode: z.string().min(1, "Kurtarma kodu gerekli."),
  newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı."),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.issues }, { status: 400 });
    }

    const { email, recoveryCode, newPassword } = validation.data;

    // 1. Kullanıcıyı e-posta veya kullanıcı adıyla bul
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email },
        ]
      }
    });
    
    // 2. Kullanıcı yoksa veya kurtarma kodu hiç oluşturulmamışsa hata döndür
    if (!user || !user.recoveryCodeHash) {
      return NextResponse.json({ message: 'Kullanıcı bulunamadı veya bu hesap için bir kurtarma kodu mevcut değil.' }, { status: 404 });
    }

    // 3. Kullanıcının girdiği kod ile veritabanındaki hash'i karşılaştır
    const isCodeValid = await bcrypt.compare(recoveryCode, user.recoveryCodeHash);

    if (!isCodeValid) {
      return NextResponse.json({ message: 'Kurtarma kodu geçersiz.' }, { status: 401 });
    }

    // 4. Kod doğruysa, yeni şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // 5. Veritabanını yeni şifreyle güncelle VE güvenlik için kullanılmış kurtarma kodunu sil
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        recoveryCodeHash: null, // Kurtarma kodunu tek kullanımlık yap
      },
    });

    return NextResponse.json({ message: 'Şifreniz başarıyla güncellendi.' });

  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    return NextResponse.json({ message: 'Şifre sıfırlanırken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}