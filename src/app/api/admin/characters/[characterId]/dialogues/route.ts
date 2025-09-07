// src/app/api/admin/characters/[characterId]/dialogues/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { characterId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const characterId = parseInt(params.characterId);
    if (isNaN(characterId)) {
      return NextResponse.json({ message: 'Geçersiz Karakter ID.' }, { status: 400 });
    }

    const dialogues = await prisma.characterDialogue.findMany({
      where: { characterId: characterId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(dialogues);

  } catch (error) {
    console.error("Diyaloglar listelenirken hata:", error);
    return NextResponse.json({ message: "İşlem sırasında bir sunucu hatası oluştu." }, { status: 500 });
  }
}