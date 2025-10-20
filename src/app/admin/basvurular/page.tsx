// src/app/admin/basvurular/page.tsx (DOĞRU SERVER COMPONENT HALİ)

import prisma from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import ApplicationActions from './ApplicationActions';
import { TeamApplication, ApplicationStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Sayfanın ve ApplicationActions'ın kullanacağı zenginleştirilmiş tip
export type EnrichedApplication = (TeamApplication & {
  user: { username: string; email: string; };
  parsedDetails: {
    firstName: string; lastName: string;
    phoneNumber: string;
    roles: string[]; bio: string;
    socialLinks: { platform: string; url: string; }[];
    profileImagePublicId: string; workSampleUrl: string;
  };
});

async function getApplications(): Promise<EnrichedApplication[]> {
  try {
    const applications = await prisma.teamApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } },
    });

    return applications.map(app => {
      let parsedDetails = { firstName: '', lastName: '', phoneNumber: '', roles: [], bio: '', socialLinks: [], profileImagePublicId: '', workSampleUrl: '' };
      try {
        if (app.detailsJson) parsedDetails = JSON.parse(app.detailsJson);
      } catch (e) { console.error(`Başvuru ID ${app.id} için JSON parse hatası:`, e); }
      return { ...app, parsedDetails };
    });
  } catch (error) {
    console.error("Başvurular çekilirken hata oluştu:", error);
    return [];
  }
}

const getStatusBadgeVariant = (status: ApplicationStatus) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'REJECTED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'PENDING': default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  }
};

export default async function TeamApplicationsPage() {
  const applications = await getApplications();
  const breadcrumbs = [{ label: 'Yönetim Paneli', href: '/admin' }, { label: 'Bize Katıl Başvuruları', href: '/admin/basvurular' }];

  return (
    <AdminPageLayout pageTitle="Bize Katıl Başvuruları" breadcrumbs={breadcrumbs}>
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-400 mb-6">Kullanıcılardan gelen ekip katılım başvurularını burada yönetebilirsiniz.</p>
        {applications.length === 0 ? (
          <div className="text-center py-12 text-gray-500"><p>Henüz yeni başvuru bulunmuyor.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Başvuran</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ana Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Durum</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eylemler</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{app.parsedDetails.firstName} {app.parsedDetails.lastName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">({app.user.username})</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{app.selectedRole.replace('_', ' ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(app.createdAt), 'dd MMM yyyy, HH:mm', { locale: tr })}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={getStatusBadgeVariant(app.status)}>{app.status}</Badge></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <ApplicationActions application={app} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}