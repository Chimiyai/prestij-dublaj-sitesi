// src/app/admin/oneriler/_components/CommunitySuggestionsTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Archive, ArrowUpRightFromSquare } from 'lucide-react';
import Link from 'next/link';

// Gelen suggestion objesinin tipini tanımlayalım
type Suggestion = {
  id: number;
  gameTitle: string;
  steamUrl: string | null;
  submittedBy: { username: string };
  _count: { votes: number };
  status: string;
  createdAt: Date;
};

interface CommunitySuggestionsTableProps {
  suggestions: Suggestion[];
  isArchive?: boolean;
}

export function CommunitySuggestionsTable({ suggestions, isArchive = false }: CommunitySuggestionsTableProps) {
  const [processingId, setProcessingId] = useState<number | null>(null);
  const router = useRouter();

  const handleUpdateStatus = async (suggestionId: number, newStatus: 'ARCHIVED' | 'ACTIVE') => {
    if (processingId) return;
    setProcessingId(suggestionId);
    
    try {
      // Bu API'yi birazdan oluşturacağız
      const response = await fetch(`/api/admin/suggestions/community/${suggestionId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast.success(`Öneri başarıyla ${newStatus === 'ARCHIVED' ? 'arşivlendi' : 'aktive edildi'}.`);
      router.refresh(); // Sayfayı yenileyerek veriyi güncel listelerde göster
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setProcessingId(null);
    }
  };


  if (suggestions.length === 0) {
    return <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 text-center text-gray-500">Bu sekmede gösterilecek öneri bulunmuyor.</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Oyun Adı</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">İstek Sayısı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">İlk Öneren</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eylemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {suggestions.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.gameTitle}</span>
                    {s.steamUrl && (
                      <Link href={s.steamUrl} target="_blank" rel="noopener noreferrer" title="Steam Sayfası">
                        <ArrowUpRightFromSquare className="w-3.5 h-3.5 text-blue-500 hover:text-blue-400" />
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-800 dark:text-gray-200">{s._count.votes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.submittedBy.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => handleUpdateStatus(s.id, isArchive ? 'ACTIVE' : 'ARCHIVED')}
                    disabled={processingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{isArchive ? 'Arşivden Çıkar' : 'Arşivle'}</span>
                  </button>
                  {/* İleride "İlerlemeye Al" gibi butonlar buraya eklenebilir */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}