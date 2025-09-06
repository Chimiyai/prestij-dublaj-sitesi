// src/app/api/suggestions/support/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const createSupportSuggestionSchema = z.object({
  gameTitle: z.string().min(2, "Oyun adı zorunludur.").max(150),
  steamUrl: z.string().url("Geçerli bir Steam URL'i zorunludur.").min(1),
  amount: z.number().min(1, "Destek miktarı en az 1 TRY olmalıdır."),
  notes: z.string().max(500, "Notlar en fazla 500 karakter olabilir.").optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Destek vermek için giriş yapmak zorunlu olmayabilir.
  // Eğer giriş yapmamışsa, isimsiz bir destek olarak kaydedebiliriz.
  const userId = session?.user?.id ? parseInt(session.user.id) : null;
  const supporterName = session?.user?.username || 'Anonim Destekçi';

  try {
    const body = await request.json();

    const parsedBody = createSupportSuggestionSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: parsedBody.error.flatten() }, { status: 400 });
    }
    
    const { gameTitle, steamUrl, amount, notes } = parsedBody.data;

    // 1. Veritabanına PENDING (Beklemede) olarak ön kayıt oluştur
    const pendingSuggestion = await prisma.supportSuggestion.create({
      data: {
        gameTitle: gameTitle,
        steamUrl: steamUrl,
        supportAmount: amount,
        notes: notes,
        supporterName: supporterName,
        userId: userId,
        status: 'PENDING',
        paymentProvider: 'Bynogame',
        // transactionId henüz yok, webhook'tan gelecek
      }
    });

    // 2. Bynogame'e yönlendirmek için URL oluştur
    // DİKKAT: Bu URL yapısı Bynogame'in dokümantasyonuna göre düzenlenmelidir.
    // Bu sadece bir ÖRNEKTİR.
    // `custom` veya `order_id` gibi bir parametre ile bizim suggestion ID'mizi göndermeliyiz ki
    // webhook'tan geri geldiğinde hangi siparişi güncelleyeceğimizi bilelim.
    const bynogameBaseUrl = 'https://www.bynogame.com/tr/destekle/prestij-dublaj'; // Sizin Bynogame bağış sayfanızın adresi
    const params = new URLSearchParams({
        game: gameTitle,
        amount: amount.toString(),
        order_id: pendingSuggestion.id.toString(), // <<< EN ÖNEMLİ KISIM
        // Bynogame `return_url` veya `callback_url` destekliyorsa, buraya eklenmeli
    });

    const bynogameUrl = `${bynogameBaseUrl}?${params.toString()}`;

    // 3. Frontend'e yönlendirilecek URL'i gönder
    return NextResponse.json({ bynogameUrl: bynogameUrl }, { status: 201 });

  } catch (error) {
    console.error("Destekli öneri oturumu oluşturma hatası:", error);
    return NextResponse.json({ message: "Ödeme oturumu oluşturulurken bir sunucu hatası oluştu." }, { status: 500 });
  }
}