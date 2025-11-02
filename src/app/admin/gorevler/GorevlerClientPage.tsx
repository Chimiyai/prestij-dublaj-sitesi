// src/app/admin/gorevler/GorevlerClientPage.tsx
'use client';

import { useState } from 'react';
import { TaskWithProject } from './page';
import { ChevronDown, Download, Upload, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

function TaskItem({ task, userRole }: { task: TaskWithProject, userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmit = async (action: string, formDataKey: string) => {
    if (!file && action !== 'COMPLETE_TASK') {
        toast.error('Lütfen bir dosya seçin.');
        return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading('İşlem yürütülüyor...');
    
    const formData = new FormData();
    formData.append('action', action);
    if(file) formData.append(formDataKey, file);

    try {
        const res = await fetch(`/api/admin/tasks/${task.id}`, {
            method: 'PATCH',
            body: formData,
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || 'İşlem başarısız.');
        }
        toast.success('Görev güncellendi!', { id: toastId });
        router.refresh(); // Sayfayı yeniden yükleyerek görev listesini güncelle
    } catch(error) {
        toast.error((error as Error).message, { id: toastId });
    } finally {
        setIsSubmitting(false);
    }
  };

  const renderActions = () => {
    switch (task.status) {
        case 'PENDING_VOICE_ACTOR':
    if (userRole !== 'VOICE_ACTOR') return null;
    return (
        <div className="mt-4 space-y-2">
            {/* 1. Metin dosyasını indirir */}
            <a href={task.scriptFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded">
                Metin Dosyasını İndir (.txt)
            </a>
            
            {/* 2. RAR veya ZIP dosyasını seçer */}
            <input type="file" accept=".rar,.zip" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
            
            {/* 3. Seçtiği dosyayı sunucuya gönderir */}
            <button 
              onClick={() => handleSubmit('SUBMIT_VOICE_RECORD', 'voiceRecordFile')} 
              disabled={isSubmitting || !file} 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded disabled:bg-gray-500"
            >
              Ses Kaydını Yükle
            </button>
        </div>
    );
    case 'PENDING_MIX_MASTER':
      if (userRole !== 'MIX_MASTER' && userRole !== 'ADMIN') return null;
      return (
           <div className="mt-4 space-y-2">
              {/* 1. Ses sanatçısının yüklediği RAR'ı indirir */}
              <a href={task.voiceRecordUrl!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded">
                  Ses Kaydını İndir (.rar)
              </a>
              
              {/* 2. Kendi mikslediği dosyayı seçer */}
              <input type="file" accept=".mp3,.wav,.zip,.rar" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600" />
              
              {/* 3. Mikslediği dosyayı sunucuya gönderir */}
              <button 
                onClick={() => handleSubmit('SUBMIT_MIXED_AUDIO', 'mixedAudioFile')} 
                disabled={isSubmitting || !file} 
                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded disabled:bg-gray-500"
              >
                Miksli Sesi Yükle
              </button>
          </div>
      );
        case 'PENDING_MODDER':
             if (userRole !== 'MODDER' && userRole !== 'ADMIN') return null;
             return (
                <div className="mt-4 space-y-2">
                    <a href={task.mixedAudioUrl!} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded"> <Download size={16}/> Miksli Sesi İndir</a>
                    <button onClick={() => handleSubmit('COMPLETE_TASK', '')} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded disabled:bg-gray-500"> <CheckCircle size={16} /> Görevi Tamamlandı Olarak İşaretle</button>
                </div>
             );
        default: return <p className="text-sm text-gray-400 mt-2">Bu görev için bekleyen bir eylem yok.</p>;
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
        <div>
          <span className="font-bold">{task.project.title}</span> - <span className="text-indigo-400">{task.characterName}</span>
          <p className="text-sm text-gray-400">Sanatçı: {task.assignedVoiceActor?.username || 'Atanmamış'}</p>
        </div>
        <div className="flex items-center gap-4">
            <span className={`px-2 py-1 text-xs rounded-full ${task.status === 'COMPLETED' ? 'bg-green-700' : 'bg-yellow-700'}`}>{task.status.replace(/_/g, ' ')}</span>
            <ChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-700">
            {renderActions()}
        </div>
      )}
    </div>
  );
}

export default function GorevlerClientPage({ initialTasks, currentUserRole }: { initialTasks: TaskWithProject[], currentUserRole: string }) {
  const [tasks, setTasks] = useState(initialTasks);

  if (tasks.length === 0) {
    return <p className="text-gray-400">Size atanmış aktif bir görev bulunmuyor.</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskItem key={task.id} task={task} userRole={currentUserRole} />
      ))}
    </div>
  );
}