// src/app/ceviri/[publicId]/page.tsx
import prisma from '@/lib/prisma';
import TranslatorPageClient from '../_components/TranslatorPageClient';
import { getSnippetList } from '../_actions/getSnippetList';

// --- DEĞİŞİKLİK 1: Fonksiyon imzasını, API rotalarında çalıştığı gibi güncelliyoruz ---
export default async function SavedSnippetPage({ params }: { params: Promise<{ publicId: string }> }) {
  
  // --- DEĞİŞİKLİK 2: Tıpkı API rotalarında olduğu gibi, 'params' Promise'ini çözüyoruz ---
  const resolvedParams = await params;
  const publicId = resolvedParams.publicId;

  // Kodun geri kalanı, çözülmüş 'publicId' değişkenini kullanır
  const [snippets, activeSnippet] = await Promise.all([
    getSnippetList(),
    prisma.textSnippet.findUnique({ 
        where: { publicId: publicId }, // Çözülmüş publicId'yi kullan
        select: { id: true, publicId: true, content: true, title: true, projectId: true }
    })
  ]);

  if (!activeSnippet) {
    return (
        <TranslatorPageClient 
            initialSnippets={snippets}
            activeSnippet={{ id: 0, publicId: '', content: 'Bu ID ile bir metin bulunamadı.', title: 'Hata', projectId: null }}
            isError={true}
        />
    );
  }

  return (
    <TranslatorPageClient 
      initialSnippets={snippets}
      activeSnippet={activeSnippet}
    />
  );
}