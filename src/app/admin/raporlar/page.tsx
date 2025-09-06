// src/app/admin/raporlar/page.tsx

import { Metadata } from 'next';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import ReportManager from '@/components/admin/ReportManager';

export const metadata: Metadata = {
  title: 'Kullanıcı Raporları | Admin Paneli',
};

export const revalidate = 0;

export default function AdminReportsPage() {
  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Kullanıcı Raporları', href: '/admin/raporlar' }
  ];

  return (
    <AdminPageLayout pageTitle="Kullanıcı Raporları" breadcrumbs={breadcrumbs}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <p className="text-gray-600 dark:text-gray-400">
          Kullanıcılar tarafından gönderilen raporları buradan inceleyebilir ve yönetebilirsiniz.
        </p>
      </div>
      <ReportManager />
    </AdminPageLayout>
  );
}