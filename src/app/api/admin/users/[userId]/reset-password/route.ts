// src/app/api/admin/users/[userId]/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalıdır."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } } // Build hatası almamak için Promise'siz versiyonu deneyelim
) {
  try {
    // 1. İstek yapan kullanıcının Admin olup olmadığını kontrol et
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
    }

    const targetUserId = parseInt(params.userId, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json({ message: 'Geçersiz kullanıcı ID formatı.' }, { status: 400 });
    }

    // 2. Gelen yeni şifreyi doğrula
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: validation.error.issues }, { status: 400 });
    }
    const { newPassword } = validation.data;

    // 3. Hedef kullanıcının var olup olmadığını kontrol et
    const userToUpdate = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!userToUpdate) {
      return NextResponse.json({ message: 'Şifresi güncellenecek kullanıcı bulunamadı.' }, { status: 404 });
    }

    // 4. Yeni şifreyi hash'le
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 5. Veritabanında şifreyi güncelle
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        password: hashedPassword,
        // Güvenlik için recovery kodunu da temizleyelim
        recoveryCodeHash: null,
      },
    });

    return NextResponse.json({ message: 'Kullanıcı şifresi başarıyla güncellendi.' });

  } catch (error) {
    console.error("Admin şifre sıfırlama hatası:", error);
    return NextResponse.json({ message: 'Şifre güncellenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}