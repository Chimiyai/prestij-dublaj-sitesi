// src/app/api/projects/[param]/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

interface UserPayload { userId: number; }

// Hibrit kimlik doğrulama fonksiyonu
async function getUserId(request: NextRequest): Promise<number | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
      return decoded.userId;
    } catch (e) { return null; }
  }
  const session = await getServerSession(authOptions);
  return session?.user?.id ? parseInt(session.user.id) : null;
}

// Projeyi favorilere ekleme
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param;
  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) { return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 }); }

  const userId = await getUserId(request);
  if (!userId) { return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 }); }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newFavorite = await tx.projectFavorite.create({ data: { userId, projectId } });
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { favoriteCount: { increment: 1 } },
        select: { favoriteCount: true },
      });
      return { newFavorite, counts: updatedProject };
    });
    return NextResponse.json({ message: 'Proje favorilere eklendi.', favorite: result.newFavorite, favoriteCount: result.counts.favoriteCount, }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') { return NextResponse.json({ message: 'Bu proje zaten favorilerinizde.' }, { status: 409 }); }
    console.error('Favorilere ekleme hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}

// Projeyi favorilerden çıkarma
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param;
  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) { return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 }); }

  const userId = await getUserId(request);
  if (!userId) { return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 }); }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.projectFavorite.delete({ where: { userId_projectId: { userId, projectId } } });
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { favoriteCount: { decrement: 1 } },
        select: { favoriteCount: true },
      });
      return { counts: updatedProject };
    });
    return NextResponse.json({ message: 'Proje favorilerden çıkarıldı.', favoriteCount: result.counts.favoriteCount, }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') { return NextResponse.json({ message: 'Favorilerden çıkarılacak proje bulunamadı.' }, { status: 404 }); }
    console.error('Favorilerden çıkarma hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}