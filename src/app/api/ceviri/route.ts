// src/app/api/ceviri/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  // --- YETKİ KONTROLÜ BAŞLANGIÇ ---
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
    return NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
  }
  // --- YETKİ KONTROLÜ BİTİŞ ---

  const { content, title, projectId } = await request.json();
const newSnippet = await prisma.textSnippet.create({
  data: {
    content,
    title: title || "İsimsiz Metin",
    projectId: projectId ? parseInt(projectId) : null,
  },
});

  return NextResponse.json({ publicId: newSnippet.publicId });
}