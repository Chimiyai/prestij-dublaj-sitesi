// src/app/api/projects/[param]/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: number;
}

const createCommentSchema = z.object({
  content: z.string().min(3, 'Yorum en az 3 karakter olmalı.').max(1000, 'Yorum en fazla 1000 karakter olabilir.'),
});

const getCommentsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
});

// --- HATA DÜZELTME 1: Fonksiyon imzasını çalışan örnekteki gibi Promise ile sardık. ---
export async function POST(request: NextRequest, { params }: { params: Promise<{ param: string }> }) {
  try {
    // --- HATA DÜZELTME 2: Parametreler artık bir Promise olduğu için `await` ile çözüyoruz. ---
    const resolvedParams = await params;
    const projectIdString = resolvedParams.param;

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Yetkilendirme başlığı (Authorization header) eksik veya geçersiz.' }, { status: 401 });
    }

    let userId: number;
    try {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
      userId = decoded.userId;
    } catch (e) {
      return NextResponse.json({ message: 'Geçersiz veya süresi dolmuş token.' }, { status: 401 });
    }

    const projectId = parseInt(projectIdString, 10);
    if (isNaN(projectId)) {
      return NextResponse.json({ message: 'Geçersiz proje ID formatı.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = createCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Geçersiz yorum verisi.', errors: validation.error.issues }, { status: 400 });
    }

    const { content } = validation.data;

    const projectExists = await prisma.project.findUnique({ where: { id: projectId } });
    if (!projectExists) {
      return NextResponse.json({ message: 'Yorum yapılacak proje bulunamadı.' }, { status: 404 });
    }

    const newComment = await prisma.comment.create({
      data: {
        content,
        projectId: projectId,
        userId: userId,
      },
      include: {
        user: {
          select: { id: true, username: true, profileImagePublicId: true, role: true },
        },
      },
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    return NextResponse.json({ message: 'Yorum eklenirken bir hata oluştu.' }, { status: 500 });
  }
}


// --- HATA DÜZELTME 1: Fonksiyon imzasını çalışan örnekteki gibi Promise ile sardık. ---
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ param: string }> }
) {
  // --- HATA DÜZELTME 2: Parametreler artık bir Promise olduğu için `await` ile çözüyoruz. ---
  const resolvedParams = await params;
  const projectIdString = resolvedParams.param;

  if (!projectIdString) {
      return NextResponse.json({ message: 'Eksik proje parametresi.' }, { status: 400 });
  }

  const projectId = parseInt(projectIdString, 10);
  if (isNaN(projectId)) {
    return NextResponse.json({ message: 'Geçersiz proje ID formatı.' }, { status: 400 });
  }

  const { searchParams } = request.nextUrl; 
  const queryParseResult = getCommentsQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!queryParseResult.success) {
    return NextResponse.json({ message: 'Geçersiz sorgu parametreleri.', errors: queryParseResult.error.issues }, { status: 400 });
  }

  const { page, limit } = queryParseResult.data;
  const skip = (page - 1) * limit;

  try {
    const comments = await prisma.comment.findMany({
      where: { projectId: projectId },
      include: {
        user: {
          select: { id: true, username: true, profileImagePublicId: true, role: true, },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalComments = await prisma.comment.count({
      where: { projectId: projectId },
    });

    return NextResponse.json({
      comments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      totalComments,
    });
  } catch (error) {
    console.error('Yorumları getirme hatası:', error);
    return NextResponse.json({ message: 'Yorumlar getirilirken bir hata oluştu.' }, { status: 500 });
  }
}