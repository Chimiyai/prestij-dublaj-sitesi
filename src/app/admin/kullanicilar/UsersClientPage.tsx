// src/app/admin/kullanicilar/UsersClientPage.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import { Gift } from 'lucide-react';

// Tipleri import ediyoruz
import { User, Game } from './types';

// Bileşenleri import ediyoruz
import GiftGameModal from '@/components/admin/GiftGameModal';
import UpdateUserRole from '@/components/admin/UpdateUserRole';
import DeleteUserButton from '@/components/admin/DeleteUserButton';
import BanUserButton from '@/components/admin/BanUserButton';
import ResetPasswordButton from '@/components/admin/ResetPasswordModal';

// Rol etiketleri için yardımcı bileşen
const RoleBadge = ({ role }: { role: UserRole }) => {
  // --- DEĞİŞİKLİK BURADA ---
  // Yeni roller için stil tanımlamalarını ekliyoruz.
  const roleStyles = {
    [UserRole.ADMIN]: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
    [UserRole.MODERATOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [UserRole.USER]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    [UserRole.VOICE_ACTOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [UserRole.TRANSLATOR]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [UserRole.MODDER]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [UserRole.MIX_MASTER]: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  };
  
  // Rol adını daha okunaklı hale getirelim (örn: MIX_MASTER -> Mix Master)
  const formattedRole = role.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[role] || roleStyles.USER}`}>
      {formattedRole}
    </span>
  );
};

interface UsersClientPageProps {
  users: User[];
  allGames: Game[];
  currentAdminId: string;
}

export default function UsersClientPage({ users, allGames, currentAdminId }: UsersClientPageProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const openModal = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUpdate = () => {
    router.refresh(); 
    setIsModalOpen(false);
  };

  // Render mantığının geri kalanı aynı
  return (
    <>
      <GiftGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        allGames={allGames}
        userGames={selectedUser?.ownedGames || []}
        onUpdate={handleUpdate}
      />
      
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sitedeki tüm kullanıcıları buradan yönetebilir, rollerini değiştirebilir, hediye oyun gönderebilir veya kütüphanelerinden oyun silebilirsiniz.
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
                          currentRole={user.role}
                          username={user.username}
                          isCurrentUserAdmin={currentAdminId === user.id.toString()}
                        />
                        <button 
                            onClick={() => openModal(user)} 
                            title="Hediye Gönder / Kütüphaneyi Yönet" 
                            className="p-2 text-green-600 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentAdminId === user.id.toString()}
                        >
                            <Gift className="w-5 h-5" />
                        </button>
                        
                        <ResetPasswordButton
                          userId={user.id}
                          username={user.username}
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
    </>
  );
}