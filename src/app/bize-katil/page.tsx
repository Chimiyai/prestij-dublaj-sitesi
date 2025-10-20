// src/app/bize-katil/page.tsx

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { BizeKatilClientPage } from './_components/BizeKatilClientPage';

export const metadata: Metadata = {
  title: 'Ekibimize Katıl | PrestiJ',
  description: 'Yeteneklerini sergile, formunu doldur ve PrestiJ ekibinin bir parçası ol!',
};

// Kadromuz sayfasından bir örnek üye çekelim ki önizleme boş başlamasın.
// "Serap" adında birini bulmaya çalışalım, yoksa ilk üyeyi alalım.
async function getPreviewMember() {
  let member = await prisma.dubbingArtist.findFirst({
    where: { isTeamMember: true, firstName: 'Serap' },
  });
  if (!member) {
    member = await prisma.dubbingArtist.findFirst({
      where: { isTeamMember: true },
      orderBy: { teamOrder: 'asc' },
    });
  }
  return member;
}

export default async function BizeKatilPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const loginUrl = new URL('/giris', baseUrl);
    loginUrl.searchParams.set('callbackUrl', '/bize-katil');
    redirect(loginUrl.toString());
  }
  
  const existingApplication = await prisma.teamApplication.findFirst({
    where: {
      userId: parseInt(session.user.id),
      status: { in: ['PENDING', 'APPROVED'] }
    }
  });

  const previewMember = await getPreviewMember();

  return (
    <main style={{ backgroundColor: '#08060D' }} className="min-h-screen text-white overflow-hidden">
      {existingApplication ? (
        <div className="container mx-auto flex items-center justify-center min-h-screen px-4">
          <div className="bg-gray-800 border border-indigo-500/30 rounded-lg p-8 text-center max-w-lg">
            <h2 className="text-2xl font-bold text-white">{existingApplication.status === 'APPROVED' ? 'Zaten Ekibimizdesiniz!' : 'Başvurunuz Alındı!'}</h2>
            <p className="mt-3 text-gray-300">{existingApplication.status === 'APPROVED' ? 'Ekibimizin değerli bir parçasısınız.' : 'Başvurunuzu aldık ve en kısa sürede inceliyoruz.'}</p>
            <Link href="/profil" className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg">Profilime Git</Link>
          </div>
        </div>
      ) : (
        // Tüm interaktif mantığı Client Component'e taşıyoruz.
        <BizeKatilClientPage 
          user={{ name: session.user.name || session.user.username || 'Kullanıcı' }}
          previewMember={previewMember} 
        />
      )}
    </main>
  );
}