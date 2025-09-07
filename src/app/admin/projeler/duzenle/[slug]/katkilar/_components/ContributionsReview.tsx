// src/app/admin/projeler/duzenle/[slug]/katkilar/_components/ContributionsReview.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

// Tipleri page.tsx'den alabiliriz veya burada tanımlayabiliriz
type Submission = { id: number; audioFilePublicId: string; notes: string | null; user: { username: string } };
type CharacterData = { characterId: number; characterName: string; submissions: Submission[] };

interface ContributionsReviewProps {
  initialData: CharacterData[];
}

export function ContributionsReview({ initialData }: ContributionsReviewProps) {
  const [data, setData] = useState(initialData);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (submissionId: number, newStatus: 'APPROVED' | 'REJECTED') => {
    // Bu fonksiyon, bir önceki adımdaki ContributionsTable'daki ile tamamen aynı.
    if (processingId) return;
    setProcessingId(submissionId);
    const toastId = toast.loading('İşlem gerçekleştiriliyor...');
    try {
        const response = await fetch(`/api/admin/submissions/${submissionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        toast.success('Katkı başarıyla güncellendi.', { id: toastId });
        // Başarılı işlem sonrası listeden kaldıralım
        setData(prevData =>
            prevData.map(char => ({
                ...char,
                submissions: char.submissions.filter(s => s.id !== submissionId)
            })).filter(char => char.submissions.length > 0)
        );
    } catch (error) {
        toast.error((error as Error).message, { id: toastId });
    } finally {
        setProcessingId(null);
    }
  };

  if (data.length === 0) {
    return <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center text-gray-500">Bu proje için bekleyen yeni bir katkı bulunmuyor.</div>;
  }

  return (
    <div className="space-y-8">
      {data.map(({ characterName, submissions }) => (
        <div key={characterName} className="bg-white dark:bg-gray-900 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold p-4 border-b border-gray-200 dark:border-gray-800">
            Karakter: <span className="text-indigo-500">{characterName}</span>
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {submissions.map(s => (
              <li key={s.id} className="p-4 grid grid-cols-3 gap-4 items-center">
                <div className="col-span-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.user.username}</p>
                  {s.notes && <p className="text-xs text-gray-500 mt-1" title={s.notes}>Notu var</p>}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                <audio 
                                        controls 
                                        src={getCloudinaryImageUrlOptimized(s.audioFilePublicId, { resource_type: 'video' })} 
                                        className="h-10 w-full max-w-xs"
                                    ></audio>
                  <button onClick={() => handleUpdateStatus(s.id, 'APPROVED')} disabled={processingId === s.id} className="p-2 text-green-600 hover:text-green-500" title="Onayla"><CheckCircleIcon className="w-6 h-6"/></button>
                  <button onClick={() => handleUpdateStatus(s.id, 'REJECTED')} disabled={processingId === s.id} className="p-2 text-red-600 hover:text-red-500" title="Reddet"><XCircleIcon className="w-6 h-6"/></button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}