// src/app/api/profile/update-details/route.ts (NİHAİ VE TAM HALİ)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

// Gelen veriyi doğrulamak için esnek bir Zod şeması
// Tüm alanları `.optional()` olarak işaretliyoruz ki
// formdan sadece güncellenmek istenen alanlar gönderilebilsin.
const updateDetailsSchema = z.object({
  firstName: z.string().min(1, "İsim boş olamaz.").max(50).optional(),
  lastName: z.string().min(1, "Soyisim boş olamaz.").max(50).optional(),
  bio: z.string().max(500, "Biyografi 500 karakteri geçemez.").optional(),
  // Resim ID'leri için de doğrulama ekleyebiliriz
  profileImagePublicId: z.string().optional(),
  bannerImagePublicId: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  // 1. Güvenlik: Oturumu kontrol et
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const body = await request.json();

    // 2. Veriyi Doğrula
    const parsedBody = updateDetailsSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: parsedBody.error.flatten() }, { status: 400 });
    }
    
    // Zod'dan gelen doğrulanmış ve temizlenmiş veriyi al
    const dataToUpdate = parsedBody.data;

    // Eğer gönderilen veri boşsa, bir şey yapma
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'Güncellenecek veri bulunamadı.' }, { status: 400 });
    }

    // 3. Veritabanını Güncelle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
    
    // Güvenlik: Şifre gibi hassas verileri frontend'e geri gönderme
    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json({ message: "Profil güncellenirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}