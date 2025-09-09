// src/app/api/admin/characters/[characterId]/volunteer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ characterId: string }> }
) {
  const { characterId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const parsedCharacterId = parseInt(characterId);
    if (isNaN(parsedCharacterId)) {
      return NextResponse.json({ message: 'Geçersiz Karakter ID.' }, { status: 400 });
    }

    const { isVolunteerNeeded } = await request.json();
    if (typeof isVolunteerNeeded !== 'boolean') {
      return NextResponse.json({ message: 'Geçersiz "isVolunteerNeeded" değeri.' }, { status: 400 });
    }

    const updatedCharacter = await prisma.projectCharacter.update({
      where: { id: parsedCharacterId },
      data: { isVolunteerNeeded: isVolunteerNeeded },
    });

    return NextResponse.json(updatedCharacter);

  } catch (error) {
    console.error("Karakter gönüllü durumu güncellenirken hata:", error);
    return NextResponse.json({ message: "İşlem sırasında bir sunucu hatası oluştu." }, { status: 500 });
  }
}