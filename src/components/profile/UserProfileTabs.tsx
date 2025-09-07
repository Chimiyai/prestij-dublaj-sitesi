// src/components/profile/UserProfileTabs.tsx (TAMAMEN DÜZELTİLDİ)
"use client";

import Link from 'next/link';
import { Cog6ToothIcon, UserIcon, ListBulletIcon, ShoppingBagIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// 1. TİP GÜNCELLENDİ
export type ProfileTabKey = 'overview' | 'activity' | 'library' | 'settings' | 'artist-profile';

interface TabItem {
  key: ProfileTabKey;
  label: string;
  icon: React.ElementType;
  isOwnerOrAdminOnly?: boolean;
  isArtistOnly?: boolean;
}

interface UserProfileTabsProps {
  activeTab: ProfileTabKey;
  isOwnProfile: boolean;
  username: string;
  artistProfileId: number | null;
}

const UserProfileTabs: React.FC<UserProfileTabsProps> = ({ 
  activeTab, 
  isOwnProfile,
  username,
  artistProfileId // 2. PARAMETRE EKLENDİ
}) => {
  const tabs: TabItem[] = [
    { key: 'overview', label: 'Genel Bakış', icon: UserIcon },
    { key: 'activity', label: 'Hareketler', icon: ListBulletIcon },
    { key: 'library', label: 'Oyun Kütüphanesi', icon: ShoppingBagIcon },
    // 3. TİP ARTIK UYUMLU
    { key: 'artist-profile', label: 'Sanatçı Profili', icon: SparklesIcon, isArtistOnly: true },
    { key: 'settings', label: 'Hesap Ayarları', icon: Cog6ToothIcon, isOwnerOrAdminOnly: true },
  ];

  const visibleTabs = tabs.filter(tab => {
    if (tab.isOwnerOrAdminOnly && !isOwnProfile) return false;
    // 4. `artistProfileId` ARTIK TANIMLI
    if (tab.isArtistOnly && !artistProfileId) return false;
    return true;
  });

  return (
    <aside className="w-full md:w-1/4 lg:w-[22%] xl:w-1/5 space-y-1.5 md:space-y-2 flex-shrink-0">
      {visibleTabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const commonClasses = "w-full text-left px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm flex items-center gap-2.5 sm:gap-3 transition-all duration-200 ease-in-out group";
        
        let tabHref = `/profil/${username}?tab=${tab.key}`;
        if (tab.key === 'settings') {
            tabHref = `/profil`;
        }
        // 5. `artistProfileId` ARTIK KULLANILABİLİR
        if (tab.key === 'artist-profile' && artistProfileId) {
            tabHref = `/sanatcilar/${artistProfileId}`;
        }
        
        // Sanatçı profili linkini ayrı bir şekilde render etme mantığı doğruydu,
        // çünkü o harici bir sayfaya gidiyor ve aktif durum kontrolü farklı.
        if (tab.key === 'artist-profile') {
            return (
                <Link
                  key={tab.key}
                  href={tabHref}
                  className={cn(commonClasses, "text-purple-300 hover:bg-purple-900/50 hover:text-white focus-visible:bg-purple-900/50")}
                >
                  <tab.icon className="w-5 h-5 opacity-90" />
                  <span>{tab.label}</span>
                </Link>
            );
        }

        return (
            <Link
              key={tab.key}
              href={tabHref}
              scroll={false}
              className={cn(
                commonClasses,
                isActive 
                  ? "bg-purple-600 text-white shadow-md scale-[1.02]" 
                  : "text-gray-300 hover:bg-gray-700/60 hover:text-white"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <tab.icon className={cn("w-5 h-5", isActive ? "opacity-100" : "opacity-70 group-hover:opacity-90")} />
              <span>{tab.label}</span>
            </Link>
        );
      })}
    </aside>
  );
};

export default UserProfileTabs;