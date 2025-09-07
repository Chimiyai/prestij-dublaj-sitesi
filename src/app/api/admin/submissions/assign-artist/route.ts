// src/app/api/admin/submissions/assign-artist/route.ts (NİHAİ VE TAM HALİ)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole, RoleInProject } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    const { submissionId } = await request.json();
    if (!submissionId) {
      return NextResponse.json({ message: 'Katkı ID\'si gerekli.' }, { status: 400 });
    }

    // 1. Gerekli tüm veriyi tek seferde, ilişkisel olarak çek
    const submission = await prisma.voiceSubmission.findUnique({
      where: { id: submissionId },
      include: { 
        user: {
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImagePublicId: true,
            }
        }, 
        dialogue: { include: { character: { include: { project: true } } } } 
      }
    });

    if (!submission) throw new Error("Katkı bulunamadı.");
    if (submission.status !== 'APPROVED') throw new Error("Sadece onaylanmış katkılar atanabilir.");
    
    const character = submission.dialogue.character;
    const project = character.project;
    const user = submission.user;

    // 2. Ön Koşul Kontrolleri
    if (!user.firstName || !user.lastName) {
        throw new Error(`Sanatçı profili oluşturulamadı: "${user.username}" kullanıcısının profilinde isim ve soyisim eksik.`);
    }
    const existingAssignment = await prisma.projectAssignment.findFirst({
        where: {
            projectId: project.id,
            voiceRoles: { some: { character: { id: character.id } } },
            artist: { isTeamMember: false }
        }
    });
    if (existingAssignment) {
        throw new Error(`"${character.name}" karakterine zaten başka bir gönüllü atanmış. Lütfen önce o atamayı kaldırın.`);
    }

    // 3. Ana İşlem: Sanatçı Oluşturma ve Atama (Transaction içinde)
    const result = await prisma.$transaction(async (tx) => {
      // Adım A: Sanatçı profilini bul veya oluştur
      let artist = await tx.dubbingArtist.findUnique({ where: { userId: user.id } });
      
      if (!artist) {
        console.log(`Sanatçı profili bulunamadı. "${user.firstName} ${user.lastName}" için yeni profil oluşturuluyor...`);
        artist = await tx.dubbingArtist.create({
          data: {
            userId: user.id,
            firstName: user.firstName!, // Kontrolü yukarıda yaptık
            lastName: user.lastName!,   // Kontrolü yukarıda yaptık
            isTeamMember: false, // Bu bir gönüllü, ana kadro değil
            imagePublicId: user.profileImagePublicId, // Kullanıcının mevcut profil resmini al
          },
        });
        console.log(`Yeni sanatçı profili oluşturuldu: ID ${artist.id}`);
      } else {
        console.log(`Mevcut sanatçı profili bulundu: ID ${artist.id}`);
      }
      
      // Adım B: Proje atamasını bul veya oluştur
      let assignment = await tx.projectAssignment.findFirst({
          where: { projectId: project.id, artistId: artist.id, role: RoleInProject.VOICE_ACTOR }
      });
      if (!assignment) {
          assignment = await tx.projectAssignment.create({
              data: { projectId: project.id, artistId: artist.id, role: RoleInProject.VOICE_ACTOR }
          });
          console.log(`Yeni proje ataması oluşturuldu: ID ${assignment.id}`);
      }
      
      // Adım C: Karakter atamasını yap
      await tx.voiceAssignment.create({
          data: { projectAssignmentId: assignment.id, projectCharacterId: character.id }
      });
      console.log(`"${character.name}" karakteri, atama ID ${assignment.id}'ye bağlandı.`);
      
      return { artist, assignment };
    });

    return NextResponse.json({ message: `"${user.firstName} ${user.lastName}" kullanıcısı, "${character.name}" rolüne başarıyla atandı.` });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    console.error("Sanatçı atama hatası:", error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}