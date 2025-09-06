// src/app/admin/basvurular/ApplicationActions.tsx (DOĞRU CLIENT COMPONENT HALİ)
'use client';

import { useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { getCloudinaryImageUrlOptimized } from '@/lib/cloudinary';
import { EnrichedApplication } from './page'; // Tipi page.tsx'den import ediyoruz

interface ApplicationActionsProps {
  application: EnrichedApplication;
}

export default function ApplicationActions({ application }: ApplicationActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const appData = application.parsedDetails;

  const handleUpdateStatus = async (newStatus: 'APPROVED' | 'REJECTED') => {
    setIsProcessing(true);
    const toastId = toast.loading(`Başvuru "${newStatus}" olarak işaretleniyor...`);
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      
      toast.success('Başvuru durumu güncellendi!', { id: toastId });
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error((error as Error).message, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const profileImageUrl = getCloudinaryImageUrlOptimized(appData.profileImagePublicId, { width: 96, height: 96, crop: 'fill', gravity: 'face' });

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300" title="İncele">
        <EyeIcon className="w-5 h-5" />
      </button>
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-black/60 backdrop-blur-sm" /></Transition.Child>
          <div className="fixed inset-0 overflow-y-auto"><div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-bold p-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
                    <Image src={profileImageUrl || '/images/default-avatar.png'} alt="Profil Resmi" width={48} height={48} className="rounded-full bg-gray-200 dark:bg-gray-700 object-cover" />
                    <span>{appData.firstName} {appData.lastName}'ın Başvurusu</span>
                </Dialog.Title>
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                   <p><strong className="font-semibold text-gray-500 w-32 inline-block">Kullanıcı Adı:</strong> {application.user.username}</p>
                   <p><strong className="font-semibold text-gray-500 w-32 inline-block">Unvanlar:</strong> {appData.roles.join(', ')}</p>
                   <div><strong className="font-semibold text-gray-500 block mb-1">Bio:</strong><p className="text-sm p-3 bg-gray-100 dark:bg-gray-800 rounded-md whitespace-pre-wrap">{appData.bio || 'Belirtilmemiş'}</p></div>
                   <p><strong className="font-semibold text-gray-500 w-32 inline-block">Çalışma Örneği:</strong> <a href={appData.workSampleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{appData.workSampleUrl}</a></p>
                   <div><strong className="font-semibold text-gray-500 block mb-1">Sosyal Medya:</strong>
                      <ul className="list-disc list-inside space-y-1 pl-2">
                          {appData.socialLinks.length > 0 ? appData.socialLinks.map((link: any) => <li key={link.platform}><span className="font-medium">{link.platform}:</span> <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">{link.url}</a></li>) : <li className="list-none">Link eklenmemiş.</li>}
                      </ul>
                   </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium ...">Kapat</button>
                  {application.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus('REJECTED')} disabled={isProcessing} className="flex items-center ...">Reddet</button>
                      <button onClick={() => handleUpdateStatus('APPROVED')} disabled={isProcessing} className="flex items-center ...">Onayla</button>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div></div>
        </Dialog>
      </Transition>
    </>
  );
}