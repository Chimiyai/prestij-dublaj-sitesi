// src/app/admin/page.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Library, Mic2, LayoutGrid, ShieldAlert, Handshake } from 'lucide-react';
import prisma from '@/lib/prisma';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function getAdminDashboardStats() {
  try {
    const [userCount, projectCount, artistCount, categoryCount, pendingReportCount, pendingApplicationCount] = await prisma.$transaction([
      prisma.user.count(),
      prisma.project.count(),
      prisma.dubbingArtist.count(),
      prisma.category.count(),
      prisma.userReport.count({ where: { status: 'pending' } }),
      prisma.teamApplication.count({ where: { status: 'PENDING' } })
    ]);
    return { userCount, projectCount, artistCount, categoryCount, pendingReportCount, pendingApplicationCount };
  } catch (error) {
    console.error("Admin dashboard istatistikleri çekilirken hata:", error);
    return { userCount: 0, projectCount: 0, artistCount: 0, categoryCount: 0, pendingReportCount: 0, pendingApplicationCount: 0 };
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const stats = await getAdminDashboardStats();

  return (
    <AdminPageLayout pageTitle="Yönetim Paneli Anasayfa">
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Hoş geldiniz! Soldaki menüyü kullanarak siteyi yönetebilir ve aşağıdaki genel istatistikleri görüntüleyebilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {/* Hem Admin hem Moderatör'ün göreceği kartlar */}
          <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Toplam Sanatçı</CardTitle><Mic2 className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.artistCount}</div></CardContent></Card>
          <Card className={stats.pendingReportCount > 0 ? "bg-red-900/20 border-red-500/30" : ""}>
            <CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Bekleyen Raporlar</CardTitle><ShieldAlert className="h-4 w-4" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.pendingReportCount}</div></CardContent>
          </Card>
          <Card className={stats.pendingApplicationCount > 0 ? "bg-blue-900/20 border-blue-500/30" : ""}>
            <CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Bekleyen Başvurular</CardTitle><Handshake className="h-4 w-4" /></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.pendingApplicationCount}</div></CardContent>
          </Card>

          {/* Sadece Admin'in göreceği kartlar */}
          {userRole === UserRole.ADMIN && (
            <>
              <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Toplam Proje</CardTitle><Library className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.projectCount}</div></CardContent></Card>
              <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle><Users className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.userCount}</div></CardContent></Card>
              <Card><CardHeader className="flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Toplam Kategori</CardTitle><LayoutGrid className="h-4 w-4" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.categoryCount}</div></CardContent></Card>
            </>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}