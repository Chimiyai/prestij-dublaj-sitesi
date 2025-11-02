// src/app/api/admin/users/[userId]/route.ts

import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';
import { UserRole } from '@prisma/client'; // UserRole enum'ını import et

// --- DEĞİŞİKLİK 1: Zod şemasını tüm rolleri içerecek şekilde güncelle ---
// Object.values(UserRole) kullanarak şemayı dinamik hale getiriyoruz.
const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(UserRole) as [string, ...string[]], {
    errorMap: () => ({ message: "Geçersiz bir rol belirtildi." }),
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const resolvedParams = await params;
  const userIdToUpdateAsInt = parseInt(resolvedParams.userId, 10);

  if (isNaN(userIdToUpdateAsInt)) {
    return NextResponse.json({ message: 'Geçersiz kullanıcı ID formatı.' }, { status: 400 });
  }

  if (session.user.id === resolvedParams.userId) {
    return NextResponse.json({ message: 'Admin kendi rolünü değiştiremez.' }, { status: 400 });
  }
  
  // --- DEĞİŞİKLİK 2: newRole tipini daha esnek hale getir ---
  let newRole: UserRole; // Artık tüm UserRole enum'larını kabul edebilir.
  try {
    const body = await request.json();
    const parsedBody = updateUserRoleSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz veri.', errors: parsedBody.error.flatten().fieldErrors }, { status: 400 });
    }
    newRole = parsedBody.data.role as UserRole;
  } catch (error) {
    return NextResponse.json({ message: 'İstek body hatalı veya JSON formatında değil.' }, { status: 400 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdateAsInt },
      data: { role: newRole },
    });

    return NextResponse.json(
      { message: `'${updatedUser.username}' kullanıcısının rolü güncellendi.` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Kullanıcı rolü güncelleme hatası:', error);
    return NextResponse.json({ message: 'Kullanıcı rolü güncellenirken bir hata oluştu.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest, // Request tipini NextRequest olarak değiştirdik
  { params }: { params: Promise<{ userId: string }> } // params'ı Promise olarak al
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  const resolvedParams = await params; // params'ı çöz
  const userIdString = resolvedParams.userId;

  if (!userIdString || typeof userIdString !== 'string' || userIdString.trim() === "") {
    return NextResponse.json({ message: 'Eksik veya geçersiz kullanıcı ID parametresi.' }, { status: 400 });
  }
  const userIdToDeleteAsInt = parseInt(userIdString, 10);

  if (isNaN(userIdToDeleteAsInt)) {
    return NextResponse.json({ message: 'Geçersiz kullanıcı ID formatı.' }, { status: 400 });
  }
  
  if (session.user.id === userIdString) { 
    return NextResponse.json(
      { message: 'Admin kendi hesabını silemez.' },
      { status: 400 }
    );
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDeleteAsInt },
    });

    if (!userToDelete) {
      return NextResponse.json({ message: 'Silinecek kullanıcı bulunamadı.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userIdToDeleteAsInt }, 
    });

    return NextResponse.json({ message: `'${userToDelete.username}' adlı kullanıcı başarıyla silindi.` }, { status: 200 });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json(
      { message: 'Kullanıcı silinirken sunucuda bir hata oluştu.', error: (error as Error).message },
      { status: 500 }
    );
  }
}