// src/components/admin/ModUploader.tsx
'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface Props {
  projectId: number;
  projectSlug: string;
  currentDownloadUrl: string | null;
}

export default function ModUploader({ projectId, projectSlug, currentDownloadUrl }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadProgress(0); // Yeni dosya seçildiğinde ilerlemeyi sıfırla
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Lütfen önce bir dosya seçin.');
      return;
    }

    const formData = new FormData();
    formData.append('modFile', selectedFile);
    formData.append('projectId', projectId.toString());
    formData.append('projectSlug', projectSlug);

    startTransition(async () => {
      try {
        const response = await axios.post('/api/admin/projects/upload-mod', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            setUploadProgress(percentCompleted);
          },
        });

        toast.success(response.data.message || 'Yükleme başarılı!');
        // Başarılı olunca seçili dosyayı temizle
        setSelectedFile(null);
        // TODO: Sayfanın, yeni downloadUrl'i göstermesi için yeniden yüklenmesini tetikle (router.refresh())
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Yükleme sırasında bir hata oluştu.');
        setUploadProgress(0); // Hata durumunda ilerlemeyi sıfırla
      }
    });
  };

  return (
    <div className="border-b border-gray-900/10 dark:border-gray-700 pb-10">
      <h2 className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">Mod Dosyası Yönetimi</h2>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Projenin mod dosyasını (.zip, .rar) buradan VDS'e yükleyebilirsiniz. Yükleme tamamlandığında indirme linki otomatik olarak güncellenir.
      </p>
      
      {currentDownloadUrl && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md text-xs">
          <span className="font-semibold">Mevcut İndirme Linki:</span> <a href={currentDownloadUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{currentDownloadUrl}</a>
        </div>
      )}
      
      <div className="mt-6 flex items-center gap-4">
        <label htmlFor="mod-file-input" className="cursor-pointer p-3 bg-gray-200 dark:bg-gray-700/50 rounded-md border-2 border-dashed border-gray-400 dark:border-gray-600 hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <input id="mod-file-input" type="file" className="sr-only" onChange={handleFileSelect} accept=".zip,.rar,.7z" />
          <UploadCloud className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </label>
        
        {selectedFile ? (
          <div className="flex-grow flex items-center gap-2">
            <File className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-800 dark:text-gray-200">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)}><X className="w-4 h-4 text-red-500"/></button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Bir dosya seçin...</p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%`, transition: 'width 0.5s ease' }}></div>
          </div>
          <button 
            onClick={handleUpload} 
            disabled={isPending || uploadProgress === 100}
            className="mt-4 w-full sm:w-auto bg-indigo-600 ... flex items-center gap-2"
          >
            {isPending ? 'Yükleniyor...' : (uploadProgress === 100 ? 'Başarılı!' : `Şimdi Yükle (%${uploadProgress})`)}
            {uploadProgress === 100 && <CheckCircle size={16}/>}
          </button>
        </div>
      )}
    </div>
  );
}