'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UserRole } from '@prisma/client';
import { Gift } from 'lucide-react';

// Tipleri page.tsx'den import ediyoruz
import { User, Game } from './types';

// Daha önce oluşturduğumuz bileşenleri import ediyoruz
import GiftGameModal from '@/components/admin/GiftGameModal';
import UpdateUserRole from '@/components/admin/UpdateUserRole';
import DeleteUserButton from '@/components/admin/DeleteUserButton';
import BanUserButton from '@/components/admin/BanUserButton';

// Rol etiketleri için yardımcı bileşen (page.tsx'den buraya taşıdık)
const RoleBadge = ({ role }: { role: UserRole }) => {
  const roleStyles = {
    [UserRole.ADMIN]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [UserRole.MODERATOR]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    [UserRole.USER]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[role]}`}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
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
    // Veri güncellendiğinde, Next.js'in sunucu tarafı verisini yeniden çekmesini sağla
    router.refresh(); 
    // Modal'ı kapat
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Modal, DOM'un herhangi bir yerinde olabilir, state ile yönetilir */}
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
                        {/* --- YENİ BUTON --- */}
                        <button 
                            onClick={() => openModal(user)} 
                            title="Hediye Gönder / Kütüphaneyi Yönet" 
                            className="p-2 text-green-600 hover:text-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentAdminId === user.id.toString()}
                        >
                            <Gift className="w-5 h-5" />
                        </button>
                        {/* --- BUTONLARIN YENİ SIRALAMASI --- */}
                        <DeleteUserButton
                          userId={user.id}
                          username={user.username}
                          isCurrentUserAdmin={currentAdminId === user.id.toString()}
                        />
                        <BanUserButton
                          userId={user.id}
                          username={user.username}
                          isBanned={user.isBanned}
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