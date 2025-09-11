// src/app/api/admin/users/[userId]/gift/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const giftGameSchema = z.object({
  projectId: z.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const userId = parseInt(params.userId, 10);
  if (isNaN(userId)) {
    return NextResponse.json({ message: 'Geçersiz kullanıcı ID.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = giftGameSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 });
    }
    const { projectId } = parsed.data;

    // --- DEĞİŞİKLİK 1: Projenin adını ve slug'ını da çekiyoruz ---
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, slug: true }, // title ve slug eklendi
    });

    if (!project) {
        return NextResponse.json({ message: 'Proje bulunamadı.' }, { status: 404 });
    }
    
    // Prisma'nın $transaction özelliğini kullanarak iki işlemi de güvenle yapalım
    await prisma.$transaction(async (tx) => {
      // 1. Kullanıcının kütüphanesine ekle
      await tx.userOwnedGame.upsert({
        where: { userId_projectId: { userId, projectId } },
        update: {},
        create: {
          userId: userId,
          projectId: projectId,
          purchasePrice: 0, // Hediye
        },
      });

      // --- YENİLİK: Bildirim oluşturma ---
      // 2. Yeni bir ana bildirim oluştur
      const newNotification = await tx.notification.create({
        data: {
          // Örn: "Yönetimden Hediye: The Witcher 3 dublajı artık kütüphanenizde!"
          message: `Yönetimden Hediye: "${project.title}" dublajı artık kütüphanenizde!`,
          link: `/projeler/${project.slug}`, // Bildirimden projeye link
        },
      });

      // 3. Bu bildirimi ilgili kullanıcıyla eşleştir
      await tx.userNotification.create({
        data: {
          userId: userId,
          notificationId: newNotification.id,
          isRead: false, // Başlangıçta okunmamış
        },
      });
    });

    return NextResponse.json({ message: 'Oyun başarıyla hediye edildi ve kullanıcı bilgilendirildi.' }, { status: 200 });
  } catch (error) {
    console.error("Hediye etme ve bildirim oluşturma hatası:", error);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}