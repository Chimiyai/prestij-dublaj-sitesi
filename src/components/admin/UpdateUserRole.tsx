// src/components/admin/UpdateUserRole.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, useEffect } from 'react';
import { UserRole } from '@prisma/client';

interface UpdateUserRoleProps {
  userId: number;
  currentRole: UserRole; 
  username: string;
  isCurrentUserAdmin: boolean;
}

// Tüm rolleri ve gösterilecek adlarını bir diziye alalım
// Bu, Object.keys(UserRole) kullanmaktan daha güvenilirdir çünkü sıralamayı kontrol edebiliriz.
const ALL_ROLES: { value: UserRole; label: string }[] = [
    { value: 'USER', label: 'Kullanıcı' },
    { value: 'VOICE_ACTOR', label: 'Ses Sanatçısı' },
    { value: 'TRANSLATOR', label: 'Çevirmen' },
    { value: 'MIX_MASTER', label: 'Mix/Master' },
    { value: 'MODDER', label: 'Modder' },
    { value: 'MODERATOR', label: 'Moderatör' },
    { value: 'ADMIN', label: 'Admin' },
];


export default function UpdateUserRole({ userId, currentRole, username, isCurrentUserAdmin }: UpdateUserRoleProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRole(event.target.value as UserRole);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async () => {
    if (selectedRole === currentRole) return;
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: selectedRole }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Bir hata oluştu.');

        setSuccessMessage(data.message);
        router.refresh(); // Sayfanın verilerini yeniden yükle
      } catch (err) {
        setError((err as Error).message);
      }
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={selectedRole}
        onChange={handleRoleChange}
        disabled={isPending || isCurrentUserAdmin}
        className={`p-1 border rounded text-sm w-40
          ${isCurrentUserAdmin ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white'}`}
        title={isCurrentUserAdmin ? "Admin kendi rolünü değiştiremez" : `Rolü değiştir`}
      >
        {/* Yeni rol listesi üzerinden <option> elemanlarını dinamik olarak oluşturuyoruz */}
        {ALL_ROLES.map(role => (
            <option key={role.value} value={role.value}>{role.label}</option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={isPending || isCurrentUserAdmin || selectedRole === currentRole}
        className="px-3 py-1 text-sm font-medium rounded text-white transition-colors bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? 'Güncelleniyor...' : 'Rolü Güncelle'}
      </button>
      {error && <p className="text-red-600 text-xs mt-1 w-full text-center sm:text-left">{error}</p>}
      {successMessage && <p className="text-green-600 text-xs mt-1 w-full text-center sm:text-left">{successMessage}</p>}
    </div>
  );
}