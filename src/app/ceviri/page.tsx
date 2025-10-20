// src/app/ceviri/page.tsx
import TranslatorPageClient from './_components/TranslatorPageClient';
import { getSnippetList } from './_actions/getSnippetList';

// Bu sayfa hem sunucuda veri çeker hem de client bileşenini çağırır
export default async function NewSnippetPage() {
  const snippets = await getSnippetList(); // Sol menü için veriyi çek
  
  return (
    <TranslatorPageClient 
      initialSnippets={snippets}
      activeSnippet={null} // Yeni sayfa olduğu için aktif metin yok
    />
  );
}