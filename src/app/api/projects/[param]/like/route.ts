// src/app/api/projects/[param]/like/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

interface UserPayload {
  userId: number;
}

// YENİ HİBRİT KİMLİK DOĞRULAMA FONKSİYONU
async function getUserId(request: NextRequest): Promise<number | null> {
  // 1. Yöntem: Bearer Token'ı kontrol et (Masaüstü Uygulaması için)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
      return decoded.userId;
    } catch (e) {
      // Geçersiz token ise null dön, session'ı denemeye devam etme
      return null; 
    }
  }

  // 2. Yöntem: Token yoksa, NextAuth Session Cookie'sini kontrol et (Web Sitesi için)
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return parseInt(session.user.id);
  }

  // Hiçbir yöntem işe yaramazsa
  return null;
}

// Projeyi beğenme (like)
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param;
  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) { return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 }); }

  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {
    // Kullanıcı bu projeyi daha önce dislike etmiş mi diye kontrol et
    const existingDislike = await prisma.projectDislike.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });

    const result = await prisma.$transaction(async (tx) => {
      let initialDislikeCountAdjustment = 0;

      // Eğer dislike varsa, önce onu kaldır ve dislikeCount'u azalt
      if (existingDislike) {
        await tx.projectDislike.delete({
          where: { id: existingDislike.id },
        });
        initialDislikeCountAdjustment = -1; // dislikeCount bir azalacak
      }

      // Yeni like ekle
      const newLike = await tx.projectLike.create({
        data: {
          userId,
          projectId,
        },
      });

      // Projenin likeCount'unu artır, dislikeCount'u (eğer değiştiyse) güncelle
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: {
          likeCount: { increment: 1 },
          ...(initialDislikeCountAdjustment !== 0 && { // Sadece dislike kaldırıldıysa dislikeCount'u güncelle
            dislikeCount: { increment: initialDislikeCountAdjustment }
          }),
        },
        select: { likeCount: true, dislikeCount: true }, // Güncel sayıları döndür
      });

      return { newLike, counts: updatedProject };
    });

    return NextResponse.json(
      {
        message: 'Proje beğenildi.',
        like: result.newLike,
        likeCount: result.counts.likeCount,
        dislikeCount: result.counts.dislikeCount, // Dislike kaldırıldıysa bu da güncellenir
      },
      { status: 201 }
    );

  } catch (error: any) {
    if (error.code === 'P2002') { // Unique constraint (zaten like edilmiş)
      return NextResponse.json({ message: 'Bu proje zaten beğenilmiş.' }, { status: 409 });
    }
    console.error('Like hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}

// Beğeniyi (like) geri alma
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param;
  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) { return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 }); }

  const userId = await getUserId(request);
  if (!userId) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  try {

    const result = await prisma.$transaction(async (tx) => {
      // Öncelikle ilgili like kaydını silmemiz gerekiyor.
      // Eğer bu işlem hata verirse (örn. P2025 - Kayıt bulunamadı), zaten işlem başarısız olur.
      const deletedLike = await tx.projectLike.delete({
        where: {
          userId_projectId: { userId, projectId },
        },
      });

      // Ardından projenin likeCount'unu azalt.
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { likeCount: { decrement: 1 } },
        select: { likeCount: true }, // Sadece güncel like sayısını döndür
      });
      return { deletedLike, counts: updatedProject };
    });
    
    return NextResponse.json(
      {
        message: 'Beğeni geri alındı.',
        likeCount: result.counts.likeCount,
      },
      { status: 200 }
    );

  } catch (error: any){
    if (error.code === 'P2025') { // Kayıt bulunamadı
      return NextResponse.json({ message: 'Kaldırılacak beğeni bulunamadı.' }, { status: 404 });
    }
    console.error('Like geri alma hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}