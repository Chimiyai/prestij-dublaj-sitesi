// src/app/api/admin/dialogues/[dialogueId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ dialogueId: string }> }
) {
  const { dialogueId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const parsedDialogueId = parseInt(dialogueId);
    if (isNaN(parsedDialogueId)) {
      return NextResponse.json({ message: 'Geçersiz Diyalog ID.' }, { status: 400 });
    }

    await prisma.characterDialogue.delete({
      where: { id: parsedDialogueId },
    });

    return new NextResponse(null, { status: 204 }); // Başarılı, içerik yok

  } catch (error) {
    console.error("Diyalog silinirken hata:", error);
    return NextResponse.json({ message: "İşlem sırasında bir sunucu hatası oluştu." }, { status: 500 });
  }
}