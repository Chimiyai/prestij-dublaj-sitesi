// src/app/api/admin/projects/upload-mod/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, access, constants, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/authUtils';
import { UserRole } from '@prisma/client';

const MOD_STORAGE_PATH = process.env.NODE_ENV === 'production'
  ? path.resolve('/var/www/prestij/mods') // VDS için
  : path.resolve(process.cwd(), 'public/mods');

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (user?.role !== UserRole.ADMIN) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 403 });
  }

  try {
    // --- YENİ KONTROL: Klasör var mı ve yazma izni var mı? ---
    try {
        await access(MOD_STORAGE_PATH, constants.W_OK);
        console.log(`[DEBUG] ${MOD_STORAGE_PATH} klasörüne erişim var.`);
      } catch (permError: any) {
        // Eğer hata 'ENOENT' ise, klasörün olmadığı anlamına gelir. Oluşturalım.
        if (permError.code === 'ENOENT') {
          console.log(`[DEBUG] ${MOD_STORAGE_PATH} klasörü bulunamadı, oluşturuluyor...`);
          await mkdir(MOD_STORAGE_PATH, { recursive: true });
        } else {
          // Başka bir izin hatasıysa, orijinal hatayı fırlat
          throw new Error("Sunucu yapılandırma hatası: Mod depolama alanına erişilemiyor.");
        }
      }
    // --- BİTİŞ ---

    const formData = await request.formData();
    const file = formData.get('modFile') as File | null;
    const projectId = formData.get('projectId') as string | null;
    const projectSlug = formData.get('projectSlug') as string | null;

    if (!file || !projectId || !projectSlug) {
      return NextResponse.json({ message: 'Eksik parametreler: modFile, projectId ve projectSlug gereklidir.' }, { status: 400 });
    }

    // Dosya adını güvenli hale getir ve yeni bir isim oluştur
    const fileExtension = path.extname(file.name) || '.zip';
    const newFileName = `${projectSlug}-${Date.now()}${fileExtension}`;
    const destinationPath = path.join(MOD_STORAGE_PATH, newFileName);
    
    console.log(`[DEBUG] Dosya şuraya yazılacak: ${destinationPath}`);

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(destinationPath, fileBuffer);
    
    console.log(`[DEBUG] Dosya başarıyla yüklendi.`);

    const downloadUrl = `https://cdn.prestij-dublaj.com/mods/${newFileName}`;

    await prisma.project.update({
      where: { id: parseInt(projectId, 10) },
      data: { externalWatchUrl: downloadUrl },
    });

    return NextResponse.json({
      success: true,
      message: 'Mod dosyası başarıyla yüklendi.',
      downloadUrl: downloadUrl,
    });

  } catch (error) {
    // Hatanın kendisini daha detaylı loglayalım
    console.error('Mod dosyası yükleme ana catch bloğu hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Dosya yüklenirken bilinmeyen bir sunucu hatası oluştu.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
export const config = {
  api: {
    bodyParser: false,
  },
};