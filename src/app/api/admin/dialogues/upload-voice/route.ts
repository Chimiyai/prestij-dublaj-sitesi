// src/app/api/admin/dialogues/upload-voice/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('audioFile') as File | null;
    const dialogueId = formData.get('dialogueId') as string | null;

    if (!file || !dialogueId) {
      return NextResponse.json({ message: 'Eksik parametreler (dosya, diyalog ID).' }, { status: 400 });
    }
    
    // Güvenlik kontrolleri (tip, boyut)
    if (!['audio/mpeg', 'audio/wav', 'audio/ogg'].includes(file.type)) {
        return NextResponse.json({ message: 'Geçersiz dosya tipi.' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json({ message: 'Dosya boyutu çok büyük.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // publicId'yi diyalog ID'sine göre oluşturalım ki kolay bulunsun
    const publicId = `dialogue_${dialogueId}_ref_${Date.now()}`;

    // Cloudinary'e yükle
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'video',
        public_id: publicId,
        folder: 'dialogue_references',
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });
    
    const uploadedFileUrl = (result as any).secure_url;
    if (!uploadedFileUrl) {
        throw new Error("Cloudinary'den dosya URL'i alınamadı.");
    }

    // Veritabanındaki ilgili diyaloğu güncelle
    const updatedDialogue = await prisma.characterDialogue.update({
      where: { id: parseInt(dialogueId) },
      data: { originalVoiceUrl: uploadedFileUrl }, // <<< DOĞRUDAN URL'i KAYDEDİYORUZ
    });

    return NextResponse.json(updatedDialogue);

  } catch (error: any) {
    console.error("Referans ses yükleme hatası:", error);
    return NextResponse.json({ message: error.message || 'Dosya yüklenirken bir hata oluştu.' }, { status: 500 });
  }
}