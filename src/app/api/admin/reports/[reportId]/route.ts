// src/app/api/admin/reports/[reportId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';
import { UserRole } from '@prisma/client'; // <<< 1. DEĞİŞİKLİK: UserRole enum'unu import et

const updateReportStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved']),
});

// Yetki kontrolünü merkezi bir fonksiyon haline getirelim
async function checkAuth(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }
  return null; // Yetki varsa null dön
}


// --- PUT: Raporun Durumunu Güncelle ---
export async function PUT(
  request: NextRequest, 
  { params }: { params: { reportId: string } }
) {
  // <<< 2. DEĞİŞİKLİK: Merkezi yetki kontrol fonksiyonunu kullan
  const authError = await checkAuth();
  if (authError) return authError;
  // -----------------------------------------------------------
  
  const reportId = parseInt(params.reportId, 10);
  if (isNaN(reportId)) {
    return NextResponse.json({ message: 'Geçersiz ID formatı.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsedBody = updateReportStatusSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedReport = await prisma.userReport.update({
      where: { id: reportId },
      data: { status: parsedBody.data.status },
    });

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error(`Rapor (ID: ${reportId}) durumu güncellenirken hata:`, error);
    return NextResponse.json({ message: "Rapor durumu güncellenirken bir hata oluştu." }, { status: 500 });
  }
}

// --- DELETE: Raporu Sil ---
export async function DELETE(
  request: NextRequest, 
  { params }: { params: { reportId: string } }
) {
  // <<< 3. DEĞİŞİKLİK: Merkezi yetki kontrol fonksiyonunu kullan
  const authError = await checkAuth();
  if (authError) return authError;
  // -----------------------------------------------------------

  const reportId = parseInt(params.reportId, 10);
  if (isNaN(reportId)) {
    return NextResponse.json({ message: 'Geçersiz ID formatı.' }, { status: 400 });
  }

  try {
    await prisma.userReport.delete({ where: { id: reportId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Rapor (ID: ${reportId}) silinirken hata:`, error);
    return NextResponse.json({ message: "Rapor silinirken bir hata oluştu." }, { status: 500 });
  }
}