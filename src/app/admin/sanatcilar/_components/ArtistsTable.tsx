// src/app/admin/sanatcilar/_components/ArtistsTable.tsx
'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import DeleteArtistButton from '@/components/admin/DeleteArtistButton';
import AdminArtistAvatar from '@/components/admin/AdminArtistAvatar';

// ... (ArtistForAdminList tipini buraya da alabilirsiniz)

export default function ArtistsTable({ artists }: { artists: any[] }) {
  return (
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
              {artists.map((sanatci) => (
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
  );
}