// src/app/admin/oneriler/_components/SupportSuggestionsTable.tsx
'use client';

import Link from 'next/link';
import { ArrowUpRightFromSquare } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type Suggestion = {
    id: number;
    gameTitle: string;
    steamUrl: string | null;
    user: { username: string } | null;
    supporterName: string;
    supportAmount: number;
    createdAt: Date;
};

interface SupportSuggestionsTableProps {
    suggestions: Suggestion[];
}

export function SupportSuggestionsTable({ suggestions }: SupportSuggestionsTableProps) {
    if (suggestions.length === 0) {
        return <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-8 text-center text-gray-500">Bu sekmede gösterilecek destekli öneri bulunmuyor.</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Oyun Adı</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Destek Miktarı</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Destekçi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tarih</th>
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                                {s.supportAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{s.user?.username || s.supporterName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(s.createdAt), 'dd MMM yyyy', { locale: tr })}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}