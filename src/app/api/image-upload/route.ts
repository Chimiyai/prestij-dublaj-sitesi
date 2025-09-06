// src/app/api/image-upload/route.ts (DAHA SAĞLAM VE GÜVENLİ HALİ)

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { UserRole } from '@prisma/client';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const generateUniqueFilenameForPublicId = (originalName: string, identifier: string, contextPrefix: string) => {
    const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const safeContextPrefix = contextPrefix.toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const safeIdentifier = identifier.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 30);
    const cleanOriginalNameBase = nameWithoutExtension.toLowerCase().replace(/[^a-z0-9_]+/g, '_').substring(0, 40);
    return [safeContextPrefix, safeIdentifier, cleanOriginalNameBase, Date.now().toString()].join('_').substring(0, 150);
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Yetkisiz erişim: Oturum bulunamadı.' }, { status: 401 });
  }
  const { id: userId, role: userRole } = session.user;

  let formData;
  try {
      formData = await request.formData();
  } catch (e) {
      return NextResponse.json({ message: 'Geçersiz form verisi.' }, { status: 400 });
  }

  const file = formData.get('imageFile') as File | null;
  const uploadContext = formData.get('uploadContext') as string | null;
  const identifierFromForm = formData.get('identifier') as string | null; 

  if (!file || !uploadContext) {
    return NextResponse.json({ message: 'Eksik parametreler: "imageFile" ve "uploadContext" gerekli.' }, { status: 400 });
  }

  try {
    let targetFolder = 'genel_yuklemeler';
    let maxFileSizeMB = 8;

    switch (uploadContext) {
      case 'applicationProfile':
        targetFolder = 'artist_applications';
        maxFileSizeMB = 4;
        break;
      case 'userProfile':
        if (identifierFromForm !== userId.toString()) throw new Error('Başkasının profil resmini değiştiremezsiniz.');
        targetFolder = `user_profiles/${userId}`;
        maxFileSizeMB = 2;
        break;
      case 'userBanner':
        if (identifierFromForm !== userId.toString()) throw new Error('Başkasının bannerını değiştiremezsiniz.');
        targetFolder = `user_banners/${userId}`;
        maxFileSizeMB = 5;
        break;
      case 'artistProfile':
      case 'projectCover':
        if (userRole !== UserRole.ADMIN) throw new Error('Bu işlem için yönetici yetkisi gerekli.');
        targetFolder = uploadContext === 'artistProfile' ? 'artist_profiles' : 'project_covers';
        break;
      default:
        return NextResponse.json({ message: 'Geçersiz yükleme bağlamı.' }, { status: 400 });
    }
    
    if (!file.type.startsWith('image/')) {
        return NextResponse.json({ message: `Geçersiz dosya tipi: ${file.type}. Sadece resim dosyaları kabul edilir.` }, { status: 400 });
    }
    if (file.size > maxFileSizeMB * 1024 * 1024) {
        return NextResponse.json({ message: `Dosya boyutu çok büyük. Maksimum ${maxFileSizeMB}MB olabilir.` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniquePublicId = generateUniqueFilenameForPublicId(file.name, identifierFromForm || userId.toString(), uploadContext);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'image',
        public_id: uniquePublicId,
        folder: targetFolder,
        format: 'webp',
        quality: 'auto:good',
        overwrite: false,
      }, (error, result) => {
        if (error) return reject(new Error(error.message));
        if (result) return resolve(result);
        reject(new Error("Cloudinary'den beklenmedik boş yanıt."));
      }).end(buffer);
    });

    return NextResponse.json({
      message: 'Resim başarıyla yüklendi.',
      publicId: result.public_id,
      secureUrl: result.secure_url, // URL'i de döndürmek faydalı olabilir
    });

  } catch (error: any) {
    console.error(`Resim Yükleme API Hatası (Context: ${uploadContext}):`, error);
    return NextResponse.json({ message: error.message || 'Resim yüklenirken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}