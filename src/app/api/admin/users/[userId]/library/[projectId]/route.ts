// src/app/api/admin/users/[userId]/library/[projectId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string, projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const userId = parseInt(params.userId, 10);
  const projectId = parseInt(params.projectId, 10);

  if (isNaN(userId) || isNaN(projectId)) {
    return NextResponse.json({ message: 'Geçersiz ID.' }, { status: 400 });
  }

  try {
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
    console.error("Kütüphaneden kaldırma hatası:", error);
    return NextResponse.json({ message: 'Sunucu hatası.' }, { status: 500 });
  }
}