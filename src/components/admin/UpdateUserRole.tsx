'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { UserRole } from '@prisma/client'; // <-- YENİ: Prisma'dan UserRole enum'unu import edelim

interface UpdateUserRoleProps {
  userId: number;
  // --- DEĞİŞİKLİK 1: currentRole tipini UserRole enum'u ile değiştiriyoruz ---
  currentRole: UserRole; 
  username: string;
  isCurrentUserAdmin: boolean;
}

export default function UpdateUserRole({ userId, currentRole, username, isCurrentUserAdmin }: UpdateUserRoleProps) {
  const router = useRouter();
  // --- DEĞİŞİKLİK 2: State'in tipi de UserRole olacak ---
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // --- DEĞİŞİKLİK 3: Gelen değeri UserRole olarak cast ediyoruz ---
    setSelectedRole(event.target.value as UserRole);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    if (selectedRole === currentRole) {
      setError('Yeni rol, mevcut rolle aynı. Değişiklik yapılmadı.');
      return;
    }
    if (isCurrentUserAdmin) {
      setError('Admin kendi rolünü değiştiremez.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: selectedRole }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.errors?.role?.[0] || data.message || 'Rol güncellenirken bir hata oluştu.';
          setError(errorMessage);
          return;
        }

        setSuccessMessage(data.message || 'Kullanıcının rolü başarıyla güncellendi.');
        router.refresh();
      } catch (err) {
        console.error('Rol güncelleme işlemi sırasında hata:', err);
        setError('Bir ağ hatası oluştu veya sunucudan geçersiz yanıt alındı.');
      }
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
      <select
        value={selectedRole}
        onChange={handleRoleChange}
        disabled={isPending || isCurrentUserAdmin}
        className={`p-1 border rounded text-sm w-full sm:w-auto
          ${isCurrentUserAdmin ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white'}`}
        title={isCurrentUserAdmin ? "Admin kendi rolünü değiştiremez" : `"${username}" kullanıcısının rolünü değiştir`}
      >
        {/* --- DEĞİŞİKLİK 4: Dropdown'a Moderatör seçeneğini ekliyoruz --- */}
        {/* Not: Değerler Prisma Enum'u ile aynı olmalı: USER, ADMIN, MODERATOR */}
        <option value="USER">Kullanıcı</option>
        <option value="MODERATOR">Moderatör</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        onClick={handleSubmit}
        disabled={isPending || isCurrentUserAdmin || selectedRole === currentRole}
        className={`px-3 py-1 text-sm font-medium rounded text-white transition-colors w-full sm:w-auto
          ${(isCurrentUserAdmin || selectedRole === currentRole)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-60'
          }`}
      >
        {isPending ? 'Güncelleniyor...' : 'Rolü Güncelle'}
      </button>
      {error && <p className="text-red-600 text-xs mt-1 w-full text-center sm:text-left">{error}</p>}
      {successMessage && <p className="text-green-600 text-xs mt-1 w-full text-center sm:text-left">{successMessage}</p>}
    </div>
  );
}