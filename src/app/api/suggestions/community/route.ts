// src/app/api/suggestions/community/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const createSuggestionSchema = z.object({
  gameTitle: z.string().min(2, "Oyun adı en az 2 karakter olmalıdır.").max(150),
  steamUrl: z.string().url("Geçerli bir Steam URL'i girmeniz zorunludur.").min(1, "Steam URL'i zorunludur."),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Öneri eklemek için giriş yapmalısınız.' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const body = await request.json();

    const parsedBody = createSuggestionSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: parsedBody.error.flatten() }, { status: 400 });
    }
    
    const { gameTitle, steamUrl } = parsedBody.data;

    // <<< DEĞİŞİKLİK: findUnique yerine findFirst kullanıyoruz <<<
    // findFirst, @unique olmayan alanlarda da arama yapabilir ve daha esnektir.
    const existingSuggestion = await prisma.communitySuggestion.findFirst({
        where: { 
            steamUrl: steamUrl,
            status: 'ACTIVE' // Sadece aktif olanlar arasında arama yapalım
        }
    });
    // --------------------------------------------------------

    if (existingSuggestion) {
      // EĞER ÖNERİ VARSA: Sadece oy ver
      const existingVote = await prisma.communitySuggestionVote.findUnique({
        where: { userId_suggestionId: { userId, suggestionId: existingSuggestion.id } }
      });

      if (existingVote) {
        return NextResponse.json({ 
          message: `Bu oyun zaten önerilmiş ve siz daha önce oy vermişsiniz.`,
          suggestion: existingSuggestion
        }, { status: 200 });
      }
      
      await prisma.communitySuggestionVote.create({
        data: { userId, suggestionId: existingSuggestion.id }
      });
      
      return NextResponse.json({
        message: 'Bu oyun zaten önerilmişti. İsteğiniz mevcut öneriye eklendi!',
        suggestion: existingSuggestion
      }, { status: 200 });

    } else {
      // EĞER ÖNERİ YOKSA: Yeni bir öneri oluştur
      const newSuggestion = await prisma.communitySuggestion.create({
        data: {
          gameTitle: gameTitle.trim(),
          steamUrl: steamUrl,
          submittedById: userId,
        }
      });
  
      await prisma.communitySuggestionVote.create({
          data: {
              userId: userId,
              suggestionId: newSuggestion.id,
          }
      });
  
      return NextResponse.json({
        message: 'Yeni öneriniz başarıyla eklendi!',
        suggestion: newSuggestion
      }, { status: 201 });
    }

  } catch (error) {
    console.error("Topluluk önerisi işlenirken hata:", error);
    return NextResponse.json({ message: "Öneri işlenirken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
