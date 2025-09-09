// src/app/admin/projeler/duzenle/[slug]/katkilar/page.tsx

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { ContributionsReview } from './_components/ContributionsReview'; // Birazdan oluşturacağız

// Veri çekme fonksiyonu
async function getProjectContributions(projectSlug: string) {
  const project = await prisma.project.findUnique({
    where: { slug: projectSlug },
    select: {
      id: true,
      title: true,
      slug: true,
      characters: { // Projenin tüm karakterlerini al
        include: {
          dialogues: { // Ve onların diyaloglarını
            include: {
              submissions: { // Ve bu diyaloglara yapılmış PENDING durumundaki katkıları
                where: { status: 'PENDING' },
                include: {
                  user: { select: { username: true } }
                },
                orderBy: { createdAt: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!project) return null;

  // Veriyi arayüz için daha kullanışlı bir formata dönüştürelim
  const charactersWithSubmissions = project.characters
    .map(character => {
      const submissions = character.dialogues.flatMap(dialogue => dialogue.submissions);
      return {
        characterId: character.id,
        characterName: character.name,
        submissions: submissions
      };
    })
    .filter(c => c.submissions.length > 0); // Sadece katkı olan karakterleri göster

  return {
    projectTitle: project.title,
    projectSlug: project.slug,
    charactersWithSubmissions: charactersWithSubmissions,
  };
}

export default async function ProjectContributionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // await ile bekle
  const data = await getProjectContributions(slug);

  if (!data) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Proje Yönetimi", href: "/admin/projeler" },
    { label: data.projectTitle, href: `/admin/projeler/duzenle/${data.projectSlug}` },
    { label: "Gelen Katkılar", href: `/admin/projeler/duzenle/${data.projectSlug}/katkilar` }
  ];

  return (
    <AdminPageLayout pageTitle={`Gelen Katkılar: ${data.projectTitle}`} breadcrumbs={breadcrumbs}>
        <div className="p-0 sm:p-6">
            <ContributionsReview
                initialData={data.charactersWithSubmissions}
            />
        </div>
    </AdminPageLayout>
  );
}