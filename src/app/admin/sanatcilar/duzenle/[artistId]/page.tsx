// src/app/admin/sanatcilar/duzenle/[artistId]/page.tsx
import prisma from '@/lib/prisma';
import EditArtistForm, { ArtistFormDataForEdit } from '@/components/admin/EditArtistForm';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// --- Veri Çekme ve İşleme Fonksiyonu ---
async function getArtist(artistId: number) {
  const artistFromDb = await prisma.dubbingArtist.findUnique({
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
    }
  });

  if (!artistFromDb) {
    return null;
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
  };

  return artistForForm;
}

// --- Metadata Fonksiyonu (generateMetadata) ---
export async function generateMetadata({ params }: { params: { artistId: string } }): Promise<Metadata> {
  const artistIdAsNumber = parseInt(params.artistId, 10);
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
export default async function EditSanatciPage({ params }: { params: { artistId: string } }) {
  const artistIdAsNumber = parseInt(params.artistId, 10);

  if (isNaN(artistIdAsNumber)) {
    notFound();
  }
  const artist = await getArtist(artistIdAsNumber);
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
      {/* 
        Form doğrudan EditArtistForm bileşenine aktarılacak.
        Bu sayfanın görevi, layout'u kurmak ve veriyi sağlamak.
        Asıl tasarım ve gruplama mantığı EditArtistForm içinde olacak.
      */}
      <EditArtistForm artist={artist} isEditing={true} />
    </AdminPageLayout>
  );
}
