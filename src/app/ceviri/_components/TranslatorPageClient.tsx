// src/app/ceviri/_components/TranslatorPageClient.tsx
'use client';

import { useState, useEffect, useMemo } from 'react'; // useMemo'yu import et
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Save, FilePlus, List, Filter } from 'lucide-react'; // Filter ikonunu ekle

// Tipler aynı kalıyor
type SnippetListItem = { id: number; publicId: string; title: string; projectId: number | null; };
type ActiveSnippet = { id: number, publicId: string, content: string, title: string, projectId: number | null };
type ProjectListItem = { id: number, title: string };

export default function TranslatorPageClient({ 
    initialSnippets, 
    activeSnippet,
    isError
}: { 
    initialSnippets: SnippetListItem[], 
    activeSnippet: ActiveSnippet | null,
    isError?: boolean
}) {
  const [textContent, setTextContent] = useState(activeSnippet?.content || '');
  const [title, setTitle] = useState(activeSnippet?.title || 'İsimsiz Metin');
  const [selectedProjectId, setSelectedProjectId] = useState(activeSnippet?.projectId?.toString() || '');
  
  const [snippets, setSnippets] = useState(initialSnippets);
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const router = useRouter();

  // --- 1. YENİ STATE: Filtre için seçilen proje ID'sini tutar ---
  const [filterProjectId, setFilterProjectId] = useState<string>('');

  useEffect(() => {
    async function fetchProjects() {
        const res = await fetch('/api/projects?limit=500');
        const data = await res.json();
        setProjects(data.projects || []);
    }
    fetchProjects();
  }, []);

  // --- 2. FİLTRELENMİŞ LİSTE: Gösterilecek metinleri hesaplar ---
  // `useMemo` kullanarak, sadece filtre veya ana liste değiştiğinde yeniden hesaplanmasını sağlıyoruz.
  const filteredSnippets = useMemo(() => {
    if (!filterProjectId || filterProjectId === 'all') {
      return snippets; // Eğer filtre 'Tümü' ise veya boşsa, tüm listeyi göster
    }
    if (filterProjectId === 'unassigned') {
        // Eğer 'Atanmamış' seçilirse, projectId'si null olanları göster
        return snippets.filter(snippet => snippet.projectId === null);
    }
    // Belirli bir proje ID'sine göre filtrele
    return snippets.filter(snippet => snippet.projectId?.toString() === filterProjectId);
  }, [snippets, filterProjectId]); // Bağımlılıklar: ana liste ve filtre değeri

  const handleSave = async () => {
    let toastId;
    try {
      const body = { content: textContent, title, projectId: selectedProjectId || null };

      if (activeSnippet && !isError) {
        // Mevcut metni GÜNCELLE
        toastId = toast.loading('Kaydediliyor...');
        await fetch(`/api/ceviri/${activeSnippet.publicId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        toast.success('Başarıyla kaydedildi!', { id: toastId });
        // Sol menüyü anında güncelle
        setSnippets(snippets.map(s => s.id === activeSnippet.id ? { ...s, title, projectId: body.projectId ? parseInt(body.projectId) : null } : s));
      } else {
        // YENİ metin oluştur
        toastId = toast.loading('Yeni kayıt oluşturuluyor...');
        const response = await fetch('/api/ceviri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        toast.success('Yeni metin oluşturuldu! Yönlendiriliyorsunuz...', { id: toastId });
        router.push(`/ceviri/${data.publicId}`);
      }
    } catch (error) {
      toast.error('Bir hata oluştu.', { id: toastId });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sol Menü */}
      <aside className="w-80 flex-shrink-0 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><List /> Kayıtlı Metinler</h2>
        <Link href="/ceviri" className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md">
            <FilePlus size={16} /> Yeni Metin Oluştur
        </Link>

        {/* --- 3. FİLTRE ARAYÜZÜ: Proje seçim menüsü --- */}
        <div className="mb-4">
            <label htmlFor="project-filter" className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-1">
                <Filter size={14} /> Projeye Göre Filtrele
            </label>
            <select
                id="project-filter"
                value={filterProjectId}
                onChange={e => setFilterProjectId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-1.5 px-2 text-sm text-white"
            >
                <option value="all">Tüm Projeler</option>
                <option value="unassigned">Projeye Atanmamış</option>
                <optgroup label="Projeler">
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </optgroup>
            </select>
        </div>
        
        {/* --- 4. FİLTRELENMİŞ LİSTEYİ GÖSTER --- */}
        <div className="overflow-y-auto flex-grow border-t border-gray-700 pt-2">
          {filteredSnippets.map(snippet => (
            <Link key={snippet.id} href={`/ceviri/${snippet.publicId}`} className={`block p-2 rounded mb-1 ${activeSnippet?.publicId === snippet.publicId ? 'bg-indigo-500' : 'hover:bg-gray-700'}`}>
              <p className="font-semibold truncate">{snippet.title}</p>
              {projects.find(p => p.id === snippet.projectId) ? (
                 <span className="text-xs text-indigo-300">{projects.find(p => p.id === snippet.projectId)?.title}</span>
              ) : (
                snippet.projectId && <span className="text-xs text-gray-400">Proje ID: {snippet.projectId}</span>
              )}
            </Link>
          ))}
          {filteredSnippets.length === 0 && (
            <p className="text-center text-sm text-gray-500 py-4">
                Bu filtreyle eşleşen kayıt bulunamadı.
            </p>
          )}
        </div>
      </aside>

      {/* Sağ Taraf: Editör (Aynı kalıyor) */}
      <main className="flex-grow p-8 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Metin Editörü</h1>
            <button onClick={handleSave} disabled={isError} className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg disabled:bg-gray-400">
                <Save size={18} /> Kaydet
            </button>
        </div>
        
        <div className="flex gap-4 mb-4">
            <div className='flex-grow'>
                <label className="block text-sm font-medium text-gray-400 mb-1">Metin Başlığı</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-700" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Proje Ata (Opsiyonel)</label>
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full bg-gray-800 p-2 rounded border border-gray-700">
                    <option value="">-- Projeye Bağlı Değil --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
            </div>
        </div>

        <textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          readOnly={isError}
          className={`w-full flex-grow p-4 bg-gray-800 border-2 border-gray-700 rounded-lg font-mono text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isError ? 'text-red-400' : ''}`}
        />
      </main>
    </div>
  );
}