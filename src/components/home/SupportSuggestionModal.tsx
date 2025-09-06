// src/components/home/SupportSuggestionModal.tsx
'use client';

import { Fragment, useState, FormEvent } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

interface SupportSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportSuggestionModal({ isOpen, onClose }: SupportSuggestionModalProps) {
  const [gameTitle, setGameTitle] = useState('');
  const [steamUrl, setSteamUrl] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (parseFloat(amount) < 1) { // Minimum destek miktarı kontrolü
        toast.error("Destek miktarı en az 1 TRY olmalıdır.");
        return;
    }
    setIsSubmitting(true);
    
    try {
        // Bu API'yi bir sonraki adımda oluşturacağız
        const response = await fetch('/api/suggestions/support', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gameTitle, steamUrl, amount: parseFloat(amount), notes }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message);

        // API'den Bynogame linki veya formu gelirse, yönlendirme burada yapılacak
        if (data.bynogameUrl) {
            window.location.href = data.bynogameUrl;
        } else {
            throw new Error("Ödeme sayfasına yönlendirilemedi.");
        }

    } catch (error) {
        toast.error((error as Error).message);
        setIsSubmitting(false);
    }
    // Başarılı yönlendirmede sayfa değişeceği için `setIsSubmitting(false)`'e gerek kalmayabilir.
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} /* ... (Overlay kısmı) ... */ ><div className="fixed inset-0 bg-black/60 backdrop-blur-sm" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} /* ... (Panel animasyonu) ... */ >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-gray-900 border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold text-white mb-4">Destek Vererek Oyun Öner</Dialog.Title>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="gameTitle-support" className="form-label">Oyunun Adı *</label>
                        <input id="gameTitle-support" value={gameTitle} onChange={(e) => setGameTitle(e.target.value)} type="text" className="form-input" required />
                    </div>
                    <div>
                        <label htmlFor="steamUrl-support" className="form-label">Steam Sayfası Linki *</label>
                        <input id="steamUrl-support" value={steamUrl} onChange={(e) => setSteamUrl(e.target.value)} type="url" className="form-input" required />
                    </div>
                    <div>
                        <label htmlFor="amount-support" className="form-label">Destek Miktarı (TRY) *</label>
                        <input id="amount-support" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" step="1" className="form-input" placeholder="Örn: 50" required />
                    </div>
                     <div>
                        <label htmlFor="notes-support" className="form-label">Ek Notlar (Opsiyonel)</label>
                        <textarea id="notes-support" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="form-input" placeholder="Oyunla ilgili eklemek istediğiniz bir şey var mı?"></textarea>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600">İptal</button>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                            {isSubmitting ? 'Yönlendiriliyor...' : 'Bynogame ile Devam Et'}
                        </button>
                    </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}