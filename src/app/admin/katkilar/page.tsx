// src/app/admin/katkilar/page.tsx

import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { ContributionsClientPage } from './_components/ContributionsClientPage'; // Yeni ana bileşenimiz
import { VoiceSubmission, User, CharacterDialogue, ProjectCharacter, Project, ApplicationStatus } from '@prisma/client';

export const metadata: Metadata = { title: 'Gönüllü Katkıları | Admin Paneli' };
export const revalidate = 0;

// İhtiyacımız olan tüm veriyi tek seferde çeken ve gruplayan fonksiyon
async function getSubmissionsByStatus() {
  const submissions = await prisma.voiceSubmission.findMany({
    // Tüm durumlardaki katkıları çekiyoruz, ayırmayı client'ta yapacağız
    where: { status: { in: ['PENDING', 'APPROVED', 'REJECTED'] } },
    include: {
      user: { select: { id: true, username: true } },
      dialogue: {
        include: {
          character: {
            include: {
              project: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Ek olarak, her karakter için atanmış bir gönüllü var mı, bu bilgiyi çekelim
  const assignedCharacters = await prisma.voiceAssignment.findMany({
    where: {
      assignment: {
        artist: { isTeamMember: false } // Sadece gönüllüleri al
      }
    },
    select: {
      projectCharacterId: true
    }
  });
  const assignedCharacterSet = new Set(assignedCharacters.map(ac => ac.projectCharacterId));

  // Veriyi PENDING, APPROVED, REJECTED olarak ayıralım
  const groupedByStatus = {
    PENDING: submissions.filter(s => s.status === 'PENDING'),
    APPROVED: submissions.filter(s => s.status === 'APPROVED'),
    REJECTED: submissions.filter(s => s.status === 'REJECTED'),
  };

  return { submissionsByStatus: groupedByStatus, assignedCharacterSet };
}

export default async function AdminContributionsPage() {
  const { submissionsByStatus, assignedCharacterSet } = await getSubmissionsByStatus();

  const breadcrumbs = [
    { label: 'Yönetim Paneli', href: '/admin' },
    { label: 'Gönüllü Katkıları', href: '/admin/katkilar' }
  ];

  return (
    <AdminPageLayout pageTitle="Gönüllü Katkı Yönetimi" breadcrumbs={breadcrumbs}>
      <div className="p-0 sm:p-6">
      <ContributionsClientPage 
          initialSubmissions={submissionsByStatus} 
          initialAssignedCharacters={Array.from(assignedCharacterSet)} // Set'i dizi olarak gönder
        />
      </div>
    </AdminPageLayout>
  );
}