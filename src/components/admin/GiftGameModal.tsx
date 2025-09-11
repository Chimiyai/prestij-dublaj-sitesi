// src/components/admin/GiftGameModal.tsx
'use-client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { X, Gift, Trash2, Search, PackageOpen } from 'lucide-react';

// Tipler
type Game = { id: number; title: string };
type User = { id: number; username: string };

interface GiftGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  allGames: Game[];
  userGames: Game[];
  onUpdate: () => void; // Listeyi yenilemek için
}

export default function GiftGameModal({ isOpen, onClose, user, allGames, userGames, onUpdate }: GiftGameModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setProcessingId(null);
    }
  }, [isOpen]);

  if (!user) return null;

  const userGameIds = new Set(userGames.map(g => g.id));
  
  const giftableGames = allGames.filter(g => 
    !userGameIds.has(g.id) && g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const removableGames = userGames.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGift = async (projectId: number) => {
    setProcessingId(projectId);
    const toastId = toast.loading(`${user.username} kullanıcısına oyun hediye ediliyor...`);
    try {
        const res = await fetch(`/api/admin/users/${user.id}/gift`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success(data.message, { id: toastId });
        onUpdate();
    } catch (err) {
        toast.error((err as Error).message, { id: toastId });
    } finally {
        setProcessingId(null);
    }
  };

  const handleRemove = async (projectId: number) => {
    if (!confirm("Bu oyunu kullanıcının kütüphanesinden kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    setProcessingId(projectId);
    const toastId = toast.loading(`Oyun kütüphaneden kaldırılıyor...`);
    try {
        const res = await fetch(`/api/admin/users/${user.id}/library/${projectId}`, {
            method: 'DELETE',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast.success(data.message, { id: toastId });
        onUpdate();
    } catch (err) {
        toast.error((err as Error).message, { id: toastId });
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                        <span className="font-bold text-indigo-500">{user.username}</span> için Oyun Yönetimi
                    </Dialog.Title>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Arama Kutusu */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Oyun ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full form-input pl-10"
                        />
                    </div>
                    
                    {/* İki Sütunlu Yapı */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh] overflow-y-auto pr-2">
                        {/* Sol Sütun: Hediye Edilebilecek Oyunlar */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Hediye Edilebilecekler</h4>
                            {giftableGames.length > 0 ? (
                                <ul className="space-y-2">
                                    {giftableGames.map(game => (
                                        <li key={`gift-${game.id}`} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{game.title}</span>
                                            <button onClick={() => handleGift(game.id)} disabled={processingId === game.id} className="p-1.5 text-green-500 hover:text-green-400 disabled:opacity-50">
                                                <Gift className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-6 text-sm text-gray-500">
                                    <PackageOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    Hediye edilecek oyun bulunamadı.
                                </div>
                            )}
                        </div>

                        {/* Sağ Sütun: Kullanıcının Kütüphanesi */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Kullanıcının Kütüphanesi</h4>
                            {removableGames.length > 0 ? (
                                <ul className="space-y-2">
                                    {removableGames.map(game => (
                                        <li key={`remove-${game.id}`} className="flex items-center justify-between p-2 rounded-md bg-gray-50 dark:bg-gray-800/50">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{game.title}</span>
                                            <button onClick={() => handleRemove(game.id)} disabled={processingId === game.id} className="p-1.5 text-red-500 hover:text-red-400 disabled:opacity-50">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                 <div className="text-center py-6 text-sm text-gray-500">
                                    <PackageOpen className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    Kullanıcının kütüphanesi boş.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                    <button onClick={onClose} className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
                        Kapat
                    </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}