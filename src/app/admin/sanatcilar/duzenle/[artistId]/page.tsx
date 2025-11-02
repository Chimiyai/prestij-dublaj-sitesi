// src/app/admin/sanatcilar/duzenle/[artistId]/page.tsx
import prisma from '@/lib/prisma';
import EditArtistForm, { ArtistFormDataForEdit } from '@/components/admin/EditArtistForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type UserSelectItem = {
  id: number;
  username: string;
};

// --- Veri Çekme ve İşleme Fonksiyonu ---
async function getArtistAndUsers(artistId: number) {
  // Sanatçı ve kullanıcı listesini TEK SEFERDE, aynı anda çekiyoruz (daha performanslı)
  const [artistFromDb, allUsers] = await Promise.all([
    prisma.dubbingArtist.findUnique({
      where: { id: artistId },
      select: {
      id: true,
      firstName: true,
      lastName: true,
      slug: true,
      bio: true,
      imagePublicId: true,
      siteRole: true,
      websiteUrl: true,
      twitterUrl: true,
      instagramUrl: true,
      youtubeUrl: true,
      linkedinUrl: true,
      githubUrl: true,
      donationLink: true,
      isTeamMember: true,
      teamOrder: true,
      userId: true,
    }
  }),
  prisma.user.findMany({
    select: { id: true, username: true },
    orderBy: { username: 'asc' }
  })
]);

if (!artistFromDb) {
  return { artist: null, allUsers: [] };
}

  // Prisma'dan gelen veriyi formun beklediği tipe dönüştür
  const artistForForm: ArtistFormDataForEdit = {
    id: artistFromDb.id,
    firstName: artistFromDb.firstName,
    lastName: artistFromDb.lastName,
    slug: artistFromDb.slug || null,
    bio: artistFromDb.bio || null,
    imagePublicId: artistFromDb.imagePublicId || null,
    siteRole: artistFromDb.siteRole || null,
    websiteUrl: artistFromDb.websiteUrl || null,
    twitterUrl: artistFromDb.twitterUrl || null,
    instagramUrl: artistFromDb.instagramUrl || null,
    youtubeUrl: artistFromDb.youtubeUrl || null,
    linkedinUrl: artistFromDb.linkedinUrl || null,
    githubUrl: artistFromDb.githubUrl || null,
    donationLink: artistFromDb.donationLink || null,
    isTeamMember: artistFromDb.isTeamMember,
    teamOrder: artistFromDb.teamOrder === null ? null : Number(artistFromDb.teamOrder),
    userId: artistFromDb.userId || null,
  };

  return { artist: artistForForm, allUsers };
}

// --- Metadata Fonksiyonu (generateMetadata) ---
export async function generateMetadata({ params }: { params: Promise<{ artistId: string }> }): Promise<Metadata> {
  const { artistId } = await params; // await ile bekle
  const artistIdAsNumber = parseInt(artistId, 10);
  if (isNaN(artistIdAsNumber)) {
    return { title: 'Geçersiz ID | Admin Paneli' };
  }
  const artist = await prisma.dubbingArtist.findUnique({
    where: { id: artistIdAsNumber },
    select: { firstName: true, lastName: true },
  });

  if (!artist) {
    return { title: 'Sanatçı Bulunamadı | Admin Paneli' };
  }
  return {
    title: `Düzenle: ${artist.firstName} ${artist.lastName} | Admin Paneli`,
  };
}

// --- Sayfa Bileşeni (EditSanatciPage) ---
export default async function EditSanatciPage({ params }: { params: Promise<{ artistId: string }> }) {
  const { artistId } = await params;
  const artistIdAsNumber = parseInt(artistId, 10);

  if (isNaN(artistIdAsNumber)) {
    notFound();
  }
  
  // Yeni fonksiyonumuzu çağırıyoruz
  const { artist, allUsers } = await getArtistAndUsers(artistIdAsNumber);

  if (!artist) {
    notFound();
  }

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Sanatçılar', href: '/admin/sanatcilar' },
    { label: `Düzenle: ${artist.firstName} ${artist.lastName}` }
  ];

  return (
    <AdminPageLayout pageTitle="Sanatçı Yönetimi" breadcrumbs={breadcrumbs}>
      {/* Forma hem sanatçı bilgisini hem de kullanıcı listesini prop olarak geçiyoruz */}
      <EditArtistForm 
        artist={artist} 
        allUsers={allUsers}
        isEditing={true} 
      />
    </AdminPageLayout>
  );
}
