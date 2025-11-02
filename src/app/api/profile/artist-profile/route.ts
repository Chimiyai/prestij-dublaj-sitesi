// src/app/api/profile/artist-profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

// Kullanıcıdan gelecek veriyi doğrulamak için Zod şeması
const updateArtistProfileSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır."),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug geçersiz formatta.").optional().nullable(),
  bio: z.string().max(2000, "Bio en fazla 2000 karakter olabilir.").optional().nullable(),
  siteRole: z.string().max(100).optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  // Sosyal medya linkleri
  websiteUrl: z.string().url().or(z.literal('')).optional().nullable(),
  twitterUrl: z.string().url().or(z.literal('')).optional().nullable(),
  instagramUrl: z.string().url().or(z.literal('')).optional().nullable(),
  youtubeUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1. Güvenlik: Kullanıcı giriş yapmış mı ve bir sanatçı profili var mı?
  if (!session?.user?.artistProfileId) {
    return NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
  }

  try {
    const artistProfileId = session.user.artistProfileId;
    const body = await request.json();
    const validation = updateArtistProfileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Geçersiz veri.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    // Slug benzersizlik kontrolü
    if (validation.data.slug) {
        const existingSlug = await prisma.dubbingArtist.findFirst({
            where: {
                slug: validation.data.slug,
                NOT: { id: artistProfileId }
            }
        });
        if(existingSlug) {
            return NextResponse.json({ message: 'Bu slug zaten kullanılıyor.' }, { status: 409 });
        }
    }
    
    // 2. Veritabanını güncelle
    const updatedArtist = await prisma.dubbingArtist.update({
      where: {
        id: artistProfileId,
        // Ek güvenlik: Sadece bu kullanıcıya aitse güncelle
        userId: parseInt(session.user.id) 
      },
      data: {
        ...validation.data,
        // Boş stringleri null'a çevir
        websiteUrl: validation.data.websiteUrl || null,
        twitterUrl: validation.data.twitterUrl || null,
        instagramUrl: validation.data.instagramUrl || null,
        youtubeUrl: validation.data.youtubeUrl || null,
      },
    });

    return NextResponse.json(updatedArtist);

  } catch (error) {
    console.error("Sanatçı profili güncelleme hatası:", error);
    return NextResponse.json({ message: 'Profil güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}