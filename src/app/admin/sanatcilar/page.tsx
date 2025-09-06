// src/app/admin/sanatcilar/page.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PlusCircleIcon, PencilSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import DeleteArtistButton from '@/components/admin/DeleteArtistButton';
import AdminArtistAvatar from '@/components/admin/AdminArtistAvatar';
import AdminPageLayout from '@/components/admin/AdminPageLayout'; // <<< 1. YENİLİK: Layout import edildi

export const dynamic = 'force-dynamic';

// Bu tip tanımı aynı kalabilir
interface ArtistForAdminList {
  id: number;
  firstName: string;
  lastName: string;
  bio: string | null;
  imagePublicId: string | null;
  createdAt: Date;
}

export default async function AdminSanatcilarPage() {
  const sanatcilar = await prisma.dubbingArtist.findMany({
    orderBy: { createdAt: 'desc' },
    select: { 
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      imagePublicId: true,
      createdAt: true,
    }
  }) as ArtistForAdminList[];

  // <<< 2. YENİLİK: Breadcrumbs tanımı
  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Sanatçılar', href: '/admin/sanatcilar' }
  ];

  return (
    // <<< 3. YENİLİK: Sayfa AdminPageLayout ile sarmalandı
    <AdminPageLayout pageTitle="Sanatçı Yönetimi" breadcrumbs={breadcrumbs}>
        {/* Ana içerik layout'un children prop'u olarak gidiyor */}
        <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-800">
            <Link
              href="/admin/sanatcilar/yeni"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors text-sm"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Yeni Sanatçı Ekle
            </Link>
        </div>

        {sanatcilar.length === 0 ? (
          // <<< 4. YENİLİK: Daha şık bir "boş durum" mesajı
          <div className="text-center p-12 text-gray-500 dark:text-gray-400">
            <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Henüz Sanatçı Eklenmemiş</h3>
            <p className="mt-1 text-sm">Yukarıdaki 'Yeni Sanatçı Ekle' butonunu kullanarak ilk sanatçıyı ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sanatçı</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Biyografi (Kısa)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eklenme Tarihi</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Eylemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {sanatcilar.map((sanatci) => (
                  <tr key={sanatci.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-4"> {/* Avatar ile isim arası mesafe arttırıldı */}
                          <AdminArtistAvatar 
                            publicId={sanatci.imagePublicId}
                            altText={`${sanatci.firstName} ${sanatci.lastName}`}
                            size={40}
                            className="rounded-full"
                          />
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{`${sanatci.firstName} ${sanatci.lastName}`}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs sm:max-w-md">
                          {sanatci.bio || <span className="text-gray-400 dark:text-gray-500 italic">Biyografi yok</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(sanatci.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center items-center gap-4"> {/* Butonlar arası boşluk için */}
                        <Link
                          href={`/admin/sanatcilar/duzenle/${sanatci.id}`}
                          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                          title="Düzenle"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <DeleteArtistButton
                          artistId={sanatci.id}
                          artistFullName={`${sanatci.firstName} ${sanatci.lastName}`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </AdminPageLayout>
  );
}