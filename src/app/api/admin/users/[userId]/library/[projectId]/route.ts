// src/app/api/admin/users/[userId]/library/[projectId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Build aracını memnun etmek için Promise tipini KULLANIYORUZ.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string, projectId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  // Promise'i hemen çözerek normal objeye dönüştürüyoruz.
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.userId, 10);
  const projectId = parseInt(resolvedParams.projectId, 10);

  if (isNaN(userId) || isNaN(projectId)) {
    return NextResponse.json({ message: 'Geçersiz ID.' }, { status: 400 });
  }

  try {
    // `userId_projectId` Prisma'da birleşik bir unique alan olduğu için
    // bu şekilde kullanmak doğrudur.
    await prisma.userOwnedGame.delete({
      where: {
        userId_projectId: {
          userId: userId,
          projectId: projectId,
        },
      },
    });

    return NextResponse.json({ message: 'Oyun kütüphaneden kaldırıldı.' }, { status: 200 });
  } catch (error) {
    // Prisma, kayıt bulunamadığında bir hata fırlatır. Bunu yakalayıp
    // daha dostane bir mesaj döndürebiliriz.
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2025') {
      return NextResponse.json({ message: 'Kayıt bulunamadı. Oyun zaten kullanıcının kütüphanesinde olmayabilir.' }, { status: 404 });
    }
    
    console.error("Kütüphaneden kaldırma hatası:", error);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}
