// src/app/api/applications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';
import { RoleInProject } from '@prisma/client';

const roleStringToEnumMap: { [key: string]: RoleInProject | undefined } = {
  'Seslendirme Sanatçısı': RoleInProject.VOICE_ACTOR,
  'Çevirmen': RoleInProject.TRANSLATOR,
  'Editör': RoleInProject.MIX_MASTER,
  'SFX/VFX': RoleInProject.MODDER,
  'Mod Geliştiricisi': RoleInProject.MODDER,
  'Mix Master': RoleInProject.MIX_MASTER,
  'Script Writer': RoleInProject.SCRIPT_WRITER,
  'Director': RoleInProject.DIRECTOR,
};

const applicationSchema = z.object({
  firstName: z.string().min(2, "İsim en az 2 karakter olmalıdır."),
  lastName: z.string().min(2, "Soyisim en az 2 karakter olmalıdır."),
  roles: z.array(z.string()).min(1, "En az bir unvan/yetenek seçilmelidir."),
  bio: z.string().max(1000).optional().default(''),
  socialLinks: z.array(z.object({ platform: z.string(), url: z.string().url() })).optional().default([]),
  profileImagePublicId: z.string().min(1),
  workSampleUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Başvuru yapmak için giriş yapmalısınız.' }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);

    // <<< DÜZELTME: Gövdeyi SADECE BİR KEZ oku <<<
    const body = await request.json();
    
    // Zod ile parse ederken, önceden okuduğumuz `body` değişkenini kullan
    const parsedBody = applicationSchema.safeParse(body);
    // ------------------------------------------
    
    if (!parsedBody.success) {
      return NextResponse.json({ message: 'Geçersiz form verisi.', errors: parsedBody.error.flatten() }, { status: 400 });
    }
    
    const applicationData = parsedBody.data;
    const mainRoleEnum = roleStringToEnumMap[applicationData.roles[0]];
    if (!mainRoleEnum) {
      return NextResponse.json({ message: `Geçersiz rol: ${applicationData.roles[0]}` }, { status: 400 });
    }

    const existingApplication = await prisma.teamApplication.findFirst({
      where: { userId: userId, status: { in: ['PENDING', 'APPROVED'] } }
    });
    if (existingApplication) {
      return NextResponse.json({ message: 'Zaten aktif bir başvurunuz bulunuyor.' }, { status: 409 });
    }
    
    const newApplication = await prisma.teamApplication.create({
      data: {
        userId: userId,
        status: 'PENDING',
        selectedRole: mainRoleEnum,
        message: applicationData.bio.substring(0, 150),
        detailsJson: JSON.stringify(applicationData)
      }
    });

    return NextResponse.json(newApplication, { status: 201 });

  } catch (error) {
    console.error("Başvuru oluşturma hatası:", error);
    return NextResponse.json({ message: "Başvuru oluşturulurken bir sunucu hatası oluştu." }, { status: 500 });
  }
}
