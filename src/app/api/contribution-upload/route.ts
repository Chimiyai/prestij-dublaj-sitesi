// src/app/api/contribution-upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Dosya yüklemek için giriş yapmalısınız.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('audioFile') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const characterName = formData.get('characterName') as string | null;

    if (!file || !projectId || !characterName) {
      return NextResponse.json({ message: 'Eksik parametreler (dosya, proje ID, karakter adı).' }, { status: 400 });
    }

    // Güvenlik: Sadece izin verilen ses formatları
    if (!['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(file.type)) {
      return NextResponse.json({ message: 'Geçersiz dosya tipi. Sadece .mp3, .wav, .ogg kabul edilir.' }, { status: 400 });
    }
    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'Dosya boyutu en fazla 10MB olabilir.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Benzersiz ve anlamlı bir public_id oluşturalım
    const safeCharName = characterName.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const publicId = `project_${projectId}/${safeCharName}_${session.user.id}_${Date.now()}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'video', // Cloudinary ses dosyalarını 'video' resource tipi altında saklar
        public_id: publicId,
        folder: 'voice_submissions', // Ana klasör
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    return NextResponse.json({
      message: 'Ses dosyası başarıyla yüklendi.',
      publicId: (result as any).public_id,
      secureUrl: (result as any).secure_url,
    });

  } catch (error: any) {
    console.error("Ses katkısı yükleme API hatası:", error);
    return NextResponse.json({ message: error.message || 'Dosya yüklenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}