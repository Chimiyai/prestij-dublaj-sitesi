// src/app/admin/kullanicilar/page.tsx

import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import ResetPasswordButton from '@/components/admin/ResetPasswordModal';

// --- DEĞİŞİKLİK 1: Yeni dosyadan import ediyoruz ---
import { User, Game } from './types'; 
import UsersClientPage from './UsersClientPage';

export const revalidate = 0;

// <<< Tip tanımlarını buradan siliyoruz, çünkü artık types.ts'te >>>

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.role !== UserRole.ADMIN) {
    return (
      <AdminPageLayout pageTitle="Yetkisiz Erişim" breadcrumbs={[{ label: 'Yönetim Paneli', href: '/admin' }]}>
        <div className="text-center p-12 text-red-500">
          <ShieldExclamationIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Erişim Reddedildi</h3>
          <p className="mt-1 text-sm">Bu sayfayı görüntülemek için yönetici yetkilerine sahip olmalısınız.</p>
        </div>
      </AdminPageLayout>
    );
  }

  const usersFromDb = await prisma.user.findMany({ // Değişken adını değiştirdim
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      isBanned: true,
      banExpiresAt: true,
      ownedGames: {
        select: { project: { select: { id: true, title: true } } }
      }
    }
  });
  
  const allGames: Game[] = await prisma.project.findMany({
    where: { type: 'oyun', price: { not: null } },
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  });

  // Prisma'dan gelen veriyi Client bileşeni için düzeltelim
  const formattedUsers: User[] = usersFromDb.map(user => ({ // Tipi burada belirtiyoruz
      ...user,
      ownedGames: user.ownedGames.map(og => og.project)
  }));

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Kullanıcılar' }
  ];
  
  return (
    <AdminPageLayout pageTitle="Kullanıcı Yönetimi" breadcrumbs={breadcrumbs}>
      <UsersClientPage
        users={formattedUsers}
        allGames={allGames}
        currentAdminId={session!.user!.id}
      />
    </AdminPageLayout>
  );
}
