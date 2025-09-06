// src/app/admin/kullanicilar/page.tsx

import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';
import { cn } from '@/lib/utils';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import DeleteUserButton from '@/components/admin/DeleteUserButton';
import UpdateUserRole from '@/components/admin/UpdateUserRole';
import BanUserButton from '@/components/admin/BanUserButton';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const revalidate = 0;

// Tip tanımını UserRole enum'unu kullanacak şekilde güncelleyelim
interface PageUser {
  id: number;
  username: string;
  email: string;
  role: UserRole; // String yerine UserRole enum'u
  createdAt: Date;
  isBanned: boolean;
  banExpiresAt: Date | null;
}

// Rol etiketleri için bir yardımcı fonksiyon
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleStyles = {
    [UserRole.ADMIN]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [UserRole.MODERATOR]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    [UserRole.USER]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[role]}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()} {/* ADMIN -> Admin */}
    </span>
  );
};


export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  // <<< 1. YENİLİK: Sunucu tarafında ek yetki kontrolü
  if (session?.user?.role !== UserRole.ADMIN) {
    return (
      <AdminPageLayout pageTitle="Yetkisiz Erişim">
        <div className="text-center p-12 text-red-500">
          <ShieldExclamationIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Erişim Reddedildi</h3>
          <p className="mt-1 text-sm">Bu sayfayı görüntülemek için yönetici yetkilerine sahip olmalısınız.</p>
        </div>
      </AdminPageLayout>
    );
  }

  const currentAdminId = session?.user?.id;

  const users: PageUser[] = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      createdAt: true,
      isBanned: true,
      banExpiresAt: true,
    }
  });
  
  // <<< 2. YENİLİK: Breadcrumbs tanımı
  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Kullanıcılar', href: '/admin/kullanicilar' }
  ];

  return (
    // <<< 3. YENİLİK: Sayfa AdminPageLayout ile sarmalandı
    <AdminPageLayout pageTitle="Kullanıcı Yönetimi" breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sitedeki tüm kullanıcıları buradan yönetebilir, rollerini değiştirebilir, banlayabilir veya silebilirsiniz.
        </p>
      </div>

      {users.length === 0 ? (
        <p className="text-center py-12 text-gray-500">Gösterilecek kullanıcı bulunamadı.</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className={cn(
                      "hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors",
                      user.isBanned && "bg-red-900/30 hover:bg-red-900/40 opacity-70"
                  )}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.username}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(user.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <div className="flex items-center justify-center space-x-4">
                        <UpdateUserRole
                          userId={user.id}
                          currentRole={user.role as 'USER' | 'ADMIN'}
                          username={user.username}
                          isCurrentUserAdmin={currentAdminId === user.id.toString()}
                        />
                        <BanUserButton
                          userId={user.id}
                          username={user.username}
                          isBanned={user.isBanned}
                          isCurrentUserAdmin={currentAdminId === user.id.toString()}
                        />
                        <DeleteUserButton
                          userId={user.id}
                          username={user.username}
                          isCurrentUserAdmin={currentAdminId === user.id.toString()}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}
    </AdminPageLayout>
  );
}