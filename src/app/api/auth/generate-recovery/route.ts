// src/app/api/auth/generate-recovery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { getAuthenticatedUser } from '@/lib/authUtils'; // Bu dosyayı bir sonraki adımda oluşturacağız

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    // 1. Güçlü, rastgele bir kod üret
    const recoveryCode = `PRESTIJ-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    // Örnek Çıktı: PRESTIJ-A1B2-C3D4-E5F6
    
    // 2. Kodu veritabanına kaydetmeden önce hash'le
    const salt = await bcrypt.genSalt(10);
    const recoveryCodeHash = await bcrypt.hash(recoveryCode, salt);
    
    // 3. Kullanıcının veritabanındaki kaydını güncelle
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        recoveryCodeHash: recoveryCodeHash,
      },
    });

    // 4. Hash'lenmemiş, orijinal kodu kullanıcıya SADECE BİR KEZ göster
    return NextResponse.json({
      message: 'Yeni kurtarma kodunuz başarıyla oluşturuldu. Lütfen bu kodu güvenli bir yere kaydedin. Bu pencereyi kapattıktan sonra bu kodu bir daha göremeyeceksiniz!',
      recoveryCode: recoveryCode,
    });

  } catch (error) {
    console.error("Kurtarma kodu oluşturma hatası:", error);
    return NextResponse.json({ message: 'Kod oluşturulurken bir hata oluştu.' }, { status: 500 });
  }
}