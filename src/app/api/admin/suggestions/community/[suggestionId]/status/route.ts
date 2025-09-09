// src/app/api/admin/suggestions/community/[suggestionId]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole, SuggestionStatus } from '@prisma/client';
import { z } from 'zod';

// Gelen veriyi doğrulamak için Zod şeması
const updateStatusSchema = z.object({
  status: z.nativeEnum(SuggestionStatus), // Prisma'daki enum'u doğrudan kullan
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const { suggestionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const parsedSuggestionId = parseInt(suggestionId);
    if (isNaN(parsedSuggestionId)) {
      return NextResponse.json({ message: 'Geçersiz Öneri ID.' }, { status: 400 });
    }

    const body = await request.json();
    const parsedBody = updateStatusSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz durum verisi.' }, { status: 400 });
    }

    const { status } = parsedBody.data;

    // Önerinin durumunu güncelle
    const updatedSuggestion = await prisma.communitySuggestion.update({
      where: { id: parsedSuggestionId },
      data: { status: status },
    });

    return NextResponse.json(updatedSuggestion, { status: 200 });

  } catch (error) {
    console.error("Öneri durumu güncellenirken hata:", error);
    return NextResponse.json({ message: "Öneri durumu güncellenirken bir hata oluştu." }, { status: 500 });
  }
}