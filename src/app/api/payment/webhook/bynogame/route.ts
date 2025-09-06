// src/app/api/payment/webhook/bynogame/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Bynogame Webhook Geldi:", body);

    // Bynogame'den gelmesini beklediğimiz alanlar (dokümantasyona göre değişebilir)
    const { order_id, transaction_id, status, signature } = body;
    
    if (!order_id || !transaction_id || !status || !signature) {
        return NextResponse.json({ message: 'Eksik parametreler.' }, { status: 400 });
    }

    // 1. İmzayı Doğrulama (EN ÖNEMLİ GÜVENLİK ADIMI)
    const bynogameApiSecret = process.env.BYNOGAME_API_SECRET;
    if (!bynogameApiSecret) {
        console.error("BYNOGAME_API_SECRET ortam değişkeni ayarlanmamış.");
        return NextResponse.json({ message: 'Sunucu yapılandırma hatası.' }, { status: 500 });
    }

    // Bynogame'in imza oluşturma algoritması dokümantasyonlarında belirtilmelidir.
    // Bu sadece yaygın bir örnektir (HMAC-SHA256).
    const dataToVerify = `${order_id}${transaction_id}${status}${bynogameApiSecret}`;
    const expectedSignature = crypto
      .createHmac('sha256', bynogameApiSecret)
      .update(dataToVerify)
      .digest('hex');

    if (signature !== expectedSignature) {
        console.warn("Geçersiz Bynogame imzası!", { received: signature, expected: expectedSignature });
        return NextResponse.json({ message: 'Geçersiz imza.' }, { status: 403 });
    }
    
    // 2. İşlemin Başarılı Olduğunu Kontrol Etme
    if (status === 'success') {
        const suggestionId = parseInt(order_id);
        if (isNaN(suggestionId)) {
            return NextResponse.json({ message: 'Geçersiz sipariş ID formatı.' }, { status: 400 });
        }

        // 3. Veritabanını Güncelleme
        const updatedSuggestion = await prisma.supportSuggestion.update({
            where: {
                id: suggestionId,
                // Ekstra güvenlik: Sadece hala beklemede olanları güncelle
                status: 'PENDING',
            },
            data: {
                status: 'COMPLETED',
                transactionId: transaction_id.toString(), // Gelen transaction ID'sini kaydet
            }
        });

        if (updatedSuggestion) {
            console.log(`Destekli öneri #${suggestionId} başarıyla 'COMPLETED' olarak güncellendi.`);
            // İleride buraya başarılı ödeme sonrası bir e-posta gönderme veya
            // admin'e bildirim gönderme gibi işlemler eklenebilir.
        } else {
             console.warn(`Güncellenecek PENDING durumunda öneri #${suggestionId} bulunamadı. Muhtemelen daha önce işlenmiş.`);
        }
    } else {
        // Ödeme başarısız olduysa veya iptal edildiyse, ilgili kaydı 'FAILED' olarak güncelleyebiliriz.
        await prisma.supportSuggestion.updateMany({
            where: { id: parseInt(order_id) },
            data: { status: 'FAILED' }
        });
        console.log(`Destekli öneri #${order_id} durumu '${status}' olarak güncellendi.`);
    }

    // 4. Bynogame'e Başarılı Yanıtı Gönderme
    // Bynogame'e her şeyin yolunda olduğunu bildirmek için genellikle 200 OK yanıtı yeterlidir.
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error("Bynogame webhook hatası:", error);
    // Hata durumunda da genellikle 500 hatası döndürmek Bynogame'in tekrar denemesini tetikleyebilir.
    // Dokümantasyonlarına bakmak en doğrusu.
    return NextResponse.json({ message: "Webhook işlenirken bir hata oluştu.", error: error.message }, { status: 500 });
  }
}