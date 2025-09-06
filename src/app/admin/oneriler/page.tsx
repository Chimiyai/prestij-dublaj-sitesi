// src/app/admin/oneriler/page.tsx

import { Metadata } from 'next';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Heart, Archive } from 'lucide-react';
import prisma from '@/lib/prisma';
import { CommunitySuggestionsTable } from './_components/CommunitySuggestionsTable'; // Client Component
import { SupportSuggestionsTable } from './_components/SupportSuggestionsTable'; // Client Component

export const metadata: Metadata = {
  title: 'Öneri Yönetimi | Admin Paneli',
};

export const revalidate = 0;

// Veri Çekme Fonksiyonları
async function getCommunitySuggestions() {
  return prisma.communitySuggestion.findMany({
    where: { status: 'ACTIVE' },
    include: {
      submittedBy: { select: { username: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { votes: { _count: 'desc' } },
  });
}

async function getSupportSuggestions() {
  return prisma.supportSuggestion.findMany({
    where: { status: 'COMPLETED' },
    include: {
      user: { select: { username: true } },
    },
    orderBy: { supportAmount: 'desc' },
  });
}

async function getArchivedSuggestions() {
  // Hem topluluk hem de ileride destekli öneriler arşivlenebilir. Şimdilik sadece topluluk.
  return prisma.communitySuggestion.findMany({
    where: { status: 'ARCHIVED' },
    include: {
      submittedBy: { select: { username: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}


export default async function AdminSuggestionsPage() {
  const [communitySuggestions, supportSuggestions, archivedSuggestions] = await Promise.all([
    getCommunitySuggestions(),
    getSupportSuggestions(),
    getArchivedSuggestions(),
  ]);

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Öneri Yönetimi', href: '/admin/oneriler' }
  ];

  return (
    <AdminPageLayout pageTitle="Öneri Yönetimi" breadcrumbs={breadcrumbs}>
      <div className="p-0 sm:p-6">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="community">
              <Users className="w-4 h-4 mr-2" />
              Topluluk Önerileri ({communitySuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="support">
              <Heart className="w-4 h-4 mr-2" />
              Destekli Öneriler ({supportSuggestions.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="w-4 h-4 mr-2" />
              Arşiv ({archivedSuggestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-6">
            <CommunitySuggestionsTable suggestions={communitySuggestions} />
          </TabsContent>

          <TabsContent value="support" className="mt-6">
             <SupportSuggestionsTable suggestions={supportSuggestions} />
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
              {/* Arşiv tablosu da CommunitySuggestionsTable'ı kullanabilir */}
              <CommunitySuggestionsTable suggestions={archivedSuggestions} isArchive={true} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
