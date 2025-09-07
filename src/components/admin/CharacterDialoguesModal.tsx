// src/components/admin/CharacterDialoguesModal.tsx
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, FormEvent, ChangeEvent } from 'react';
import toast from 'react-hot-toast';
import { XMarkIcon, TrashIcon, PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { WaveformPlayer } from '@/components/ui/WaveformPlayer';

interface Dialogue {
  id: number;
  dialogueText: string;
  originalVoiceUrl: string | null;
}

interface CharacterDialoguesModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: { id: number; name: string; } | null;
}

export default function CharacterDialoguesModal({ isOpen, onClose, character }: CharacterDialoguesModalProps) {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [newDialogueText, setNewDialogueText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && character) {
      setIsLoading(true);
      // Bu API'yi birazdan oluşturacağız
      fetch(`/api/admin/characters/${character.id}/dialogues`)
        .then(res => res.json())
        .then(data => setDialogues(data))
        .catch(err => toast.error("Diyaloglar yüklenemedi."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, character]);

  const handleAddDialogue = async (e: FormEvent) => {
    e.preventDefault();
    if (!newDialogueText.trim() || !character) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dialogues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: character.id,
          dialogueText: newDialogueText,
        }),
      });
      const newDialogue = await response.json();
      if (!response.ok) throw new Error(newDialogue.message || 'Diyalog eklenemedi.');
      
      setDialogues(prev => [...prev, newDialogue]);
      setNewDialogueText('');
      toast.success('Diyalog eklendi.');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteDialogue = async (dialogueId: number) => {
    if (!confirm('Bu diyaloğu silmek istediğinizden emin misiniz?')) return;
    setIsLoading(true);
    try {
       const response = await fetch(`/api/admin/dialogues/${dialogueId}`, { method: 'DELETE' });
       if (!response.ok) throw new Error('Diyalog silinemedi.');
       setDialogues(prev => prev.filter(d => d.id !== dialogueId));
       toast.success('Diyalog silindi.');
    } catch(error) {
        toast.error((error as Error).message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, dialogueId: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(dialogueId);
    const toastId = toast.loading('Referans ses yükleniyor...');

    const formData = new FormData();
    formData.append('audioFile', file);
    formData.append('dialogueId', dialogueId.toString());

    try {
        const response = await fetch('/api/admin/dialogues/upload-voice', {
            method: 'POST',
            body: formData,
        });
        const updatedDialogue = await response.json();
        if (!response.ok) throw new Error(updatedDialogue.message);

        // Arayüzdeki listeyi yeni URL ile güncelle
        setDialogues(prev => prev.map(d => d.id === dialogueId ? updatedDialogue : d));
        toast.success('Referans ses başarıyla yüklendi.', { id: toastId });

    } catch (error) {
        toast.error((error as Error).message, { id: toastId });
    } finally {
        setUploadingId(null);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} /* ... */ ><div className="fixed inset-0 bg-black/60" /></Transition.Child>
        <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} /* ... */ >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold p-4 sm:p-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                  <span>"{character?.name}" Karakterinin Diyalogları</span>
                  <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                </Dialog.Title>
                <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Mevcut Diyaloglar */}
                    {isLoading && <p>Yükleniyor...</p>}
                    {!isLoading && dialogues.length === 0 && <p className="text-gray-500">Bu karakter için henüz diyalog eklenmemiş.</p>}
                    <ul className="space-y-4">
                        {dialogues.map(dialogue => (
                            <li key={dialogue.id} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md space-y-3">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{dialogue.dialogueText}</p>
                                    <button onClick={() => handleDeleteDialogue(dialogue.id)} className="..."><TrashIcon className="w-4 h-4"/></button>
                                </div>
                                
                                {/* <<< YENİ BÖLÜM: OYNATICI VE YÜKLEME ALANI <<< */}
                                {dialogue.originalVoiceUrl ? (
                                    <WaveformPlayer audioUrl={dialogue.originalVoiceUrl} />
                                ) : (
                                    <label htmlFor={`upload-${dialogue.id}`} className="flex items-center justify-center w-full px-3 py-2 text-xs text-center text-gray-500 bg-gray-200 dark:bg-gray-700/50 rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700">
                                        {uploadingId === dialogue.id ? (
                                            <span>Yükleniyor...</span>
                                        ) : (
                                            <>
                                                <ArrowUpTrayIcon className="w-4 h-4 mr-2"/>
                                                Referans Ses Yükle (.mp3, .wav)
                                            </>
                                        )}
                                        <input 
                                            id={`upload-${dialogue.id}`} 
                                            type="file" 
                                            className="sr-only" 
                                            accept="audio/mpeg, audio/wav, audio/ogg"
                                            onChange={(e) => handleFileUpload(e, dialogue.id)}
                                            disabled={uploadingId === dialogue.id}
                                        />
                                    </label>
                                )}
                                {/* ----------------------------------------- */}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleAddDialogue} className="flex items-end gap-2">
                        <textarea value={newDialogueText} onChange={e => setNewDialogueText(e.target.value)} placeholder="Yeni diyalog metni..." className="form-input flex-grow" rows={2}/>
                        <button type="submit" disabled={!newDialogueText.trim() || isLoading} className="btn-primary h-[58px] px-4">
                           <PlusIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
        </div></div>
      </Dialog>
    </Transition>
  );
}