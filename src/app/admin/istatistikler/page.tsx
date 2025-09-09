// src/app/admin/istatistikler/page.tsx

import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { startOfMonth } from 'date-fns';
import { StatisticsClientPage } from './_components/StatisticsClientPage';
import { RoleInProject, UserRole, ApplicationStatus, PaymentStatus, SuggestionStatus } from '@prisma/client';

export const metadata: Metadata = {
  title: 'İstatistikler | Admin Paneli',
};

export const revalidate = 300; 

// BU DETAYLI VERİ ÇEKME FONKSİYONUNUN TAM VE HATASIZ HALİ
async function getStatisticsDashboardData() {
  const startOfThisMonth = startOfMonth(new Date());
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalUsers, usersThisMonth, usersToday, totalRevenue, totalProjects, totalArtists,
    userRoleDistribution, bannedUsersCount, top5UsersByComments,
    projectCategoryCounts, totalProjectViews, totalProjectLikes, totalProjectFavorites, mostLikedProject, mostFavoritedProject,
    totalGamesSold, revenueThisMonth, mostSoldGame,
    suggestionStatusCounts, totalSuggestionVotes, applicationStatusCounts, mostAppliedRole,
    submissionStatusCounts, top5ArtistsByLikes,
    pendingReportsCount, mostReportedUser
  ] = await prisma.$transaction([
    // --- Genel KPI'lar ---
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.userOwnedGame.aggregate({ _sum: { purchasePrice: true } }),
    prisma.project.count({ where: { isPublished: true } }),
    prisma.dubbingArtist.count(),
    
    // --- Kullanıcı Analizi ---
    prisma.user.groupBy({ by: ['role'], _count: { id: true }, orderBy: { role: 'asc' } }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { comments: { _count: 'desc' } },
      select: { username: true, _count: { select: { comments: true } } }
    }),
    
    // --- İçerik & Proje Analizi ---
    prisma.category.findMany({
      select: { name: true, _count: { select: { projects: true } } },
      orderBy: { projects: { _count: 'desc' } }
    }),
    prisma.project.aggregate({ _sum: { viewCount: true } }),
    prisma.projectLike.count(),
    prisma.projectFavorite.count(),
    prisma.project.findFirst({ orderBy: { likeCount: 'desc' }, select: { title: true, likeCount: true } }),
    prisma.project.findFirst({ orderBy: { favoriteCount: 'desc' }, select: { title: true, favoriteCount: true } }),

    // --- Finansal Analiz ---
    prisma.userOwnedGame.count(),
    prisma.userOwnedGame.aggregate({ where: { purchasedAt: { gte: startOfThisMonth } }, _sum: { purchasePrice: true } }),
    prisma.project.findFirst({
        orderBy: { ownedByUsers: { _count: 'desc' } },
        select: { title: true, _count: { select: { ownedByUsers: true } } }
    }),

    // --- Topluluk Etkileşimi ---
    prisma.communitySuggestion.groupBy({ by: ['status'], _count: { id: true }, orderBy: { status: 'asc' } }),
    prisma.communitySuggestionVote.count(),
    prisma.teamApplication.groupBy({ by: ['status'], _count: { id: true }, orderBy: { status: 'asc' } }),
    prisma.teamApplication.groupBy({
        by: ['selectedRole'],
        _count: { selectedRole: true },
        orderBy: { _count: { selectedRole: 'desc' } },
        take: 1
    }),

    // --- Seslendirme & Katkı Analizi ---
    prisma.voiceSubmission.groupBy({ by: ['status'], _count: { id: true }, orderBy: { status: 'asc' } }),
    prisma.dubbingArtist.findMany({
        take: 5,
        orderBy: { likeCount: 'desc' },
        select: { firstName: true, lastName: true, likeCount: true }
    }),
    
    // --- Operasyonel Metrikler ---
    prisma.userReport.count({ where: { status: 'pending' } }),
    prisma.user.findFirst({
        where: { reportsAgainst: { some: {} } },
        orderBy: { reportsAgainst: { _count: 'desc' } },
        select: { username: true, _count: { select: { reportsAgainst: true } } }
    })
  ]);

  const safeSum = (agg: { _sum: { [key: string]: number | null } } | null, key: string) => agg?._sum?.[key] || 0;

  // VERİ İŞLEME VE DÖNÜŞ BLOKU
  return {
    kpis: {
      totalUsers,
      usersThisMonth,
      usersToday,
      totalRevenue: safeSum(totalRevenue, 'purchasePrice'),
      totalProjects,
      totalArtists,
      totalProjectViews: safeSum(totalProjectViews, 'viewCount'),
      totalProjectLikes,
      totalProjectFavorites,
      totalGamesSold,
      revenueThisMonth: safeSum(revenueThisMonth, 'purchasePrice'),
      pendingReportsCount,
      totalSuggestionVotes
    },
    userAnalysis: {
      roleDistribution: userRoleDistribution.map(item => ({
        name: item.role as UserRole,
        count: typeof item._count === 'object' && item._count && 'id' in item._count && typeof item._count.id === 'number' ? item._count.id : 0
      })),
      bannedUsersCount,
      top5UsersByComments: top5UsersByComments.map(u => ({ name: u.username, value: u._count.comments }))
    },
    contentAnalysis: {
        projectCategoryCounts: projectCategoryCounts.map(c => ({ name: c.name, count: c._count.projects })),
        mostLikedProject: mostLikedProject || undefined,
        mostFavoritedProject: mostFavoritedProject || undefined,
    },
    financialAnalysis: {
        mostSoldGame: mostSoldGame ? { name: mostSoldGame.title, count: mostSoldGame._count.ownedByUsers } : undefined
    },
    communityAnalysis: {
      suggestionStatusCounts: suggestionStatusCounts.map(s => ({ name: s.status as SuggestionStatus, count: typeof s._count === 'object' && s._count?.id ? s._count.id : 0 })),
      applicationStatusCounts: applicationStatusCounts.map(a => ({ name: a.status as ApplicationStatus, count: typeof a._count === 'object' && a._count?.id ? a._count.id : 0 })),

      mostAppliedRole: mostAppliedRole[0] ? mostAppliedRole[0].selectedRole as RoleInProject : 'N/A'
    },
    contributionAnalysis: {
      submissionStatusCounts: submissionStatusCounts.map(s => ({
        name: s.status as ApplicationStatus,
        count:
          typeof s._count === 'object' && s._count && 'id' in s._count && typeof s._count.id === 'number'
            ? s._count.id
            : 0
      })),
      top5ArtistsByLikes: top5ArtistsByLikes.map(a => ({
        name: `${a.firstName} ${a.lastName}`,
        value: a.likeCount
      }))
    },
    operationalAnalysis: {
      mostReportedUser: mostReportedUser
        ? { name: mostReportedUser.username, count: mostReportedUser._count.reportsAgainst }
        : undefined
    },
  };
}

export type DashboardData = Awaited<ReturnType<typeof getStatisticsDashboardData>>;


export default async function AdminStatisticsPage() {
  const statsData = await getStatisticsDashboardData();

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'İstatistikler', href: '/admin/istatistikler' }
  ];
  
  return (
    <AdminPageLayout pageTitle="İstatistikler ve Genel Bakış" breadcrumbs={breadcrumbs}>
      <div className="p-4 sm:p-6">
        <StatisticsClientPage initialData={statsData} />
      </div>
    </AdminPageLayout>
  );
}