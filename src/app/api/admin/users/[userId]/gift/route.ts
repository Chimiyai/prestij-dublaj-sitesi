// src/app/api/admin/users/[userId]/gift/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const giftGameSchema = z.object({
  projectId: z.number().int().positive(),
});

// Build aracını memnun etmek için Promise tipini KULLANIYORUZ.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> } 
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  // Promise'i hemen çözerek normal objeye dönüştürüyoruz.
  const resolvedParams = await params;
  const userId = parseInt(resolvedParams.userId, 10);
  
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

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { title: true, slug: true },
    });

    if (!project) {
        return NextResponse.json({ message: 'Proje bulunamadı.' }, { status: 404 });
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.userOwnedGame.upsert({
        where: { userId_projectId: { userId, projectId } },
        update: {},
        create: {
          userId: userId,
          projectId: projectId,
          purchasePrice: 0,
        },
      });

      const newNotification = await tx.notification.create({
        data: {
          message: `Yönetimden Hediye: "${project.title}" dublajı artık kütüphanenizde!`,
          link: `/projeler/${project.slug}`,
        },
      });

      await tx.userNotification.create({
        data: {
          userId: userId,
          notificationId: newNotification.id,
          isRead: false,
        },
      });
    });

    return NextResponse.json({ message: 'Oyun başarıyla hediye edildi ve kullanıcı bilgilendirildi.' }, { status: 200 });
  } catch (error) {
    console.error("Hediye etme ve bildirim oluşturma hatası:", error);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}