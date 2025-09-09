// src/app/api/admin/applications/[applicationId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import slugify from 'slugify';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  const { applicationId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.role || ![UserRole.ADMIN, UserRole.MODERATOR].includes(session.user.role)) {
    return NextResponse.json({ message: 'Yetkisiz erişim' }, { status: 403 });
  }

  const { status } = await request.json();

  if (!applicationId || !status || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ message: 'Geçersiz istek verisi' }, { status: 400 });
  }

  const appId = parseInt(applicationId);

  try {
    if (status === 'APPROVED') {
      const updatedApplication = await prisma.$transaction(async (tx) => {
        const application = await tx.teamApplication.findUnique({ where: { id: appId } });
        if (!application?.detailsJson) throw new Error('Başvuru veya detayları bulunamadı.');
        
        const existingArtistProfile = await tx.dubbingArtist.findUnique({ where: { userId: application.userId } });
        if (existingArtistProfile) throw new Error('Bu kullanıcının zaten bir sanatçı profili var.');

        const appData = JSON.parse(application.detailsJson);
        const oldPublicId = appData.profileImagePublicId;

        if (!oldPublicId || !oldPublicId.startsWith('artist_applications/')) {
          throw new Error(`Geçersiz veya taşınamaz profil resmi ID'si: ${oldPublicId}`);
        }

        const sourceUrl = cloudinary.url(oldPublicId);

        const nameSlug = slugify(`${appData.firstName} ${appData.lastName}`, {
          lower: true,
          strict: true,
          remove: /[*+~.()'"!:@]/g
      });
      
      const uniqueTimestamp = Date.now().toString().slice(-6);
      const newFilename = `${nameSlug}-${uniqueTimestamp}`;
      
      const uploadResult = await cloudinary.uploader.upload(sourceUrl, {
          // <<< public_id'yi yeni oluşturduğumuz dosya adıyla değiştir <<<
          public_id: newFilename,
          folder: 'artist_profiles',
          resource_type: 'image'
      });

      if (!uploadResult || !uploadResult.public_id) {
          throw new Error('Resim yeni konuma kopyalanamadı.');
      }

      await cloudinary.uploader.destroy(oldPublicId);
      
      const updatedAppData = { ...appData, profileImagePublicId: uploadResult.public_id };

      await tx.dubbingArtist.create({
        data: {
            user: { connect: { id: application.userId } },
            firstName: updatedAppData.firstName,
            lastName: updatedAppData.lastName,
            siteRole: updatedAppData.roles.join(', '),
            bio: updatedAppData.bio,
            imagePublicId: updatedAppData.profileImagePublicId,
            isTeamMember: true,
            
            websiteUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Website')?.url || null,
            twitterUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Twitter')?.url || null,
            instagramUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Instagram')?.url || null,
            youtubeUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Youtube')?.url || null,
            linkedinUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Linkedin')?.url || null,
            githubUrl: updatedAppData.socialLinks.find((l: any) => l.platform === 'Github')?.url || null,
          }
        });
        
        return tx.teamApplication.update({
          where: { id: appId },
          data: { 
            status: 'APPROVED',
            detailsJson: JSON.stringify(updatedAppData)
          },
        });
      });
      return NextResponse.json(updatedApplication);

    } else if (status === 'REJECTED') {
       const application = await prisma.teamApplication.findUnique({ where: { id: appId } });
       if (application?.detailsJson) {
           const appData = JSON.parse(application.detailsJson);
           if (appData.profileImagePublicId?.startsWith('artist_applications/')) {
               console.log(`Reddedilen başvuru için resim siliniyor: ${appData.profileImagePublicId}`);
               await cloudinary.uploader.destroy(appData.profileImagePublicId);
           }
       }
       
      const updatedApplication = await prisma.teamApplication.update({ where: { id: appId }, data: { status: 'REJECTED' } });
      return NextResponse.json(updatedApplication);
    }

    return NextResponse.json({ message: "Geçersiz durum." }, { status: 400 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir sunucu hatası.';
    console.error("Başvuru onaylama/reddetme hatası:", error);
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
