// src/app/api/admin/submissions/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
// ... (session, authOptions, UserRole importları)

export async function POST(request: NextRequest) {
    // ... (session ve rol kontrolü)
    const { action, ids } = await request.json(); // action: 'approve', 'reject', 'delete', ids: [1,2,3]

    try {
        if (action === 'delete') {
            // TODO: Cloudinary'den de sil
            await prisma.voiceSubmission.deleteMany({ where: { id: { in: ids } } });
        } else {
            const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
            // TODO: 'approve' ise sanatçı oluşturma/atama mantığı buraya da uygulanmalı (daha karmaşık)
            await prisma.voiceSubmission.updateMany({ where: { id: { in: ids } }, data: { status: status } });
        }
        return NextResponse.json({ message: 'İşlem başarılı.' });
    } catch(error) {
        return NextResponse.json({ message: 'Bir hata oluştu.' }, { status: 500 });
    }
}