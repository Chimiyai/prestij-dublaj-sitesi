// src/app/api/projects/[param]/dislike/route.ts
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

// Projeyi beğenmeme (dislike)
export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param; // Çözülmüş parametreyi kullan
  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) { return NextResponse.json({ message: 'Geçersiz proje ID.' }, { status: 400 }); }
  
  const userId = await getUserId(request);
  if (!userId) { return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 }); }

  try {
    const existingLike = await prisma.projectLike.findUnique({ where: { userId_projectId: { userId, projectId } } });
    const result = await prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.projectLike.delete({ where: { id: existingLike.id } });
        await tx.project.update({ where: { id: projectId }, data: { likeCount: { decrement: 1 } } });
      }
      const newDislike = await tx.projectDislike.create({ data: { userId, projectId } });
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { dislikeCount: { increment: 1 } },
        select: { likeCount: true, dislikeCount: true },
      });
      return { newDislike, counts: updatedProject };
    });
    return NextResponse.json({ message: 'Proje beğenilmedi olarak işaretlendi.', dislike: result.newDislike, likeCount: result.counts.likeCount, dislikeCount: result.counts.dislikeCount, }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') { return NextResponse.json({ message: 'Bu proje zaten beğenilmedi olarak işaretlenmiş.' }, { status: 409 }); }
    console.error('Dislike hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}

// Beğenmemeyi (dislike) geri alma
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
      await tx.projectDislike.delete({ where: { userId_projectId: { userId, projectId } } });
      const updatedProject = await tx.project.update({
        where: { id: projectId },
        data: { dislikeCount: { decrement: 1 } },
        select: { dislikeCount: true },
      });
      return { counts: updatedProject };
    });
    return NextResponse.json({ message: 'Beğenmeme durumu geri alındı.', dislikeCount: result.counts.dislikeCount, }, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') { return NextResponse.json({ message: 'Kaldırılacak beğenmeme durumu bulunamadı.' }, { status: 404 }); }
    console.error('Dislike geri alma hatası:', error);
    return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
  }
}