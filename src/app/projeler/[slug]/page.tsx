// src/app/projeler/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import ProjectDetailContent from '@/components/projects/ProjectDetailContent'; // YENİ Client Component
import { RoleInProject } from '@prisma/client';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { ContributionCharacter, ContributionDialogue, ContributionSubmission } from '@/types/contributions';

// ProjectDataForDetail tipi burada veya types dosyasında olabilir
export interface ProjectDataForDetail {
    id: number;
    slug: string;
    title: string;
    type: 'oyun' | 'anime';
    description: string | null;
    bannerImagePublicId: string | null;
    coverImagePublicId: string | null;
    releaseDate: Date | null;
    trailerUrl?: string | null;
    price?: number | null;
    currency?: string | null;
    externalWatchUrl?: string | null;
    likeCount: number;
    dislikeCount: number;
    favoriteCount: number;
    averageRating?: number;
    assignments: Array<{
    id: number;
    role: RoleInProject; // Prisma enum tipini kullan
    artist: { id: number; firstName: string; lastName: string; imagePublicId: string | null; slug?: string | null; }; // slug'ı opsiyonel yaptım
        voiceRoles: Array<{ character: { id: number; name: string; } }>;
    }>;
    categories: Array<{ category: { name: string; slug: string } }>;
    _count: { comments?: number; ratings?: number };
    volunteerCharacters: ContributionCharacter[];
    currentUserSubmissions?: Array<{ id: number; audioFilePublicId: string; }>;
}
// UserInteraction tipi (ProjectInteractionButtonsProps'tan alınabilir)
export interface UserInteractionData {
    liked: boolean;
    disliked: boolean;
    favorited: boolean;
}


async function getProjectDetails(slug: string, userId?: number): Promise<ProjectDataForDetail | null> {
  const project = await prisma.project.findUnique({
      where: { slug: decodeURIComponent(slug) },
      include: { // <<< "select" yerine "include" kullanmak daha kolay olabilir
          categories: { select: { category: true } },
          assignments: {
              orderBy: [ { role: 'asc'}, { artist: { lastName: 'asc' } } ],
              include: {
                  artist: true,
                  voiceRoles: { include: { character: true } }
              }
          },
          // <<< YENİ BÖLÜM: GÖNÜLLÜ KARAKTERLERİNİ ÇEKME <<<
          characters: {
            where: { isVolunteerNeeded: true },
            include: {
                dialogues: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        submissions: {
                            // KOŞULU GÜNCELLE: Sadece bu kullanıcının PENDING durumundaki katkılarını çek
                            where: { 
                                userId: userId, // SADECE GİRİŞ YAPMIŞ KULLANICI
                                status: 'PENDING'
                            }, 
                            select: { id: true, audioFilePublicId: true }
                        }
                    }
                }
            }
        }
          // ------------------------------------------------
      }
  });

  if (!project) return null;

  // Prisma'dan gelen veriyi istediğimiz formata dönüştürelim
  const { characters, ...restOfProject } = project;
  const volunteerCharacters: ContributionCharacter[] = characters.map(char => ({
    id: char.id,
    name: char.name,
    dialogues: char.dialogues.map(d => ({
        id: d.id,
        dialogueText: d.dialogueText,
        originalVoiceUrl: d.originalVoiceUrl,
        // currentUserSubmissions'ı `submissions`'tan dönüştürerek ekle
        currentUserSubmissions: d.submissions as ContributionSubmission[],
    }))
}));
    const projectData = {
        ...restOfProject,
        price: project.price === null ? null : Number(project.price),
        volunteerCharacters: characters.map(char => ({
          ...char,
          dialogues: char.dialogues.map(d => ({
              ...d,
              currentUserSubmissions: d.submissions, // `submissions` artık sadece o kullanıcıya ait
          }))
      })),
        _count: { // _count'u manuel oluşturalım
          comments: await prisma.comment.count({ where: { projectId: project.id } }),
          ratings: await prisma.projectRating.count({ where: { projectId: project.id } })
      }
  };
  
  return projectData as unknown as ProjectDataForDetail;
}

