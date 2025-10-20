// src/app/api/ceviri/[publicId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

// Metni GETİR
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ publicId: string }> } // DEĞİŞİKLİK 1: İmza güncellendi
) {
  // --- YETKİ KONTROLÜ ---
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
    return NextResponse.json({ message: 'Bu içeriği görüntüleme yetkiniz yok.' }, { status: 403 });
  }
  // --- BİTİŞ ---

  // DEĞİŞİKLİK 2: Promise'i çözüyoruz
  const resolvedParams = await params;

  const snippet = await prisma.textSnippet.findUnique({
    // DEĞİŞİKLİK 3: Çözülmüş parametreyi kullanıyoruz
    where: { publicId: resolvedParams.publicId },
  });

  if (!snippet) {
    return NextResponse.json({ message: 'Metin bulunamadı.' }, { status: 404 });
  }

  return NextResponse.json({ content: snippet.content });
}

// Metni GÜNCELLE (KAYDET)
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ publicId: string }> } // DEĞİŞİKLİK 1: İmza güncellendi
) {
  // --- YETKİ KONTROLÜ ---
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
    return NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
  }
  // --- BİTİŞ ---

  // DEĞİŞİKLİK 2: Promise'i çözüyoruz
  const resolvedParams = await params;
  const { content, title, projectId } = await request.json(); // Body'den gelen diğer verileri de alıyoruz
  
  try {
    const updatedSnippet = await prisma.textSnippet.update({
        // DEĞİŞİKLİK 3: Çözülmüş parametreyi kullanıyoruz
        where: { publicId: resolvedParams.publicId },
        data: { 
            content: content,
            title: title || undefined,
            // Proje ID'sini de güncelle
            projectId: projectId ? parseInt(projectId) : null
        },
    });
    return NextResponse.json({ message: 'Kaydedildi.' });
  } catch (error) {
      return NextResponse.json({ message: 'Metin bulunamadı veya güncellenemedi.' }, { status: 404 });
  }
}