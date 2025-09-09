// src/app/api/suggestions/community/[suggestionId]/vote/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ suggestionId: string }> }
) {
  const { suggestionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Oy vermek için giriş yapmalısınız.' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const parsedSuggestionId = parseInt(suggestionId);

    if (isNaN(parsedSuggestionId)) {
      return NextResponse.json({ message: 'Geçersiz Öneri ID.' }, { status: 400 });
    }

    // Prisma'nın unique constraint'i sayesinde, aynı kullanıcı aynı öneriye
    // ikinci kez oy veremez. Eğer `create` işlemi başarısız olursa,
    // bu, kullanıcının daha önce oy verdiği anlamına gelir.
    await prisma.communitySuggestionVote.create({
      data: {
        userId: userId,
        suggestionId: parsedSuggestionId,
      }
    });

    return NextResponse.json({ message: 'Oy başarıyla eklendi.' }, { status: 201 });

  } catch (error: any) {
    // Prisma'nın P2002 kodu, unique constraint hatasıdır (yani daha önce oy vermiş).
    if (error.code === 'P2002') {
        return NextResponse.json({ message: 'Bu öneriye zaten oy verdiniz.' }, { status: 409 });
    }

    console.error("Oy verme hatası:", error);
    return NextResponse.json({ message: "Oy verilirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}