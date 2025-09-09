// src/components/admin/AdminPageLayout.tsx

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import AdminSidebar from './AdminSidebar'; // Sidebar bileşenini import ediyoruz

interface AdminPageLayoutProps {
  pageTitle: string;
  breadcrumbs?: { label: string; href?: string; }[];
  children: React.ReactNode;
  backLink?: { href: string; label: string };
}

const AdminPageLayout: React.FC<AdminPageLayoutProps> = ({ 
  pageTitle, 
  breadcrumbs, 
  children, 
  backLink,
}) => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sol Tarafa Sabit Sidebar */}
      <AdminSidebar />

      {/* Sağ Tarafta Kaydırılabilir Ana İçerik Alanı */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="container mx-auto">
          
          {/* Breadcrumbs ve Geri Linki (Mevcut yapınız korundu) */}
          {(breadcrumbs || backLink) && (
            <nav className="mb-5 text-sm" aria-label="Breadcrumb">
              <ol className="list-none p-0 inline-flex items-center">
                {backLink && (
                  <li>
                    <Link href={backLink.href} className="inline-flex items-center text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                      <ArrowLeftIcon className="h-4 w-4 mr-1.5" />
                      {backLink.label}
                    </Link>
                  </li>
                )}
                {breadcrumbs && backLink && <span className="mx-2 text-gray-400">/</span>}
                {breadcrumbs?.map((crumb, index) => (
                  <li key={crumb.href} className="flex items-center">
                    {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                    {crumb.href ? (
  <Link href={crumb.href} className="text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
    {crumb.label}
  </Link>
) : (
  <span className="text-gray-800 dark:text-gray-200 font-medium">{crumb.label}</span>
)}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Sayfa Başlığı (Mevcut yapınız korundu) */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
              {pageTitle}
            </h1>
          </div>

          {/* Ana İçerik Alanı (Mevcut yapınız korundu) */}
          <div className="bg-white dark:bg-gray-900 shadow-xl rounded-xl">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminPageLayout;