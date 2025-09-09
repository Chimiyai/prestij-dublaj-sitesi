// src/app/api/admin/submissions/[submissionId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole, ApplicationStatus } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Gelen body'yi doğrulamak için Zod şeması
const updateStatusSchema = z.object({
    status: z.nativeEnum(ApplicationStatus) // Sadece 'PENDING', 'APPROVED', 'REJECTED' kabul et
});


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const parsedSubmissionId = parseInt(submissionId, 10);
    if (isNaN(parsedSubmissionId)) {
      return NextResponse.json({ message: 'Geçersiz Katkı ID formatı.' }, { status: 400 });
    }
    
    // Gelen JSON'ı Zod ile güvenli bir şekilde parse et
    const body = await request.json();
    const parsedBody = updateStatusSchema.safeParse(body);

    if (!parsedBody.success) {
        return NextResponse.json({ message: 'Geçersiz istek verisi. Sadece "status" alanı gönderilmelidir.', errors: parsedBody.error.flatten() }, { status: 400 });
    }
    
    const { status } = parsedBody.data;

    const submissionToUpdate = await prisma.voiceSubmission.findUnique({
        where: { id: parsedSubmissionId }
    });
    if (!submissionToUpdate) {
        return NextResponse.json({ message: 'Güncellenecek katkı bulunamadı.' }, { status: 404 });
    }

    if (status === 'REJECTED' && submissionToUpdate.audioFilePublicId) {
        try {
            await cloudinary.uploader.destroy(submissionToUpdate.audioFilePublicId, { resource_type: 'video' });
        } catch (cloudinaryError) {
            console.error("Cloudinary silme hatası (ama işlem devam ediyor):", cloudinaryError);
        }
    }

    const updatedSubmission = await prisma.voiceSubmission.update({
      where: { id: parsedSubmissionId },
      data: { status: status },
      include: {
          user: { select: { username: true } },
          dialogue: { include: { character: { include: { project: { select: { title: true, slug: true } } } } } }
      }
    });

    return NextResponse.json({ message: 'Durum güncellendi.', submission: updatedSubmission });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}