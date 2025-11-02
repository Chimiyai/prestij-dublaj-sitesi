// src/app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // --- DEĞİŞİKLİK BURADA ---
  // Bu API'yi, görev oluşturabilecek tüm rollere açıyoruz.
  const allowedRoles: UserRole[] = ['ADMIN', 'MODERATOR', 'TRANSLATOR'];
  if (!session || !allowedRoles.includes(session.user.role as UserRole)) {
    return NextResponse.json({ message: 'Bu bilgilere erişim yetkiniz yok.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');

    const whereClause: { role?: UserRole } = {};

    if (roleParam && Object.values(UserRole).includes(roleParam as UserRole)) {
      whereClause.role = roleParam as UserRole;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return NextResponse.json(users);

  } catch (error) {
    console.error("Kullanıcılar listelenirken hata:", error);
    return NextResponse.json({ message: 'Kullanıcılar listelenirken bir hata oluştu.' }, { status: 500 });
  }
}