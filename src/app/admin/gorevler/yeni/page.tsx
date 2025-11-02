// src/app/admin/gorevler/yeni/page.tsx
'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Upload, PlusCircle } from 'lucide-react';

// Tipleri tanımlayalım
interface Project { id: number; title: string; }
interface User { id: number; username: string; }

export default function NewTaskPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [voiceActors, setVoiceActors] = useState<User[]>([]);
  
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [selectedVoiceActorId, setSelectedVoiceActorId] = useState('');
  const [scriptFile, setScriptFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Sayfa yüklendiğinde projeleri ve seslendirme sanatçılarını çek
  useEffect(() => {
    async function fetchData() {
      const projectsRes = await fetch('/api/projects?limit=500');
      const projectsData = await projectsRes.json();
      setProjects(projectsData.projects || []);

      // --- DEĞİŞİKLİK BURADA ---
      // API isteğini doğru adres olan '/api/admin/users' olarak güncelledik.
      const usersRes = await fetch('/api/admin/users?role=VOICE_ACTOR');
      if (usersRes.ok) { // İsteğin başarılı olup olmadığını kontrol et
        const usersData = await usersRes.json();
        setVoiceActors(usersData || []);
      } else {
        console.error("Seslendirme sanatçıları çekilemedi:", usersRes.statusText);
        setVoiceActors([]); // Hata durumunda listeyi boşalt
      }
    }
    fetchData();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScriptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !characterName || !selectedVoiceActorId || !scriptFile) {
      toast.error('Lütfen tüm alanları doldurun ve bir dosya seçin.');
      return;
    }
    
    setIsSubmitting(true);
    const toastId = toast.loading('Görev oluşturuluyor...');
    
    const formData = new FormData();
    formData.append('projectId', selectedProjectId);
    formData.append('characterName', characterName);
    formData.append('assignedVoiceActorId', selectedVoiceActorId);
    formData.append('scriptFile', scriptFile);

    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Görev oluşturulamadı.');
      }
      
      toast.success('Yeni görev başarıyla oluşturuldu!', { id: toastId });
      router.push('/admin/gorevler');
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">Yeni Seslendirme Görevi Oluştur</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-gray-800 p-8 rounded-lg">
        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-1">Proje</label>
          <select id="project" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
            <option value="">-- Proje Seçin --</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="character" className="block text-sm font-medium text-gray-300 mb-1">Karakter Adı</label>
          <input type="text" id="character" value={characterName} onChange={e => setCharacterName(e.target.value)} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white" />
        </div>
        <div>
          <label htmlFor="voice-actor" className="block text-sm font-medium text-gray-300 mb-1">Atanacak Seslendirme Sanatçısı</label>
          <select id="voice-actor" value={selectedVoiceActorId} onChange={e => setSelectedVoiceActorId(e.target.value)} required
            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white">
            <option value="">-- Sanatçı Seçin --</option>
            {voiceActors.map(va => <option key={va.id} value={va.id}>{va.username}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Diyalog Dosyası (.txt)</label>
          <div className="mt-2 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-indigo-400 hover:text-indigo-300 p-1">
                        <span>Dosya yükle</span>
                        <input id="file-upload" type="file" className="sr-only" accept=".txt" required onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">veya sürükleyip bırak</p>
                </div>
                {scriptFile ? (
                     <p className="text-xs text-green-400">{scriptFile.name}</p>
                ) : (
                    <p className="text-xs text-gray-500">Sadece .txt dosyaları</p>
                )}
            </div>
          </div>
        </div>
        <div className="pt-5">
          <button type="submit" disabled={isSubmitting}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
            <PlusCircle size={18} />
            {isSubmitting ? 'Oluşturuluyor...' : 'Görevi Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}