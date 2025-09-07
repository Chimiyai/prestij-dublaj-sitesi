// src/app/profil/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma'; 
import UserProfileForm, { UserProfileFormProps } from '@/components/profile/UserProfileForm';
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
  if (isNaN(userIdAsNumber)) {
    redirect('/'); 
  }

  // <<< SORGUYU GÜNCELLE: firstName ve lastName'i de çek <<<
  const userFromDb = await prisma.user.findUnique({
    where: { id: userIdAsNumber },
    select: {
      id: true,
      username: true,
      email: true,
      bio: true,
      role: true,
      firstName: true, // EKLENDİ
      lastName: true,  // EKLENDİ
      profileImagePublicId: true,
      bannerImagePublicId: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!userFromDb) {
    console.error(`Profil sayfası: Kullanıcı bulunamadı (ID: ${userIdAsNumber}).`);
    redirect('/'); 
  }

  // <<< VERİ AKTARIMINI GÜNCELLE <<<
  const userForForm: UserProfileFormProps['user'] = {
    id: userFromDb.id,
    username: userFromDb.username,
    email: userFromDb.email,
    bio: userFromDb.bio,
    role: userFromDb.role,
    firstName: userFromDb.firstName, // EKLENDİ
    lastName: userFromDb.lastName,   // EKLENDİ
    profileImagePublicId: userFromDb.profileImagePublicId,
    bannerImagePublicId: userFromDb.bannerImagePublicId,
    createdAt: userFromDb.createdAt,
    updatedAt: userFromDb.updatedAt,
  };

  return <UserProfileForm user={userForForm} />;
}
