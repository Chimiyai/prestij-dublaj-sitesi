// src/app/api/admin/dialogues/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const { characterId, dialogueText } = await request.json();
    if (!characterId || !dialogueText || typeof dialogueText !== 'string' || dialogueText.trim() === '') {
      return NextResponse.json({ message: 'Karakter ID ve diyalog metni gereklidir.' }, { status: 400 });
    }

    const newDialogue = await prisma.characterDialogue.create({
      data: {
        characterId: parseInt(characterId),
        dialogueText: dialogueText,
      }
    });

    return NextResponse.json(newDialogue, { status: 201 });

  } catch (error) {
    console.error("Yeni diyalog oluşturulurken hata:", error);
    return NextResponse.json({ message: "İşlem sırasında bir sunucu hatası oluştu." }, { status: 500 });
  }
}