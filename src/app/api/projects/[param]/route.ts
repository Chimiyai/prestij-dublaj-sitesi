// src/app/api/projects/[param]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken'; // YENİ: getToken yerine
import { getServerSession } from 'next-auth/next'; // YENİ: Hibrit kimlik doğrulama için
import { authOptions } from '@/lib/authOptions'; // YENİ: Hibrit kimlik doğrulama için
import { RoleInProject } from '@prisma/client';
import { ContributionCharacter, ContributionSubmission } from '@/types/contributions';

// === TİPLER VE FONKSİYONLAR ===

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
        role: RoleInProject;
        artist: { id: number; firstName: string; lastName: string; imagePublicId: string | null; slug?: string | null; };
        voiceRoles: Array<{ character: { id: number; name: string; } }>;
    }>;
    categories: Array<{ category: { name: string; slug: string } }>;
    _count: { comments?: number; ratings?: number };
    volunteerCharacters: ContributionCharacter[];
    currentUserSubmissions?: Array<{ id: number; audioFilePublicId: string; }>;
}

export interface UserInteractionData {
    liked: boolean;
    disliked: boolean;
    favorited: boolean;
}

async function getProjectDetails(slug: string, userId?: number): Promise<ProjectDataForDetail | null> {
    const project = await prisma.project.findUnique({
        where: { slug: decodeURIComponent(slug) },
        // --- DEĞİŞİKLİK BURADA: 'select' yerine 'include' kullanmak daha basit ---
        // VEYA 'select' kullanıyorsak steamAppId'yi eklemeliyiz.
        // 'include' genellikle daha temizdir.
        include: {
            categories: { select: { category: true } },
            assignments: {
                orderBy: [{ role: 'asc' }, { artist: { lastName: 'asc' } }],
                include: {
                    artist: true,
                    voiceRoles: { include: { character: true } }
                }
            },
            characters: {
                where: { isVolunteerNeeded: true },
                include: {
                    dialogues: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            submissions: {
                                where: { userId: userId, status: 'PENDING' },
                                select: { id: true, audioFilePublicId: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!project) return null;

    const { characters, ...restOfProject } = project;
    // Bu bölümdeki 'ContributionCharacter' ve 'ContributionSubmission' tiplerinin
    // doğru şekilde import edildiğinden emin olmalıyız.
    const volunteerCharacters: ContributionCharacter[] = characters.map(char => ({
        id: char.id,
        name: char.name,
        dialogues: char.dialogues.map(d => ({
            id: d.id,
            dialogueText: d.dialogueText,
            originalVoiceUrl: d.originalVoiceUrl,
            currentUserSubmissions: d.submissions as ContributionSubmission[],
        }))
    }));

    const projectData = {
        ...restOfProject,
        price: project.price === null ? null : Number(project.price),
        volunteerCharacters, // Kısaltılmış kullanım
        _count: {
            comments: await prisma.comment.count({ where: { projectId: project.id } }),
            ratings: await prisma.projectRating.count({ where: { projectId: project.id } })
        }
    };

    return projectData as unknown as ProjectDataForDetail;
}

async function getUserSpecificData(userId: number | undefined, projectId: number) {
    console.log(`[DEBUG] getUserSpecificData çağrıldı. userId: ${userId}, projectId: ${projectId}`);
    
    if (!userId) {
        console.log("[DEBUG] userId bulunamadı, varsayılan veri döndürülüyor.");
        return { userHasGame: false, userInitialInteraction: { liked: false, disliked: false, favorited: false } };
    }

    const userHasGame = !!await prisma.userOwnedGame.findUnique({
        where: { userId_projectId: { userId, projectId } }
    });
    
    // --- VERİTABANI SONUÇLARINI LOGLA ---
    const [likedEntry, dislikedEntry, favoritedEntry] = await Promise.all([
        prisma.projectLike.findUnique({ where: { userId_projectId: { userId, projectId } } }),
        prisma.projectDislike.findUnique({ where: { userId_projectId: { userId, projectId } } }),
        prisma.projectFavorite.findUnique({ where: { userId_projectId: { userId, projectId } } }),
    ]);
    
    console.log("[DEBUG] Prisma Sonuçları:", { likedEntry, dislikedEntry, favoritedEntry });
    // --- BİTİŞ ---

    const userInitialInteraction = {
        liked: !!likedEntry, disliked: !!dislikedEntry, favorited: !!favoritedEntry,
    };
    
    console.log("[DEBUG] Dönen userInitialInteraction:", userInitialInteraction);
    return { userHasGame, userInitialInteraction };
}

interface UserPayload { userId: number; }
async function getUserId(request: NextRequest): Promise<number | undefined> {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
            const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
            return decoded.userId;
        } catch (e) {
            return undefined; 
        }
    }
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        return parseInt(session.user.id);
    }
    return undefined;
}

export async function GET(
    req: NextRequest, 
  { params }: { params: Promise<{ param: string }> } 
) {
  const resolvedParams = await params; // Promise'i çöz
  const projectIdString = resolvedParams.param;
    try {
      const slug = projectIdString;
      if (!slug) {
        return NextResponse.json({ message: 'Proje slug bilgisi eksik.' }, { status: 400 });
      }
  
      // getToken yerine yeni hibrit fonksiyonu kullanıyoruz
      const userId = await getUserId(req);
  
      const projectDetails = await getProjectDetails(slug, userId);
      if (!projectDetails) {
        return NextResponse.json({ message: 'Proje bulunamadı.' }, { status: 404 });
      }
  
      const userStatus = await getUserSpecificData(userId, projectDetails.id);
  
      return NextResponse.json({
        projectDetails,
        userStatus,
      });
  
    } catch (error) {
      console.error(`[API_PROJECT_BY_PARAM_ERROR]`, error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
      return NextResponse.json({ message: 'Sunucuda bir hata oluştu.', error: errorMessage }, { status: 500 });
    }
  }
  