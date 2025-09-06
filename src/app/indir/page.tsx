// src/app/indir/page.tsx (SADELEŞTİRİLMİŞ SERVER COMPONENT)

import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { DownloadPageClient } from './_components/DownloadPageClient'; // Yeni Client Component'imizi import ediyoruz

export const metadata: Metadata = {
  title: 'İndir | PrestiJ',
  description: 'PrestiJ dublaj modlarını indirin ve oyun deneyiminizi bir üst seviyeye taşıyın.',
};

// Veri çekme fonksiyonu aynı kalıyor
async function getDownloadPageData() {
  const [totalDubbedGames, totalTeamMembers, projectsForSlider] = await Promise.all([
    prisma.project.count({ where: { type: 'oyun', isPublished: true } }),
    prisma.dubbingArtist.count({ where: { isTeamMember: true } }),
    prisma.project.findMany({
      where: {
        isPublished: true,
        NOT: { coverImagePublicId: null }
      },
      select: {
        title: true,
        slug: true,
        coverImagePublicId: true,
      },
      orderBy: { releaseDate: 'desc' },
      take: 10,
    }),
  ]);

  return { totalDubbedGames, totalTeamMembers, projectsForSlider };
}

export default async function DownloadPage() {
  const { totalDubbedGames, totalTeamMembers, projectsForSlider } = await getDownloadPageData();
  const downloadLink = "#"; // GERÇEK İNDİRME LİNKİNİZİ BURAYA YAZIN

  // Sunucuda çekilen tüm veriyi Client Component'e prop olarak aktarıyoruz
  return (
    <DownloadPageClient
      stats={{ totalDubbedGames, totalTeamMembers }}
      projectsForSlider={projectsForSlider}
      downloadLink={downloadLink}
    />
  );
}