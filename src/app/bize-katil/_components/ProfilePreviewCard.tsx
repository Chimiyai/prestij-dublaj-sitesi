// src/app/bize-katil/_components/ProfilePreviewCard.tsx
'use client';

import Image from 'next/image';
import { ApplicationFormData } from './BizeKatilClientPage';
import { DubbingArtist } from '@prisma/client';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { FaTwitter, FaInstagram, FaYoutube, FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';
import { HeartIcon as DonationIconOutline } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Sosyal medya ikonlarını bir haritada (map) tutmak daha kolay erişim sağlar
const socialIcons = {
  Twitter: { icon: FaTwitter, color: 'hover:text-blue-400' },
  Instagram: { icon: FaInstagram, color: 'hover:text-pink-400' },
  Youtube: { icon: FaYoutube, color: 'hover:text-red-500' },
  Website: { icon: FaGlobe, color: 'hover:text-green-400' },
  Linkedin: { icon: FaLinkedin, color: 'hover:text-blue-500' },
  Github: { icon: FaGithub, color: 'hover:text-gray-300' },
};

interface ProfilePreviewCardProps {
  formData: ApplicationFormData;
  placeholderMember: DubbingArtist | null;
}

export function ProfilePreviewCard({ formData, placeholderMember }: ProfilePreviewCardProps) {
  const firstName = formData.firstName || placeholderMember?.firstName || 'İsim';
  const lastName = formData.lastName || placeholderMember?.lastName || 'Soyisim';
  // <<< ROLLERİ GÜNCELLE: Diziyi birleştirip göster
  const rolesText = formData.roles.length > 0 ? formData.roles.join(', ') : (placeholderMember?.siteRole || 'Unvan');
  const bio = formData.bio || placeholderMember?.bio || 'Buraya kendinizi tanıtan kısa bir yazı gelecek.';
  const avatarUrl = formData.profileImage?.url || getCloudinaryImageUrlOptimized(placeholderMember?.imagePublicId, { width: 128, height: 128, crop: 'fill', gravity: 'face' }, 'avatar');

  return (
    <div className={cn("group relative flex flex-col p-6 rounded-2xl transition-all duration-300 ease-out overflow-hidden", "bg-gray-900/40 border border-gray-800/80 shadow-2xl")}>
       <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="flex flex-col items-center text-center mb-4 z-10">
        <div className="w-28 h-28 rounded-full overflow-hidden mb-5 border-2 border-gray-700/80 group-hover:border-indigo-400 transition-all duration-300 transform group-hover:scale-110 relative bg-gray-800">
          <Image src={avatarUrl || '/images/default-avatar.png'} alt="Profil Önizlemesi" fill className="object-cover" sizes="128px" key={avatarUrl}/>
        </div>
        <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-300">{firstName} {lastName}</h3>
        {rolesText && (<p className="text-sm font-medium mt-1 text-indigo-400 group-hover:text-sky-300 transition-colors">{rolesText}</p>)}
      </div>
      {bio && (<p className="text-sm text-gray-400 leading-relaxed text-center flex-grow mb-5 z-10">"{bio}"</p>)}
      
      {/* <<< SOSYAL LİNKLERİ GÜNCELLE: Dinamik olarak state'ten oluştur */}
      {formData.socialLinks.length > 0 && (
        <div className="mb-5 pt-4 border-t border-gray-800/60 flex flex-wrap justify-center items-center gap-5 z-10">
          {formData.socialLinks.map(({ platform, url }) => {
            const IconComponent = socialIcons[platform].icon;
            const colorClass = socialIcons[platform].color;
            return (
              <a key={platform} href={url || '#'} target="_blank" rel="noopener noreferrer" className={cn("text-gray-500 transition-colors duration-200", colorClass)} title={platform}>
                <IconComponent size={20} />
              </a>
            );
          })}
        </div>
      )}
      <div className="flex-grow" />
      <div className="pt-4 z-10">
        <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-lg text-sm font-medium">
          <DonationIconOutline className="w-5 h-5 mr-2" /> Destek Ol
        </button>
      </div>
    </div>
  );
}