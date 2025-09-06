// src/app/admin/projeler/page.tsx

import prisma from '@/lib/prisma';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import ProjectsTable from '@/components/admin/ProjectsTable';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function getAllProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      type: true,
      releaseDate: true,
      isPublished: true,
      createdAt: true,
    }
  });
}

export default async function AdminProjelerPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const allProjects = await getAllProjects();

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Proje Yönetimi', href: '/admin/projeler' }
  ];

  return (
    <AdminPageLayout pageTitle="Proje Yönetimi" breadcrumbs={breadcrumbs}>
      
      {/* "Yeni Ekle" butonu ve arama çubuğu artık ProjectsTable içinde yönetilecek. */}
      {/* Bu sayede rol kontrolünü tek bir yerden yapabiliriz. */}
      
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-lg overflow-hidden">
        <ProjectsTable 
          initialProjects={allProjects} 
          userRole={userRole} // <<< KULLANICININ ROLÜNÜ PROP OLARAK GÖNDERİYORUZ
        />
      </div>
    </AdminPageLayout>
  );
}