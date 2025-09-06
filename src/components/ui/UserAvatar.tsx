// src/components/ui/UserAvatar.tsx

import Image from 'next/image';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  publicId: string | null | undefined;
  name: string; // Kullanıcının adı veya kullanıcı adı
  size?: number; // Boyut (width ve height)
  className?: string; // Ekstra Tailwind sınıfları için
}

// Kullanıcının isminin baş harflerini alır
const getInitials = (name: string) => {
  const names = name.trim().split(' ');
  const firstName = names[0] || '';
  const lastName = names.length > 1 ? names[names.length - 1] : '';
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
};

// İsimlere göre tutarlı bir renk seçer
const generateColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
        'bg-red-500', 'bg-orange-500', 'bg-amber-500',
        'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
        'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500',
        'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
        'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500',
        'bg-pink-500', 'bg-rose-500'
    ];
    return colors[Math.abs(hash % colors.length)];
};


export function UserAvatar({ publicId, name, size = 40, className }: UserAvatarProps) {
  const imageUrl = getCloudinaryImageUrlOptimized(
    publicId,
    { width: size * 2, height: size * 2, crop: 'thumb', gravity: 'face' } // Retina ekranlar için 2x boyut
  );

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${name} profil resmi`}
        width={size}
        height={size}
        className={cn("rounded-full object-cover bg-gray-700", className)}
      />
    );
  } else {
    // Resim yoksa baş harfleri göster
    return (
      <div
        style={{ width: size, height: size, fontSize: size / 2.2 }}
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white",
          generateColor(name), // İsme göre arkaplan rengi
          className
        )}
      >
        {getInitials(name)}
      </div>
    );
  }
}