// src/app/api/admin/reports/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client'; // <<< 1. DEĞİŞİKLİK: UserRole enum'unu import et

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // <<< 2. DEĞİŞİKLİK: Yetki kontrolünü güncelle
  const userRole = session?.user?.role;
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MODERATOR];

  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }
  // ---------------------------------------------------

  try {
    const reports = await prisma.userReport.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        reporter: {
          select: { id: true, username: true },
        },
        reported: {
          select: { id: true, username: true },
        },
      },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Raporlar listelenirken hata:", error);
    return NextResponse.json({ message: "Raporlar getirilirken bir hata oluştu." }, { status: 500 });
  }
}