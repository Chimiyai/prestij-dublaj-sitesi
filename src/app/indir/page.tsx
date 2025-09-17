// src/app/indir/page.tsx

import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { DownloadPageClient } from './_components/DownloadPageClient';
import { Octokit } from 'octokit'; // YENİ: Octokit'i import et

export const metadata: Metadata = {
  title: 'İndir | PrestiJ',
  description: 'PrestiJ dublaj modlarını indirin ve oyun deneyiminizi bir üst seviyeye taşıyın.',
};

// --- YENİ BÖLÜM: GitHub'dan en son sürüm bilgilerini çeken fonksiyon ---
const GITHUB_OWNER = 'Chimiyai';
const GITHUB_REPO = 'prestij-dublaj-desktop';

async function getLatestReleaseInfo() {
  try {
    const octokit = new Octokit(); // auth gerekmez
    const release = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    if (release.status !== 200) return null;

    const assets = release.data.assets;

    const windowsAsset = assets.find((asset: any) => asset.name.endsWith('.exe'));
    
    return {
      version: release.data.tag_name,
      windowsUrl: windowsAsset?.browser_download_url || null,
    };
  } catch (error) {
    console.error("GitHub Release alınırken hata:", error);
    return null;
  }
}
// --- BİTİŞ ---


async function getDownloadPageData() {
  const [totalDubbedGames, totalTeamMembers, projectsForSlider] = await Promise.all([
    prisma.project.count({ where: { type: 'oyun', isPublished: true } }),
    prisma.dubbingArtist.count({ where: { isTeamMember: true } }),
    prisma.project.findMany({
      where: { isPublished: true, NOT: { coverImagePublicId: null } },
      select: { title: true, slug: true, coverImagePublicId: true, },
      orderBy: { releaseDate: 'desc' },
      take: 10,
    }),
  ]);
  return { totalDubbedGames, totalTeamMembers, projectsForSlider };
}

export default async function DownloadPage() {
  // Veri çekme isteklerini aynı anda başlat
  const pageDataPromise = getDownloadPageData();
  const releaseInfoPromise = getLatestReleaseInfo();

  const [pageData, releaseInfo] = await Promise.all([pageDataPromise, releaseInfoPromise]);

  // Statik link yerine, GitHub'dan gelen dinamik linki kullan
  // Eğer link alınamazsa, kullanıcıyı GitHub Releases sayfasına yönlendir
  const downloadLink = releaseInfo?.windowsUrl || `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
  const version = releaseInfo?.version || "en son";

  return (
    <DownloadPageClient
      stats={{ 
        totalDubbedGames: pageData.totalDubbedGames, 
        totalTeamMembers: pageData.totalTeamMembers 
      }}
      projectsForSlider={pageData.projectsForSlider}
      downloadLink={downloadLink}
      version={version} // YENİ: versiyon bilgisini de Client'a gönder
    />
  );
}