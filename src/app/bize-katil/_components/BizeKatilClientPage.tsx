// src/app/bize-katil/_components/BizeKatilClientPage.tsx
'use client';

import { useState } from 'react';
import { ApplicationForm } from './ApplicationForm';
import { ProfilePreviewCard } from './ProfilePreviewCard';
import { DubbingArtist } from '@prisma/client';

// <<< 1. DEĞİŞİKLİK: State yapısını güncelliyoruz
export interface SocialLink {
  platform: 'Twitter' | 'Instagram' | 'Youtube' | 'Website' | 'Linkedin' | 'Github';
  url: string;
}

export interface ApplicationFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[]; // Artık bir dizi (array)
  bio: string;
  socialLinks: SocialLink[]; // Artık bir obje dizisi
  profileImage: { publicId: string; url: string; } | null;
  workSampleUrl: string;
}
// ----------------------------------------------------

interface BizeKatilClientPageProps {
  user: { name: string; };
  previewMember: DubbingArtist | null;
}

export function BizeKatilClientPage({ user, previewMember }: BizeKatilClientPageProps) {
  // <<< 2. DEĞİŞİKLİK: Başlangıç state'ini yeni yapıya uygun hale getiriyoruz
  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: user.name.split(' ')[0] || '',
    lastName: user.name.split(' ').slice(1).join(' ') || '',
    phoneNumber: '',
    roles: [], // Boş bir dizi olarak başlıyor
    bio: '',
    socialLinks: [], // Boş bir dizi olarak başlıyor
    profileImage: null,
    workSampleUrl: '',
  });
  // ----------------------------------------------------

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          Ekibimize Katılın
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Formu doldururken sağ tarafta kadromuzda nasıl görüneceğinizi canlı olarak izleyin!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="lg:sticky lg:top-24">
          <ApplicationForm formData={formData} setFormData={setFormData} />
        </div>
        <div className="lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold text-center mb-6">Canlı Önizleme</h2>
          <ProfilePreviewCard formData={formData} placeholderMember={previewMember} />
        </div>
      </div>
    </div>
  );
}