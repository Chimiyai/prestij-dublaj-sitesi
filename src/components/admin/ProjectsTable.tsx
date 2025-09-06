// src/components/admin/ProjectsTable.tsx (GÜVENLİ VE GÜNCELLENMİŞ HALİ)
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteProjectButton from '@/components/admin/DeleteProjectButton';
import { MagnifyingGlassIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { UserRole } from '@prisma/client'; // Rol enum'unu import ediyoruz

interface ProjectForTable {
  id: number;
  title: string;
  slug: string;
  type: string;
  releaseDate: Date | null;
  isPublished: boolean;
  createdAt: Date;
}

interface ProjectsTableProps {
  initialProjects: ProjectForTable[];
  userRole?: UserRole; // <<< ROL BİLGİSİNİ PROP OLARAK ALIYORUZ
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ initialProjects, userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // <<< KULLANICININ ADMIN OLUP OLMADIĞINI KONTROL EDEN BİR DEĞİŞKEN
  const isAdmin = userRole === UserRole.ADMIN;

  const filteredProjects = useMemo(() => {
    if (!searchTerm.trim()) {
      return initialProjects;
    }
    const lowercasedFilter = searchTerm.toLowerCase().trim();
    return initialProjects.filter(project =>
      project.title.toLowerCase().includes(lowercasedFilter)
    );
  }, [initialProjects, searchTerm]);

  return (
    <div>
      {/* Arama Çubuğu ve Yeni Ekle Butonu */}
      <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Proje ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
          />
        </div>
        
        {/* <<< BUTONU SADECE ADMIN GÖREBİLİR <<< */}
        {isAdmin && (
          <Link
            href="/admin/projeler/yeni"
            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors text-sm"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Yeni Proje Ekle
          </Link>
        )}
      </div>

      {filteredProjects.length === 0 ? (
         <p className="text-center py-16 text-gray-500">
           {searchTerm ? "Aramayla eşleşen proje bulunamadı." : "Henüz hiç proje eklenmemiş."}
         </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Başlık</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tür</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Yayın Tarihi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Durum</th>
                {/* <<< EYLEMLER SÜTUNUNU SADECE ADMIN GÖREBİLİR <<< */}
                {isAdmin && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eylemler</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredProjects.map((proje) => (
                <tr key={proje.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/60">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{proje.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{proje.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${proje.type.toLowerCase() === 'oyun' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>{proje.type.charAt(0).toUpperCase() + proje.type.slice(1)}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{proje.releaseDate ? new Date(proje.releaseDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric'}) : <span className="italic">Belirtilmemiş</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${proje.isPublished ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>{proje.isPublished ? 'Yayında' : 'Taslak'}</span></td>
                  {/* <<< EYLEMLER HÜCRESİNİ SADECE ADMIN GÖREBİLİR <<< */}
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-4">
                        <Link href={`/admin/projeler/duzenle/${proje.slug}`} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">Düzenle</Link>
                        <DeleteProjectButton projectSlug={proje.slug} projectTitle={proje.title} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectsTable;