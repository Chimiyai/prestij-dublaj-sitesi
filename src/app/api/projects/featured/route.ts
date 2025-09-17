// src/app/api/projects/featured/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export async function GET() {
  try {
    const featuredProject = await prisma.project.findFirst({
      where: {
        isFeaturedForCountdown: true, // <<< ALAN ADI DOĞRULANDI
        releaseDate: { gte: new Date() },
      },
      orderBy: { releaseDate: 'asc' },
      select: {
        title: true,
        slug: true,
        releaseDate: true,
        progressPercentage: true,
        bannerImagePublicId: true,
        coverImagePublicId: true, // <<< YENİ ALAN EKLENDİ
      },
    });

    if (!featuredProject) {
      return NextResponse.json({ message: 'Öne çıkan proje bulunamadı.' }, { status: 404 });
    }
    
    const responseData = {
      ...featuredProject,
      releaseDate: featuredProject.releaseDate?.toISOString(),
    };

    return NextResponse.json({ projects: [responseData] });

  } catch (error) {
    console.error("Öne çıkan proje API hatası:", error);
    return NextResponse.json({ message: "Sunucu hatası oluştu." }, { status: 500 });
  }
}