// src/app/api/admin/tasks/[taskId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import path from 'path';
import fs from 'fs/promises';

// Cloudinary ile ilgili her şeyi siliyoruz.

// VDS'ye dosya yüklemek için yardımcı fonksiyon
const saveFileToVDS = async (file: File, folder: string, fileName: string): Promise<string> => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'tasks', folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Tarayıcının erişeceği public URL'i döndür
    return `/uploads/tasks/${folder}/${fileName}`;
};


export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
    }
    
    try {
      const taskId = parseInt(params.taskId, 10);
      const formData = await request.formData();
      const action = formData.get('action') as string;
  
      const task = await prisma.productionTask.findUnique({ where: { id: taskId } });
      if (!task) {
        return NextResponse.json({ message: 'Görev bulunamadı.' }, { status: 404 });
      }
  
      // --- SES SANATÇISI EYLEMİ ---
      if (action === 'SUBMIT_VOICE_RECORD' && session.user.role === 'VOICE_ACTOR') {
        const file = formData.get('voiceRecordFile') as File | null;
        if (!file) return NextResponse.json({ message: 'Dosya gerekli.' }, { status: 400 });
  
        const fileName = `task_${taskId}_voice_record${path.extname(file.name)}`;
        const fileUrl = await saveFileToVDS(file, task.projectId.toString(), fileName);
        
        await prisma.productionTask.update({
          where: { id: taskId },
          data: {
            voiceRecordUrl: fileUrl,
            status: 'PENDING_MIX_MASTER',
          },
        });
      } 
      // --- MIX/MASTER EYLEMİ ---
      else if (action === 'SUBMIT_MIXED_AUDIO' && session.user.role === 'MIX_MASTER') {
        const file = formData.get('mixedAudioFile') as File | null;
        if (!file) return NextResponse.json({ message: 'Dosya gerekli.' }, { status: 400 });
  
        const fileName = `task_${taskId}_mixed_audio${path.extname(file.name)}`;
        const fileUrl = await saveFileToVDS(file, task.projectId.toString(), fileName);
  
        await prisma.productionTask.update({
          where: { id: taskId },
          data: {
            mixedAudioUrl: fileUrl,
            status: 'PENDING_MODDER',
          },
        });
      }
      // --- MODDER EYLEMİ (SİLME MANTIĞI EKLENDİ) ---
      else if (action === 'COMPLETE_TASK' && (session.user.role === 'MODDER' || session.user.role === 'ADMIN')) {
        
        // 1. Silinecek dosyaların yollarını veritabanından al
        const taskToDeleteFiles = await prisma.productionTask.findUnique({
          where: { id: taskId },
          select: { scriptFileUrl: true, voiceRecordUrl: true, mixedAudioUrl: true }
        });
  
        // 2. Görevin durumunu 'COMPLETED' olarak güncelle
        await prisma.productionTask.update({
          where: { id: taskId },
          data: { status: 'COMPLETED' },
        });
  
        // 3. Dosyaları VDS'den sil
        if (taskToDeleteFiles) {
          const filesToDelete = [
            taskToDeleteFiles.scriptFileUrl,
            taskToDeleteFiles.voiceRecordUrl,
            taskToDeleteFiles.mixedAudioUrl
          ];
          
          for (const fileUrl of filesToDelete) {
            if (fileUrl) { 
              try {
                const filePath = path.join(process.cwd(), 'public', fileUrl);
                await fs.unlink(filePath);
                console.log(`Dosya başarıyla silindi: ${filePath}`);
              } catch (err) {
                console.error(`Dosya silinemedi (bu bir hata olmayabilir): ${fileUrl}`, err);
              }
            }
          }
        }
      }
      // --- YETKİSİZ VEYA GEÇERSİZ EYLEM ---
      else {
        return NextResponse.json({ message: 'Bu eylem için yetkiniz yok veya geçersiz bir eylem belirttiniz.' }, { status: 403 });
      }
  
      return NextResponse.json({ message: 'Görev başarıyla güncellendi.' });
      
    } catch (error) {
      console.error('Görev güncelleme hatası:', error);
      return NextResponse.json({ message: 'Görev güncellenirken bir hata oluştu.' }, { status: 500 });
    }
  }
  