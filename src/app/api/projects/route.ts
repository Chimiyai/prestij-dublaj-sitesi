// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import jwt from 'jsonwebtoken';

interface UserPayload {
  userId: number;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  let userId: number | undefined;
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as UserPayload;
      userId = decoded.userId;
    } catch (e) {
      console.warn("Geçersiz token alındı, yoksayılıyor.");
    }
  }

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const skip = (page - 1) * limit;
  
  const typeFilter = searchParams.get('type')?.toLowerCase();
  const sortByParam = searchParams.get('sortBy');
  const titleContainsQuery = searchParams.get('title_contains')?.trim() || searchParams.get('q')?.trim();
  const priceFilter = searchParams.get('price');
  const libraryStatus = searchParams.get('libraryStatus');
  const categoriesFilter = searchParams.get('categories'); // Sadece bir tane tanım kalacak

  let orderBy: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[] = [{ createdAt: 'desc' }];

  if (sortByParam) {
    console.log(`API orderByParam received: ${sortByParam}`);
    if (sortByParam === 'popular') {
      orderBy = [
        { favoriteCount: 'desc' },
        { likeCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ];
    } else if (sortByParam === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortByParam === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sortByParam === 'likes') {
      orderBy = { likeCount: 'desc' };
    } else if (sortByParam === 'titleAsc') {
      orderBy = { title: 'asc' };
    } else if (sortByParam === 'titleDesc') {
      orderBy = { title: 'desc' };
    }
  }

  const where: Prisma.ProjectWhereInput = {
    isPublished: true,
  };

  if (typeFilter === 'oyun' || typeFilter === 'anime') {
    where.type = typeFilter;
  }
  
  // --- HATA DÜZELTME: Tekrarlanan categoriesFilter bloğu kaldırıldı ---
  // Sadece bu blok kalacak
  if (categoriesFilter) {
    const slugs = categoriesFilter.split(',').filter(slug => slug.trim() !== '');
    if (slugs.length > 0) {
      where.categories = { some: { category: { slug: { in: slugs } } } };
    }
  }

  if (priceFilter === 'free') {
    where.price = null;
  } else if (priceFilter === 'paid') {
    where.price = { not: null };
  }

  if (titleContainsQuery) {
    where.title = { contains: titleContainsQuery, mode: 'insensitive' };
  }

  if (userId && libraryStatus) {
    if (libraryStatus === 'in') {
      where.ownedByUsers = { some: { userId: userId } };
    } else if (libraryStatus === 'not_in') {
      where.ownedByUsers = { none: { userId: userId } };
    }
  }

  try {
    const projectsFromDB = await prisma.project.findMany({
      where,
      orderBy,
      take: limit,
      skip: skip,
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        bannerImagePublicId: true,
        coverImagePublicId: true,
        description: true,
        releaseDate: true,
        createdAt: true,
        likeCount: true,
        dislikeCount: true,
        favoriteCount: true,
        viewCount: true,
        averageRating: true,
        categories: {
          select: {
            category: {
              select: { id: true, name: true, slug: true }
            }
          }
        }
      }
    });

    const totalResults = await prisma.project.count({ where });

    const responseProjects = projectsFromDB.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      type: p.type,
      bannerImagePublicId: p.bannerImagePublicId,
      coverImagePublicId: p.coverImagePublicId,
      description: p.description,
      releaseDate: p.releaseDate,
      createdAt: p.createdAt,
      likeCount: p.likeCount ?? 0,
      dislikeCount: p.dislikeCount ?? 0,
      favoriteCount: p.favoriteCount ?? 0,
      categories: p.categories.map((catRelation: any) => catRelation.category),
    }));

    console.log(`CLIENT API Successfully fetched ${responseProjects.length} projects.`);
    return NextResponse.json({
      projects: responseProjects,
      totalResults: totalResults,
      currentPage: page,
      totalPages: Math.ceil(totalResults / limit),
    });

  } catch (error) {
    console.error("CLIENT API Error in /api/projects GET:", error);
    let errorMessage = "Projeler getirilirken bir sunucu hatası oluştu.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json(
      { message: "Projeler getirilirken bir hata oluştu.", details: errorMessage },
      { status: 500 }
    );
  }
}