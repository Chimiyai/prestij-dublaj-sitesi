// src/app/api/library/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Eğer kullanıcı giriş yapmamışsa, yetkilendirme hatası döndür
    if (!token || !token.sub) {
      return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
    }

    const userId = parseInt(token.sub);

    // Kullanıcının sahip olduğu oyunları (UserOwnedGame) bul ve ilişkili proje verilerini de çek
    const ownedGames = await prisma.userOwnedGame.findMany({
      where: {
        userId: userId,
      },
      include: {
        // Her bir sahiplik kaydına karşılık gelen proje detaylarını da getir
        project: true,
      },
      orderBy: {
        purchasedAt: 'desc', // En son satın alınana göre sırala
      }
    });

    // Sonuç olarak sadece proje objelerinden oluşan bir dizi döndür
    const projects = ownedGames.map(ownedGame => ownedGame.project);

    return NextResponse.json(projects);

  } catch (error) {
    console.error('[API_LIBRARY_ERROR]', error);
    return NextResponse.json({ message: 'Kütüphane verileri alınırken bir hata oluştu.' }, { status: 500 });
  }
}