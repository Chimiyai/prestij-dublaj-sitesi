// src/app/api/download/[...filePath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import mime from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filePath: string[] }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Yetkisiz erişim', { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const relativePath = resolvedParams.filePath.join('/');
    if (relativePath.includes('..')) {
        return new NextResponse('Geçersiz dosya yolu', { status: 400 });
    }

    const absolutePath = path.join(process.cwd(), '.uploads', relativePath);
    
    // Dosyayı Node.js Buffer'ı olarak oku
    const fileBuffer = await fs.readFile(absolutePath);
    
    const mimeType = mime.lookup(absolutePath) || 'application/octet-stream';
    
    // --- DEĞİŞİKLİK BURADA ---
    // Node.js Buffer'ını, NextResponse'un anladığı standart bir Blob'a dönüştür.
    const fileBlob = new Blob([Buffer.from(fileBuffer)]);

    return new NextResponse(fileBlob, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${path.basename(absolutePath)}"`,
      },
    });
    
  } catch (error) {
    console.error("Dosya indirme hatası:", error);
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return new NextResponse('Dosya bulunamadı', { status: 404 });
    }
    return new NextResponse('Dosya sunulurken bir hata oluştu', { status: 500 });
  }
}