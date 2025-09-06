// src/app/admin/kategoriler/page.ts

import { Metadata } from 'next';
import CategoryManager from '@/components/admin/CategoryManager';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Kategori Yönetimi | Admin Paneli',
};

export const revalidate = 0; 

export default async function AdminKategorilerPage() {
  const session = await getServerSession(authOptions);

  // SUNUCU TARAFINDA YETKİ KONTROLÜ
  if (session?.user?.role !== UserRole.ADMIN) {
    return (
      <AdminPageLayout pageTitle="Yetkisiz Erişim">
        <div className="text-center p-12 text-red-500">
          <ShieldExclamationIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Erişim Reddedildi</h3>
          <p className="mt-1 text-sm">Bu sayfayı görüntülemek için yönetici yetkilerine sahip olmalısınız.</p>
        </div>
      </AdminPageLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Kategori Yönetimi', href: '/admin/kategoriler' }
  ];

  return (
    <AdminPageLayout pageTitle="Kategori Yönetimi" breadcrumbs={breadcrumbs}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Sitedeki projeleri gruplamak için kullanılan kategorileri buradan ekleyebilir, düzenleyebilir ve silebilirsiniz.
        </p>
      </div>
      <CategoryManager />
    </AdminPageLayout>
  );
}