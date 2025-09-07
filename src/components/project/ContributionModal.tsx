// src/components/project/ContributionModal.tsx (HATALARI GİDERİLDİ)
'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, ChangeEvent, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { WaveformPlayer } from '@/components/ui/WaveformPlayer';
import { ArrowUpTrayIcon, XMarkIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import Link from 'next/link';

// Tipleri bu dosyanın kendi içinde tanımlayalım, import sorunlarını önleyelim
interface UserSession {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
}
interface Submission {
    id: number;
    audioFilePublicId: string;
}
interface Dialogue {
    id: number;
    dialogueText: string;
    originalVoiceUrl: string | null;
    currentUserSubmissions?: Submission[];
}
interface Character {
    id: number;
    name: string;
    dialogues: Dialogue[];
}
interface ContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    character: Character | null;
    projectId: number;
    user: UserSession | null;
}

export function ContributionModal({ isOpen, onClose, character, projectId, user }: ContributionModalProps) {
    const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const [showNameWarning, setShowNameWarning] = useState(false);
    
    // <<< YENİ KONTROL: Kullanıcının adı/soyadı var mı?
    const canSubmit = !!(user?.firstName && user.lastName);

    // Modal kapandığında veya karakter değiştiğinde state'i sıfırla
    useEffect(() => {
        if (!isOpen) {
            setSelectedDialogue(null);
            setAudioFile(null);
            setAudioPreviewUrl(null);
            setNotes('');
        } else if (character?.dialogues?.length) {
            // Modal açıldığında otomatik olarak ilk diyaloğu seç
            setSelectedDialogue(character.dialogues[0]);
        }
    }, [isOpen, character]);

    // Kullanıcı yeni bir ses dosyası seçtiğinde
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAudioFile(e.target.files?.[0] || null);
    };

    const handleSubmit = async () => {
        if (!user) {
            toast.error("Katkı göndermek için giriş yapmalısınız.");
            return;
        }
        
        // <<< YENİ VE BASİT KONTROL MANTIĞI <<<
        const isProfileComplete = !!(user.firstName && user.lastName);
        if (!isProfileComplete) {
            setShowNameWarning(true); // Uyarıyı göster
            toast.error("Devam etmek için profil bilgilerinizi tamamlamalısınız.");
            return;
        }
        // ------------------------------------
        
        if (!selectedDialogue) { toast.error("Lütfen bir diyalog seçin."); return; }
        if (!audioFile) { toast.error("Lütfen bir ses dosyası yükleyin."); return; }

        setIsSubmitting(true);
        setShowNameWarning(false); // Gönderim başlarsa uyarıyı gizle
        const toastId = toast.loading('Ses dosyası yükleniyor...');

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('audioFile', audioFile);
            uploadFormData.append('projectId', projectId.toString());
            uploadFormData.append('characterName', character?.name || 'unknown');

            const uploadResponse = await fetch('/api/contribution-upload', {
                method: 'POST', body: uploadFormData,
            });
            const uploadResult = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadResult.message || 'Ses dosyası yüklenemedi.');
            
            toast.loading('Katkınız kaydediliyor...', { id: toastId });

            const submissionResponse = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dialogueId: selectedDialogue.id,
                    audioFilePublicId: uploadResult.publicId,
                    notes: notes,
                }),
            });
            const submissionResult = await submissionResponse.json();
            if (!submissionResponse.ok) throw new Error(submissionResult.message || 'Katkı kaydedilemedi.');
            toast.success("Yeni kaydınız başarıyla gönderildi!", { id: toastId });
            setAudioFile(null); // Formu temizle
            router.refresh();

        } catch (error) {
            toast.error((error as Error).message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };



    const handleDeleteSubmission = async (submissionId: number) => {
        if (!confirm('Bu kaydı kalıcı olarak silmek istediğinizden emin misiniz?')) return;
        try {
            const response = await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Kayıt silinemedi.');
            }
            toast.success('Kaydınız başarıyla silindi.');
            router.refresh();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
             <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
             <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-4xl h-[85vh] flex flex-col transform overflow-hidden rounded-xl bg-gray-900 border border-gray-800 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="flex-shrink-0 text-lg font-bold p-4 text-white border-b border-gray-800 flex justify-between items-center">
                        <span>"{character?.name}" için Katkıda Bulun</span>
                        <button onClick={onClose}><XMarkIcon className="w-6 h-6"/></button>
                    </Dialog.Title>
                    <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        {/* Sol Taraf: Diyalog Listesi */}
                        <div className="w-full md:w-1/3 p-4 border-r border-gray-800 overflow-y-auto">
                            <h4 className="font-semibold mb-2 text-gray-300">Diyaloglar</h4>
                            <ul className="space-y-2">
                            {character?.dialogues.map((d: Dialogue) => (
                                    <li key={d.id} onClick={() => setSelectedDialogue(d)}
                                        className={`p-2 rounded-md cursor-pointer text-sm transition-colors ${selectedDialogue?.id === d.id ? 'bg-indigo-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                                        {d.dialogueText}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Sağ Taraf: Detay ve Yükleme */}
                        <div className="w-full md:w-2/3 p-4 flex flex-col overflow-y-auto">
                            {selectedDialogue ? (
                                <>
                                    <div className="flex-grow space-y-6 overflow-y-auto pr-2">
                                        <div>
                                            <label className="form-label text-base">Diyalog Metni</label>
                                            <p className="text-lg bg-black/30 p-4 rounded-md whitespace-pre-wrap text-white">{selectedDialogue.dialogueText}</p>
                                        </div>
                                        
                                        {selectedDialogue.originalVoiceUrl && (
                                            <div>
                                                <label className="form-label text-base">Orijinal Sesi Dinle (Referans)</label>
                                                <WaveformPlayer audioUrl={selectedDialogue.originalVoiceUrl} />
                                            </div>
                                        )}
                                        <div className="border-t border-gray-700 pt-4">
                                            <h4 className="form-label text-base">Mevcut Kayıtların ({selectedDialogue.currentUserSubmissions?.length || 0})</h4>
                                            {selectedDialogue.currentUserSubmissions && selectedDialogue.currentUserSubmissions.length > 0 ? (
                                                <ul className="space-y-3 mt-2">
                                                    {selectedDialogue.currentUserSubmissions.map((sub: any) => (
                                                        <li key={sub.id} className="flex items-center gap-2">
                                                            <WaveformPlayer audioUrl={getCloudinaryImageUrlOptimized(sub.audioFilePublicId, { resource_type: 'video' })} />
                                                            <button onClick={() => handleDeleteSubmission(sub.id)} className="p-2 text-red-500 hover:text-red-400"><TrashIcon className="w-5 h-5"/></button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-500 mt-2">Bu diyalog için henüz bir kayıt göndermediniz.</p>
                                            )}
                                        </div>
                                        
                                        <div className="border-t border-gray-700 pt-4">
                                            <label htmlFor="audio-upload" className="form-label text-base">Yeni Kayıt Yükle</label>
                                            <input id="audio-upload" type="file" accept="audio/mpeg, audio/wav, audio/ogg" onChange={handleFileChange} className="form-input" />
                                            {audioPreviewUrl && (
                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-400 mb-2">Yüklenen Kaydın Önizlemesi:</p>
                                                    <WaveformPlayer audioUrl={audioPreviewUrl} />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="notes" className="form-label">Ek Notlar (Opsiyonel)</label>
                                            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="form-input" placeholder="Kayıtla ilgili belirtmek istediğiniz bir şey..."></textarea>
                                        </div>

                                    </div>
                                    {/* <<< YENİ BÖLÜM: UYARI VE GÖNDER BUTONU <<< */}
                                    <div className="flex-shrink-0 pt-4 flex flex-col items-end gap-3 mt-4">
                                    {showNameWarning && (
                                            <div className="w-full flex items-start gap-3 p-3 text-sm text-yellow-200 bg-yellow-900/50 border border-yellow-500/30 rounded-lg">
                                                <ExclamationTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-yellow-400"/>
                                                <div>
                                                    <p className="font-semibold">Profil Bilgileri Eksik</p>
                                                    <p className="text-xs mt-1">
                                                        Onaylanan katkıların size atfedilebilmesi için bir sanatçı profili oluşturulacaktır. Lütfen devam etmeden önce 
                                                        <Link href="/profil" className="font-bold underline hover:text-white mx-1">profil sayfanızdan</Link> 
                                                        adınızı ve soyadınızı belirtin.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <button 
                                            onClick={handleSubmit} 
                                            disabled={isSubmitting || !audioFile}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUpTrayIcon className="w-5 h-5"/>
                                            {isSubmitting ? 'Yükleniyor...' : 'Yeni Kaydı Gönder'}
                                        </button>
                                    </div>
                                    {/* ------------------------------------------- */}
                                </>
                            ) : (
                                <div className="flex-grow flex items-center justify-center text-gray-500">Lütfen seslendirmek için bir diyalog seçin.</div>
                            )}
                        </div>
                    </div>
                </Dialog.Panel>
             </div></div>
        </Dialog>
        </Transition>
    );
}