// src/app/api/admin/tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';
import path from 'path';
import fs from 'fs/promises';

// Cloudinary ile ilgili her şeyi siliyoruz.

const taskSchema = z.object({
  projectId: z.string().min(1, "Proje seçimi zorunludur."),
  characterName: z.string().min(1, "Karakter adı zorunludur."),
  assignedVoiceActorId: z.string().min(1, "Seslendirme sanatçısı seçimi zorunludur."),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !['TRANSLATOR', 'MODERATOR', 'ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ message: 'Bu işlem için yetkiniz yok.' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('scriptFile') as File | null;
    const fields = Object.fromEntries(formData.entries());

    const validation = taskSchema.safeParse(fields);
    if (!validation.success) {
      return NextResponse.json({ message: 'Eksik veya geçersiz alanlar.', errors: validation.error.issues }, { status: 400 });
    }

    if (!file || file.type !== 'text/plain') {
      return NextResponse.json({ message: 'Geçerli bir .txt dosyası yüklenmelidir.' }, { status: 400 });
    }
    
    // --- YENİ VDS'YE KAYDETME MANTIĞI ---
    
    // 1. Dosyanın kaydedileceği klasör yolunu oluştur: public/uploads/tasks/[projectId]/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', validation.data.projectId);
    await fs.mkdir(uploadDir, { recursive: true }); // Eğer klasör yoksa oluştur

    // 2. Dosya için benzersiz bir ad oluştur
    const fileName = `${validation.data.characterName.replace(/\s+/g, '_')}_script_${Date.now()}.txt`;
    const filePath = path.join(uploadDir, fileName);

    // 3. Dosyayı VDS'ye yaz
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 4. Veritabanına kaydedilecek PUBLIC URL'i oluştur. Bu, tarayıcının dosyaya erişeceği yoldur.
    const fileUrl = `/uploads/tasks/${validation.data.projectId}/${fileName}`;
    
    // --- BİTİŞ ---

    const newTask = await prisma.productionTask.create({
      data: {
        characterName: validation.data.characterName,
        scriptFileUrl: fileUrl, // Veritabanına artık Cloudinary URL'si yerine yerel URL'i kaydediyoruz
        projectId: parseInt(validation.data.projectId),
        assignedTranslatorId: parseInt(session.user.id),
        assignedVoiceActorId: parseInt(validation.data.assignedVoiceActorId),
      }
    });

    return NextResponse.json(newTask, { status: 201 });

  } catch (error) {
    console.error('Görev oluşturma hatası:', error);
    return NextResponse.json({ message: 'Görev oluşturulurken bir sunucu hatası oluştu.' }, { status: 500 });
  }
}