async function getUserSpecificData(userId: number | undefined, projectId: number) {
    if (!userId) return { userHasGame: false, userInitialInteraction: { liked: false, disliked: false, favorited: false } };

    const userHasGame = !!await prisma.userOwnedGame.findUnique({
        where: { userId_projectId: { userId, projectId } }
    });
    const [likedEntry, dislikedEntry, favoritedEntry] = await Promise.all([
        prisma.projectLike.findUnique({ where: { userId_projectId: { userId, projectId } } }),
        prisma.projectDislike.findUnique({ where: { userId_projectId: { userId, projectId } } }),
        prisma.projectFavorite.findUnique({ where: { userId_projectId: { userId, projectId } } }),
    ]);
    const userInitialInteraction = {
        liked: !!likedEntry, disliked: !!dislikedEntry, favorited: !!favoritedEntry,
    };
    return { userHasGame, userInitialInteraction };
}


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolved = await params;
  const project = await prisma.project.findUnique({
    where: { slug: resolved.slug },
    include: { categories: { select: { category: { select: { name: true } } } } }
  });
  if (!project) return { title: 'Proje Bulunamadı' };

  const title = `${project.title} | Türkçe Dublaj Projesi`;
  const description = project.description?.substring(0, 160) || `${project.title} için PrestiJ tarafından hazırlanan Türkçe dublaj projesi.`;
  const ogImageUrl = getCloudinaryImageUrlOptimized(project.coverImagePublicId, { width: 1200, height: 630, crop: 'fill', gravity: 'face' });
  const keywords = ['Türkçe Dublaj', 'Türkçe Yama', project.title, ...project.categories.map(c => c.category.name)];

  return {
    title, description, keywords,
    openGraph: {
      title, description,
      url: `https://www.prestijstudio.com/projeler/${project.slug}`, // <<< KENDİ DOMAIN ADINIZI KULLANIN
      siteName: 'PrestiJ',
      images: [{ url: ogImageUrl || 'https://www.prestijstudio.com/images/default-og.jpg', width: 1200, height: 630 }], // <<< VARSAYILAN RESİM YOLUNU AYARLAYIN
      locale: 'tr_TR', type: 'website',
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: [ogImageUrl || 'https://www.prestijstudio.com/images/default-og.jpg'], // <<< VARSAYILAN RESİM YOLUNU AYARLAYIN
    },
  };
}


export default async function ProjectDetailPageServer({ params }: { params: Promise<{ slug:string }> }) {
  const resolved = await params;
  const session = await getServerSession(authOptions);

  // <<< 1. DEĞİŞİKLİK: `userId`'yi ÖNCE tanımla <<<
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined;

  // <<< 2. DEĞİŞİKLİK: Şimdi `userId`'yi GÜVENLE kullanabiliriz <<<
  const project = await getProjectDetails(resolved.slug, userId);

  if (!project) {
    notFound();
  }
  
  const { userHasGame, userInitialInteraction } = await getUserSpecificData(userId, project.id);
  
  const ogImageUrl = getCloudinaryImageUrlOptimized(project.coverImagePublicId, {
    width: 1200, height: 630, crop: 'fill', gravity: 'face'
  });

  const projectJsonLd = {
      "@context": "https://schema.org",
      "@type": project.type === 'oyun' ? "VideoGame" : "Movie", // Proje tipine göre dinamik
      "name": project.title,
      "description": project.description?.substring(0, 5000), // Max 5000 karakter
      "image": ogImageUrl,
      "author": {
        "@type": "Organization",
        "name": "PrestiJ"
      },
      // Eğer yayın tarihi varsa ekleyelim
      ...(project.releaseDate && { "datePublished": new Date(project.releaseDate).toISOString() }),
      // Eğer puanlama varsa ekleyelim
      ...(project.averageRating && project._count.ratings && project._count.ratings > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": project.averageRating.toFixed(1),
            "reviewCount": project._count.ratings
          }
      })
  };
  // ----------------------------------------------------------------------

  return (
    // <<< SAYFA İÇERİĞİNİ VE SCRIPT'İ BİR FRAGMENT İÇİNE ALIYORUZ <<<
    <>
      <ProjectDetailContent
        project={project}
        isUserLoggedIn={!!session?.user} // `!!session?.user?.id` yerine bu daha temiz
        userHasGame={project.type === 'oyun' ? userHasGame : false}
        userInitialInteraction={userInitialInteraction}
        user={session?.user || null}
      />
      
      {/* Yapısal Veri Script'i Artık Fonksiyonun İçinde ve Değişkenlere Erişebiliyor */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
    </>
    // --------------------------------------------------------------------
  );
}
