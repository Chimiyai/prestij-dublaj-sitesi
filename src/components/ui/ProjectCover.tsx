// src/components/ui/ProjectCover.tsx

import Image from 'next/image';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { PhotoIcon } from '@heroicons/react/24/solid'; // Veya `GameController`, `Film` ikonları

interface ProjectCoverProps {
  publicId: string | null | undefined;
  title: string; // Proje başlığı
  altText?: string;
  className?: string; // Ekstra Tailwind sınıfları için
  sizes?: string; // next/image için sizes prop'u
  priority?: boolean; // next/image için priority prop'u
}

// Proje isminin baş harflerini alır (opsiyonel)
const getProjectInitials = (title: string) => {
  const words = title.replace(/[^a-zA-Z0-9 ]/g, "").trim().split(' ');
  if (words.length > 1) {
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }
  return title.substring(0, 2).toUpperCase();
};

export function ProjectCover({
  publicId,
  title,
  altText,
  className,
  sizes,
  priority = false
}: ProjectCoverProps) {
  
  const imageUrl = getCloudinaryImageUrlOptimized(publicId, {
    // Genel bir boyut, bileşenin kullanıldığı yerdeki parent'ın boyutu asıl belirleyici olacak
    width: 400,
    height: 560,
    crop: 'fill',
    gravity: 'face'
  });

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={altText || `${title} kapak resmi`}
        fill
        className={cn("object-cover bg-gray-800", className)}
        sizes={sizes}
        priority={priority}
      />
    );
  } else {
    // Resim yoksa fallback göster
    return (
      <div
        className={cn(
          "w-full h-full flex flex-col items-center justify-center p-4 text-center",
          "bg-gradient-to-br from-prestij-bg-dark-4 to-prestij-bg-card-1", //tailwind.config.js'den
          className
        )}
      >
        <PhotoIcon className="w-1/4 h-1/4 text-gray-700 mb-2" />
        <span className="text-sm font-semibold text-gray-500 line-clamp-2">
          {title}
        </span>
      </div>
    );
  }
}