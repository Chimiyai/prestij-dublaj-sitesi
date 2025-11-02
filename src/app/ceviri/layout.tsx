// src/app/ceviri/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';

export default async function CeviriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Eğer kullanıcı giriş yapmamışsa VEYA rolü Admin ya da Moderatör DEĞİLSE
  if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'MODERATOR' && session.user?.role !== 'TRANSLATOR')) {
    // Kullanıcıyı anasayfaya veya giriş sayfasına yönlendir
    redirect('/'); 
  }

  // Eğer yetkisi varsa, sayfayı normal şekilde göster
  return <>{children}</>;
}