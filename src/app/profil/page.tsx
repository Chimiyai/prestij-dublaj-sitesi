// src/app/profil/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; 
import UserProfileForm from '@/components/profile/UserProfileForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profilim | PrestiJ',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/giris?callbackUrl=/profil');
  }

  const userIdAsNumber = parseInt(session.user.id, 10); 
  if (isNaN(userIdAsNumber)) { redirect('/'); }

  // --- SORGUYU GÜNCELLE: Hem kullanıcıyı hem de bağlı sanatçı profilini çek ---
  const userWithArtistProfile = await prisma.user.findUnique({
    where: { id: userIdAsNumber },
    include: {
      // Eğer bu kullanıcıya bağlı bir artistProfile varsa, onun tüm verilerini de getir.
      artistProfile: true, 
    }
  });

  if (!userWithArtistProfile) {
    console.error(`Profil sayfası: Kullanıcı bulunamadı (ID: ${userIdAsNumber}).`);
    redirect('/'); 
  }
  
  // Not: Artık `userForForm` gibi bir ara değişkene ihtiyacımız yok, 
  // tüm nesneyi doğrudan prop olarak gönderebiliriz.

  return (
    <UserProfileForm 
      user={userWithArtistProfile} 
      artistProfile={userWithArtistProfile.artistProfile || null} 
    />
  );
}