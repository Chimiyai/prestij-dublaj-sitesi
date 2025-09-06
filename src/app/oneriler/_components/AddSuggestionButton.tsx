// src/app/oneriler/_components/AddSuggestionButton.tsx
'use client';

import { useState, Fragment, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Plus } from 'lucide-react';

interface AddSuggestionButtonProps {
    isUserLoggedIn: boolean;
}

export function AddSuggestionButton({ isUserLoggedIn }: AddSuggestionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const openModal = () => {
      if (!isUserLoggedIn) {
          toast.error('Öneri eklemek için giriş yapmalısınız.');
          return;
      }
      setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!gameTitle.trim() || !steamUrl.trim()) { // Steam URL'sini de kontrol et
        toast.error("Oyun adı ve Steam URL'si zorunludur.");
        return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/suggestions/community', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameTitle, steamUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // API'den gelen mesaja göre toast göster
      toast.success(data.message); 
      
      closeModal();
      router.refresh();
    } catch (error) {
        toast.error((error as Error).message);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <button onClick={openModal} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105">
        <Plus className="w-5 h-5"/>
        Yeni Öneri Ekle
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          {/* ... (Overlay ve diğer Transition.Child'lar ApplicationActions'daki gibi) ... */}
          <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold text-white mb-4">Yeni Oyun Önerisi</Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="gameTitle" className="form-label">Oyunun Adı *</label>
                        <input id="gameTitle" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} type="text" className="form-input" required />
                    </div>
                     <div>
                        {/* Label'ı ve input'u zorunlu olarak güncelle */}
                        <label htmlFor="steamUrl" className="form-label">Steam Sayfası Linki *</label>
                        <input id="steamUrl" value={steamUrl} onChange={(e) => setSteamUrl(e.target.value)} type="url" className="form-input" required />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">İptal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                            {isSubmitting ? 'Ekleniyor...' : 'Öneriyi Ekle'}
                        </button>
                    </div>
                </form>
              </Dialog.Panel>
          </div></div>
        </Dialog>
      </Transition>
    </>
  );
}