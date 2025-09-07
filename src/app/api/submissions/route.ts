// src/app/api/submissions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

const createSubmissionSchema = z.object({
    dialogueId: z.number().int(),
    audioFilePublicId: z.string().min(1),
    notes: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Katkı göndermek için giriş yapmalısınız.' }, { status: 401 });
    }

    try {
        const userId = parseInt(session.user.id);
        const body = await request.json();

        const parsedBody = createSubmissionSchema.safeParse(body);
        if (!parsedBody.success) {
            return NextResponse.json({ message: 'Geçersiz veri.', errors: parsedBody.error.flatten() }, { status: 400 });
        }
        
        const { dialogueId, audioFilePublicId, notes } = parsedBody.data;

        const newSubmission = await prisma.voiceSubmission.create({
            data: {
                dialogueId: dialogueId,
                userId: userId,
                audioFilePublicId: audioFilePublicId,
                notes: notes,
                status: 'PENDING'
            }
        });

        return NextResponse.json(newSubmission, { status: 201 });

    } catch (error) {
        console.error("Ses katkısı kaydetme API hatası:", error);
        return NextResponse.json({ message: "Katkı kaydedilirken bir sunucu hatası oluştu." }, { status: 500 });
    }
}